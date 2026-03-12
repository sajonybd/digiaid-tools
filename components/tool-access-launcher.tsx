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

      const requestId = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;

      const extensionResult = await new Promise<{ ok: boolean; error?: string }>((resolve) => {
        const timeout = window.setTimeout(() => {
          window.removeEventListener("message", handler as EventListener);
          resolve({ ok: false, error: "Browser extension not detected or no response." });
        }, 3500);

        const handler = (event: MessageEvent) => {
          if (event.source !== window) return;
          const data = event.data;
          if (!data || data.type !== "SEO_TOOL_ACCESS_RESULT" || data.requestId !== requestId) return;
          window.clearTimeout(timeout);
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
