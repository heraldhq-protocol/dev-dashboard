/**
 * usePlaygroundKey
 *
 * Manages the sandbox API key for the Composers Playground.
 *
 * Design intent:
 * - The playground is zero-config: the backend auto-creates a dedicated
 *   "Playground Test Key" on first visit and returns its plaintext.
 * - Plaintext is stored in localStorage (keyed by protocolId) so it survives
 *   page refreshes without requiring the user to manually re-enter it.
 * - If localStorage is empty (cleared, different device, etc.), the user is
 *   prompted to paste their key — a lightweight manual escape hatch.
 *
 * Key lifecycle:
 *   1. Backend returns hasPlaintext: true (new key)  → save to localStorage, use directly.
 *   2. Backend returns hasPlaintext: false (existing) → load from localStorage.
 *   3. localStorage empty                             → show manual paste UI.
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { getPlaygroundApiKey } from "@/lib/api/notifications";

const LS_KEY_PREFIX = "herald:playground_key:";

function getStoredKey(protocolId: string): string | null {
  try {
    return localStorage.getItem(`${LS_KEY_PREFIX}${protocolId}`);
  } catch {
    return null;
  }
}

function saveStoredKey(protocolId: string, key: string): void {
  try {
    localStorage.setItem(`${LS_KEY_PREFIX}${protocolId}`, key);
  } catch {
    // storage full or private browsing — fail silently
  }
}

function clearStoredKey(protocolId: string): void {
  try {
    localStorage.removeItem(`${LS_KEY_PREFIX}${protocolId}`);
  } catch {
    // ignore
  }
}

export interface UsePlaygroundKeyResult {
  /** The active API key ready to use as a Bearer token. Empty string if not yet available. */
  activeKey: string;
  /** Prefix shown in the UI (e.g. hrld_test_Ab12…) */
  keyPrefix: string | undefined;
  /** true when a new key was just auto-created on this visit (show copy prompt) */
  isNewKey: boolean;
  /** true when key came from localStorage (returning user, working correctly) */
  isPersistedKey: boolean;
  /** true when no key is available and user must paste one manually */
  needsManualKey: boolean;
  /** The user's manually typed key override */
  manualKey: string;
  setManualKey: (key: string) => void;
  /** Call to save a valid manual key into localStorage */
  saveManualKey: () => void;
  /** Clear the persisted key (e.g. if it's revoked) */
  handleClearKey: () => void;
  isLoading: boolean;
}

export function usePlaygroundKey(): UsePlaygroundKeyResult {
  const { data: session } = useSession();
  const protocolId = session?.user?.protocolId ?? null;

  const [persistedKey, setPersistedKey] = useState<string | null>(null);
  const [isNewKey, setIsNewKey] = useState(false);
  const [manualKey, setManualKey] = useState("");

  // Load from localStorage once protocolId is known
  useEffect(() => {
    if (!protocolId) return;
    const stored = getStoredKey(protocolId);
    setPersistedKey(stored);
  }, [protocolId]);

  const { data: apiKeyData, isLoading } = useQuery({
    queryKey: ["playground-api-key"],
    queryFn: getPlaygroundApiKey,
    enabled: !!protocolId,
    // Only re-fetch if we don't already have a working key
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // When the backend returns a brand-new key, persist it automatically
  useEffect(() => {
    if (!protocolId || !apiKeyData?.hasPlaintext || !apiKeyData.key) return;
    // Avoid re-saving if we already have this key stored
    const existing = getStoredKey(protocolId);
    if (existing === apiKeyData.key) return;
    saveStoredKey(protocolId, apiKeyData.key);
    setPersistedKey(apiKeyData.key);
    setIsNewKey(true);
  }, [protocolId, apiKeyData?.hasPlaintext, apiKeyData?.key]);

  // Priority: manual override → localStorage → nothing (needs manual input)
  const activeKey = manualKey.trim() || persistedKey || "";
  const isPersistedKey = !manualKey.trim() && !!persistedKey;
  const needsManualKey = !activeKey && !isLoading;

  const saveManualKey = () => {
    if (!protocolId || !manualKey.trim()) return;
    saveStoredKey(protocolId, manualKey.trim());
    setPersistedKey(manualKey.trim());
    setManualKey("");
  };

  const handleClearKey = () => {
    if (!protocolId) return;
    clearStoredKey(protocolId);
    setPersistedKey(null);
    setIsNewKey(false);
    setManualKey("");
  };

  return {
    activeKey,
    keyPrefix: apiKeyData?.keyPrefix,
    isNewKey,
    isPersistedKey,
    needsManualKey,
    manualKey,
    setManualKey,
    saveManualKey,
    handleClearKey,
    isLoading,
  };
}
