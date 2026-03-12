const els = {
  site: document.getElementById("site"),
  status: document.getElementById("status"),
  output: document.getElementById("output"),
  copyBtn: document.getElementById("copyBtn"),
  exportCookies: document.getElementById("exportCookies"),
  exportLocalStorage: document.getElementById("exportLocalStorage"),
  exportIndexedDB: document.getElementById("exportIndexedDB"),
  exportAll: document.getElementById("exportAll"),
};

function setStatus(message) {
  els.status.textContent = message || "";
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id || !tab.url) {
    throw new Error("No active tab found.");
  }
  return tab;
}

function safeJson(value) {
  return JSON.stringify(value, null, 2);
}

async function exportCookies(tabUrl) {
  const hostname = new URL(tabUrl).hostname;
  const parts = hostname.split(".");
  const baseDomain = parts.length >= 2 ? parts.slice(-2).join(".") : hostname;
  const domainCandidates = [...new Set([hostname, baseDomain, `.${baseDomain}`])];

  const cookieBuckets = await Promise.all([
    chrome.cookies.getAll({ url: tabUrl }),
    ...domainCandidates.map((domain) => chrome.cookies.getAll({ domain })),
  ]);

  const merged = cookieBuckets.flat();
  const dedup = new Map();

  for (const c of merged) {
    const key = `${c.storeId || ""}|${c.domain}|${c.path}|${c.name}`;
    if (!dedup.has(key)) {
      dedup.set(key, c);
    }
  }

  return Array.from(dedup.values()).map((c) => ({
    domain: c.domain,
    expirationDate: c.expirationDate,
    hostOnly: !!c.hostOnly,
    httpOnly: !!c.httpOnly,
    name: c.name,
    path: c.path,
    sameSite: c.sameSite && c.sameSite !== "unspecified" ? c.sameSite.toLowerCase() : null,
    secure: !!c.secure,
    session: !!c.session,
    storeId: null,
    value: c.value,
  }));
}

async function executeInTab(tabId, func) {
  const result = await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func,
  });
  return result?.[0]?.result;
}

async function exportLocalStorage(tabId) {
  return executeInTab(tabId, () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      data[key] = localStorage.getItem(key);
    }
    return data;
  });
}

async function exportIndexedDB(tabId) {
  return executeInTab(tabId, async () => {
    if (!("indexedDB" in window)) {
      return { databases: [] };
    }

    if (typeof indexedDB.databases !== "function") {
      return {
        databases: [],
        warning: "indexedDB.databases() is not supported in this browser.",
      };
    }

    const dbList = await indexedDB.databases();
    const exportData = { databases: [] };

    for (const meta of dbList) {
      if (!meta?.name) continue;

      const dbDump = await new Promise((resolve, reject) => {
        const request = indexedDB.open(meta.name);

        request.onerror = () => reject(request.error || new Error("Failed to open DB"));
        request.onsuccess = async () => {
          const db = request.result;
          const storeNames = Array.from(db.objectStoreNames);
          const stores = [];

          try {
            for (const storeName of storeNames) {
              const records = await new Promise((storeResolve, storeReject) => {
                const tx = db.transaction(storeName, "readonly");
                const store = tx.objectStore(storeName);
                const bucket = [];
                const cursorReq = store.openCursor();

                cursorReq.onerror = () => storeReject(cursorReq.error || new Error("Cursor failed"));
                cursorReq.onsuccess = () => {
                  const cursor = cursorReq.result;
                  if (cursor) {
                    bucket.push({ key: cursor.key, value: cursor.value });
                    cursor.continue();
                  } else {
                    storeResolve(bucket);
                  }
                };
              });

              const txMeta = db.transaction(storeName, "readonly");
              const os = txMeta.objectStore(storeName);
              stores.push({
                name: storeName,
                keyPath: os.keyPath ?? undefined,
                autoIncrement: !!os.autoIncrement,
                records,
              });
            }

            db.close();
            resolve({
              name: db.name,
              version: db.version,
              stores,
            });
          } catch (err) {
            db.close();
            reject(err);
          }
        };
      });

      exportData.databases.push(dbDump);
    }

    return exportData;
  });
}

function renderOutput(json) {
  els.output.value = safeJson(json);
}

async function runExport(kind) {
  try {
    setStatus("Exporting...");
    const tab = await getActiveTab();
    const { id: tabId, url } = tab;
    if (!/^https?:\/\//i.test(url)) {
      throw new Error("Open a normal website tab (http/https) first.");
    }

    let result;
    if (kind === "cookies") {
      result = await exportCookies(url);
    } else if (kind === "localstorage") {
      result = await exportLocalStorage(tabId);
    } else if (kind === "indexeddb") {
      result = await exportIndexedDB(tabId);
    } else {
      const [cookies, localStorageData, indexeddb] = await Promise.all([
        exportCookies(url),
        exportLocalStorage(tabId),
        exportIndexedDB(tabId),
      ]);

      result = {
        targetUrl: url,
        cookies,
        localstorage: localStorageData,
        indexeddb,
      };
    }

    renderOutput(result);
    setStatus("Export complete.");
  } catch (error) {
    setStatus(error?.message || "Export failed.");
  }
}

els.exportCookies.addEventListener("click", () => runExport("cookies"));
els.exportLocalStorage.addEventListener("click", () => runExport("localstorage"));
els.exportIndexedDB.addEventListener("click", () => runExport("indexeddb"));
els.exportAll.addEventListener("click", () => runExport("all"));

els.copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(els.output.value || "");
    setStatus("Copied to clipboard.");
  } catch {
    setStatus("Copy failed. Select and copy manually.");
  }
});

(async function init() {
  try {
    const tab = await getActiveTab();
    els.site.textContent = tab.url;
  } catch {
    els.site.textContent = "No active website tab.";
  }
})();
