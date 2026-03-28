"use client";

import { useEffect } from "react";

export function useRealtimeNotifications(onEvent: (event: unknown) => void) {
  useEffect(() => {
    // MOCK: simulate target subscription loop mapping to hypothetical event-stream
    const controller = new AbortController();
    
    // In production:
    // const sse = new EventSource('/api/stream/notifications');
    // sse.onmessage = (e) => onEvent(JSON.parse(e.data));
    
    return () => {
      controller.abort();
      // sse.close();
    };
  }, [onEvent]);
}
