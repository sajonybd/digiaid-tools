function getOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function getDomainCandidates(hostname) {
  const parts = hostname.split(".");
  const baseDomain = parts.length >= 2 ? parts.slice(-2).join(".") : hostname;
  return [...new Set([hostname, baseDomain, `.${baseDomain}`])];
}

function cookieUrlFromCookie(cookie, fallbackUrl) {
  if (cookie.url) return cookie.url;
  if (!cookie.domain) return fallbackUrl;
  const cleanDomain = cookie.domain.replace(/^\./, "");
  const protocol = cookie.secure ? "https://" : "http://";
  return `${protocol}${cleanDomain}${cookie.path || "/"}`;
}

function waitForTabComplete(tabId, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error("Timed out waiting for tab load"));
    }, timeoutMs);

    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };

    chrome.tabs.onUpdated.addListener(listener);
  });
}

async function setCookies(targetUrl, cookieData) {
  const cookies = Array.isArray(cookieData) ? cookieData : cookieData?.cookies;
  if (!Array.isArray(cookies)) {
    throw new Error("Cookie payload must be an array or { cookies: [] }.");
  }

  for (const cookie of cookies) {
    if (!cookie?.name) continue;

    const cookieUrl = cookieUrlFromCookie(cookie, targetUrl);

    let cookieDomain = cookie.domain;
    let cookiePath = cookie.path || "/";
    let cookieSecure = !!cookie.secure;

    if (cookie.name.startsWith("__Host-")) {
      cookieDomain = undefined;
      cookiePath = "/";
      cookieSecure = true;
    } else if (cookie.name.startsWith("__Secure-")) {
      cookieSecure = true;
    }

    await chrome.cookies.set({
      url: cookieUrl,
      name: cookie.name,
      value: cookie.value || "",
      domain: cookieDomain,
      path: cookiePath,
      secure: cookieSecure,
      httpOnly: !!cookie.httpOnly,
      sameSite: cookie.sameSite,
      expirationDate: cookie.expirationDate,
    });
  }
}

async function clearCookiesForTarget(targetUrl) {
  const url = new URL(targetUrl);
  const domainCandidates = getDomainCandidates(url.hostname);

  const cookieBuckets = await Promise.all([
    chrome.cookies.getAll({ url: targetUrl }),
    ...domainCandidates.map((domain) => chrome.cookies.getAll({ domain })),
  ]);

  const dedup = new Map();
  for (const cookie of cookieBuckets.flat()) {
    const key = `${cookie.storeId || ""}|${cookie.domain}|${cookie.path}|${cookie.name}`;
    if (!dedup.has(key)) dedup.set(key, cookie);
  }

  for (const cookie of dedup.values()) {
    await chrome.cookies.remove({
      url: cookieUrlFromCookie(cookie, targetUrl),
      name: cookie.name,
      storeId: cookie.storeId,
    });
  }
}

async function clearWebStorageAndIndexedDB(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: async () => {
      try {
        window.localStorage.clear();
      } catch {}
      try {
        window.sessionStorage.clear();
      } catch {}

      try {
        if (!("indexedDB" in window)) return;

        if (typeof indexedDB.databases === "function") {
          const dbs = await indexedDB.databases();
          await Promise.all(
            (dbs || [])
              .map((d) => d && d.name)
              .filter(Boolean)
              .map(
                (name) =>
                  new Promise((resolve) => {
                    const req = indexedDB.deleteDatabase(name);
                    req.onsuccess = () => resolve(true);
                    req.onerror = () => resolve(false);
                    req.onblocked = () => resolve(false);
                  })
              )
          );
        }
      } catch {}
    },
  });
}

async function setLocalStorage(tabId, storageData) {
  const entries = Array.isArray(storageData)
    ? storageData
    : Array.isArray(storageData?.items)
      ? storageData.items
      : Object.entries(storageData || {}).map(([key, value]) => ({ key, value }));

  await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: (items) => {
      const normalized = Array.isArray(items) ? items : [];
      normalized.forEach((item) => {
        if (!item) return;
        const key = item.key;
        if (typeof key !== "string" || !key.length) return;
        const value =
          typeof item.value === "string" ? item.value : JSON.stringify(item.value ?? "");
        window.localStorage.setItem(key, value);
      });
    },
    args: [entries],
  });
}

async function setIndexedDB(tabId, indexedDbData) {
  await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: async (payload) => {
      const databases = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.databases)
          ? payload.databases
          : [];

      for (const dbSpec of databases) {
        if (!dbSpec?.name) continue;
        const stores = Array.isArray(dbSpec.stores) ? dbSpec.stores : [];
        const version = Number(dbSpec.version || 1);

        await new Promise((resolve, reject) => {
          const openReq = indexedDB.open(dbSpec.name, version);

          openReq.onupgradeneeded = () => {
            const db = openReq.result;
            stores.forEach((storeSpec) => {
              if (!storeSpec?.name) return;
              if (!db.objectStoreNames.contains(storeSpec.name)) {
                db.createObjectStore(storeSpec.name, {
                  keyPath: storeSpec.keyPath,
                  autoIncrement: !!storeSpec.autoIncrement,
                });
              }
            });
          };

          openReq.onerror = () => reject(openReq.error || new Error("Failed to open IndexedDB"));
          openReq.onsuccess = () => {
            const db = openReq.result;
            if (!stores.length) {
              db.close();
              resolve();
              return;
            }

            const storeNames = stores.map((s) => s.name).filter(Boolean);
            if (!storeNames.length) {
              db.close();
              resolve();
              return;
            }

            const tx = db.transaction(storeNames, "readwrite");

            stores.forEach((storeSpec) => {
              if (!storeSpec?.name) return;
              const store = tx.objectStore(storeSpec.name);
              const records = Array.isArray(storeSpec.records) ? storeSpec.records : [];
              const hasInlineKeyPath = !!storeSpec.keyPath;
              records.forEach((record) => {
                if (!record) return;

                const hasExplicitKey = Object.prototype.hasOwnProperty.call(record, "key");
                const rawValue = Object.prototype.hasOwnProperty.call(record, "value")
                  ? record.value
                  : record;

                if (hasInlineKeyPath) {
                  // For keyPath stores (e.g. Firebase), key must be inside the value object.
                  if (
                    hasExplicitKey &&
                    rawValue &&
                    typeof rawValue === "object" &&
                    typeof storeSpec.keyPath === "string" &&
                    !Object.prototype.hasOwnProperty.call(rawValue, storeSpec.keyPath)
                  ) {
                    rawValue[storeSpec.keyPath] = record.key;
                  }
                  store.put(rawValue);
                  return;
                }

                if (hasExplicitKey) {
                  store.put(rawValue, record.key);
                } else {
                  store.put(rawValue);
                }
              });
            });

            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onerror = () => reject(tx.error || new Error("Failed to write IndexedDB records"));
          };
        });
      }
    },
    args: [indexedDbData],
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== "APPLY_TOOL_ACCESS") return false;

  (async () => {
    try {
      const payload = message.payload || {};
      const targetUrl = payload.targetUrl;
      const loginMethod = payload.loginMethod || "none";
      const loginData = payload.loginData;

      if (!targetUrl) {
        throw new Error("Missing target URL");
      }

      if (!getOrigin(targetUrl)) {
        throw new Error("Invalid target URL");
      }

      const newTab = await chrome.tabs.create({ url: targetUrl, active: true });
      if (!newTab?.id) {
        throw new Error("Failed to create target tab");
      }

      await waitForTabComplete(newTab.id);
      await clearCookiesForTarget(targetUrl);
      await clearWebStorageAndIndexedDB(newTab.id);

      if (loginMethod === "cookies") {
        await setCookies(targetUrl, loginData);
      } else if (loginMethod === "localstorage") {
        await setLocalStorage(newTab.id, loginData);
      } else if (loginMethod === "indexeddb") {
        await setIndexedDB(newTab.id, loginData);
      }

      await chrome.tabs.reload(newTab.id);
      sendResponse({ ok: true });
    } catch (error) {
      sendResponse({ ok: false, error: error?.message || "Failed to apply tool access data" });
    }
  })();

  return true;
});
