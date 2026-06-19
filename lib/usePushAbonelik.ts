"use client";
import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function usePushAbonelik(tip: "garson" | "musteri", masaId?: number) {
  const [durum, setDurum] = useState<"bekliyor" | "aktif" | "reddedildi" | "desteklenmiyor">("bekliyor");

  const abone = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setDurum("desteklenmiyor"); return;
    }
    try {
      const izin = await Notification.requestPermission();
      if (izin !== "granted") { setDurum("reddedildi"); return; }

      const { publicKey } = await fetch("/api/push/vapid-public").then((r) => r.json());
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch("/api/push/abone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON(), tip, masaId }),
      });
      setDurum("aktif");
    } catch { setDurum("reddedildi"); }
  };

  useEffect(() => {
    if (!("Notification" in window)) { setDurum("desteklenmiyor"); return; }
    if (Notification.permission === "granted") {
      navigator.serviceWorker?.ready.then((reg) =>
        reg.pushManager.getSubscription().then((sub) => {
          if (sub) setDurum("aktif");
        })
      );
    } else if (Notification.permission === "denied") {
      setDurum("reddedildi");
    }
  }, []);

  return { durum, abone };
}
