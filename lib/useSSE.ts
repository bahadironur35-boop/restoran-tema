"use client";
import { useEffect, useRef } from "react";

type SSEHandler = (event: string, data: unknown) => void;

export function useSSE(url: string, onMessage: SSEHandler) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;

  useEffect(() => {
    let es: EventSource;
    let retryTimer: ReturnType<typeof setTimeout>;

    const connect = () => {
      es = new EventSource(url);

      const handle = (eventName: string) => (e: MessageEvent) => {
        try { handlerRef.current(eventName, JSON.parse(e.data)); } catch { /* ignore */ }
      };

      es.addEventListener("update",    handle("update"));
      es.addEventListener("ping",      handle("ping"));
      es.addEventListener("connected", handle("connected"));

      es.onerror = () => {
        es.close();
        // Vercel 60s timeout sonrası veya ağ hatası — 1s bekleyip yeniden bağlan
        retryTimer = setTimeout(connect, 1000);
      };
    };

    connect();
    return () => { es?.close(); clearTimeout(retryTimer); };
  }, [url]);
}
