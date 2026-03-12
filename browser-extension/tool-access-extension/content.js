(function () {
  if (window.__SEO_TOOL_ACCESS_BRIDGE_INSTALLED__) return;
  window.__SEO_TOOL_ACCESS_BRIDGE_INSTALLED__ = true;

  window.addEventListener("message", async (event) => {
    if (event.source !== window || !event.data) return;

    if (event.data.type === "SEO_TOOL_EXTENSION_PING") {
      window.postMessage({ type: "SEO_TOOL_EXTENSION_READY" }, "*");
      return;
    }

    if (event.data.type !== "SEO_TOOL_ACCESS_REQUEST") return;

    const requestId = event.data.requestId;
    const payload = event.data.payload;

    try {
      const response = await chrome.runtime.sendMessage({
        type: "APPLY_TOOL_ACCESS",
        requestId,
        payload,
      });

      window.postMessage(
        {
          type: "SEO_TOOL_ACCESS_RESULT",
          requestId,
          ok: !!response?.ok,
          error: response?.error || null,
        },
        "*"
      );
    } catch (error) {
      window.postMessage(
        {
          type: "SEO_TOOL_ACCESS_RESULT",
          requestId,
          ok: false,
          error: error?.message || "Extension request failed",
        },
        "*"
      );
    }
  });
})();
