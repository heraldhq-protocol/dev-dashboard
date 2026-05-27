"use client";

import { useCallback } from "react";
import { useUiStore } from "@/lib/stores/ui.store";
import { toast } from "sonner";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  /** Override the toast description. Defaults to a generic sandbox message. */
  message?: string;
}

const SANDBOX_TOAST_ID = "sandbox-locked";

function fireSandboxToast(message: string) {
  toast.info("Actions are disabled in Sandbox mode", {
    id: SANDBOX_TOAST_ID,
    description: message,
    duration: 3000,
  });
}

// ── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns a `guard` helper that wraps any callback: in Sandbox mode the
 * callback is swallowed and a toast is shown instead.
 *
 * Usage:
 *   const { guard } = useSandboxGuard();
 *   <ApiKeyTable onRevokeClick={guard(setRevokeTarget)} />
 */
export function useSandboxGuard(message = "Switch to Live mode to perform this action.") {
  const isSandbox = useUiStore((s) => s.activeEnvironment === "sandbox");

  const guard = useCallback(<T extends unknown[]>(fn: (...args: T) => void) =>
    (...args: T) => {
      if (isSandbox) {
        fireSandboxToast(message);
        return;
      }
      fn(...args);
    },
  [isSandbox, message]);

  return { isSandbox, guard };
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Wraps any mutable action (button, form, link, etc.) and disables it while
 * the dashboard is in Sandbox mode.  In Sandbox:
 *   • Children render at half opacity with pointer-events disabled.
 *   • Clicking the wrapper fires a toast instead of the real action.
 *
 * In Live mode the wrapper is a transparent fragment — zero DOM overhead.
 *
 * Usage:
 *   <SandboxLockedAction>
 *     <Button onClick={createKey}>Create Key</Button>
 *   </SandboxLockedAction>
 */
export function SandboxLockedAction({
  children,
  className = "",
  message = "Switch to Live mode to perform this action.",
}: Props) {
  const isSandbox = useUiStore((s) => s.activeEnvironment === "sandbox");

  if (!isSandbox) return <>{children}</>;

  return (
    <div
      className={`relative cursor-not-allowed ${className}`}
      role="presentation"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        fireSandboxToast(message);
      }}
    >
      <div className="pointer-events-none opacity-50 select-none">
        {children}
      </div>
    </div>
  );
}
