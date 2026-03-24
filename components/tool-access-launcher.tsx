"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ToolAccessLauncherProps {
  toolId: string;
  toolName: string;
}

type AccessResponse = {
  targetUrl: string;
  loginMethod: "none" | "cookies" | "localstorage" | "indexeddb";
  loginData: any;
};

export function ToolAccessLauncher({ toolId, toolName }: ToolAccessLauncherProps) {
  const [loading, setLoading] = useState(false);

  const EXTENSION_READY_TIMEOUT_MS = 2500;
  const EXTENSION_RESULT_TIMEOUT_MS = 30000;
  const EXTENSION_ACK_TIMEOUT_MS = 1500;

  async function waitForExtensionReady(timeoutMs: number) {
    const requestId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

    return await new Promise<boolean>((resolve) => {
      const timeout = window.setTimeout(() => {
        window.removeEventListener("message", handler as EventListener);
        resolve(false);
      }, timeoutMs);

      const handler = (event: MessageEvent) => {
        if (event.source !== window) return;
        const data = event.data;
        if (!data) return;

        if (data.type === "SEO_TOOL_EXTENSION_READY" && (!data.requestId || data.requestId === requestId)) {
          window.clearTimeout(timeout);
          window.removeEventListener("message", handler as EventListener);
          resolve(true);
        }
      };

      window.addEventListener("message", handler as EventListener);
      window.postMessage({ type: "SEO_TOOL_EXTENSION_PING", requestId }, "*");
    });
  }

  async function handleLaunch() {
    try {
      setLoading(true);
      const res = await fetch(`/api/user/tools/${toolId}/access`, { cache: "no-store" });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to access tool");
      }

      const access = payload as AccessResponse;
      if (!access.targetUrl) {
        throw new Error("Tool target URL is not configured.");
      }

      if (!access.loginMethod || access.loginMethod === "none") {
        window.open(access.targetUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const ready = await waitForExtensionReady(EXTENSION_READY_TIMEOUT_MS);
      if (!ready) {
        alert(
          "Browser extension not detected. Ensure the 'DigiAid Extension' is installed, enabled, and has site access for this domain (All sites or this site), then refresh the dashboard page."
        );
        return;
      }

      const requestId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;

      const extensionResult = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
        let acked = false;

        const timeout = window.setTimeout(() => {
          window.removeEventListener("message", handler as EventListener);
          resolve({ ok: false, error: "No response from extension background worker (timed out)." });
        }, EXTENSION_RESULT_TIMEOUT_MS);

        const ackTimeout = window.setTimeout(() => {
          if (!acked) {
            // Content script should ACK quickly; if it doesn't, messages aren't reaching it.
            window.clearTimeout(timeout);
            window.removeEventListener("message", handler as EventListener);
            resolve({
              ok: false,
              error:
                "Extension content script did not ACK. Check extension site access for this dashboard domain and reload the page.",
            });
          }
        }, EXTENSION_ACK_TIMEOUT_MS);

        const handler = (event: MessageEvent) => {
          if (event.source !== window) return;
          const data = event.data;

          if (data?.type === "SEO_TOOL_ACCESS_ACK" && data.requestId === requestId) {
            acked = true;
            window.clearTimeout(ackTimeout);
            return;
          }

          if (!data || data.type !== "SEO_TOOL_ACCESS_RESULT" || data.requestId !== requestId) return;
          window.clearTimeout(timeout);
          window.clearTimeout(ackTimeout);
          window.removeEventListener("message", handler as EventListener);
          resolve({ ok: !!data.ok, error: data.error });
        };

        window.addEventListener("message", handler as EventListener);
        window.postMessage(
          {
            type: "SEO_TOOL_ACCESS_REQUEST",
            requestId,
            payload: access,
          },
          "*"
        );
      });

      if (!extensionResult.ok) {
        alert(
          extensionResult.error ||
            "Failed to apply login data. Please install/enable the extension and try again."
        );
      }
    } catch (error: any) {
      alert(error?.message || "Failed to launch tool");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button className="w-full h-12 text-lg" disabled={loading} onClick={handleLaunch}>
      {loading ? "Launching..." : `Launch ${toolName}`}
    </Button>
  );
}
