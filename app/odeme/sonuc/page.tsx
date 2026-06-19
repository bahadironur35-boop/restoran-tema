"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { Suspense } from "react";

type Durum = "bekliyor" | "tamamlandi" | "basarisiz" | "yukleniyor";

function OdemeSonucIcerik() {
  const params = useSearchParams();
  const ref = params.get("ref") ?? params.get("conversationId");
  const statusParam = params.get("status"); // stripe: success/cancel
  const [durum, setDurum] = useState<Durum>("yukleniyor");
  const [tutar, setTutar] = useState<number | null>(null);

  useEffect(() => {
    if (!ref) { setDurum("basarisiz"); return; }
    if (statusParam === "cancel") { setDurum("basarisiz"); return; }

    const kontrol = async (deneme = 0) => {
      const res = await fetch(`/api/odeme/durum?ref=${ref}`);
      if (!res.ok) { setDurum("basarisiz"); return; }
      const data = await res.json();
      setTutar(data.tutar);
      if (data.durum === "tamamlandi") { setDurum("tamamlandi"); return; }
      if (data.durum === "basarisiz") { setDurum("basarisiz"); return; }
      // Webhook henüz işlenmemiş olabilir, 3 kez dene
      if (deneme < 3) setTimeout(() => kontrol(deneme + 1), 2000);
      else setDurum("bekliyor");
    };
    kontrol();
  }, [ref, statusParam]);

  const config: Record<Durum, { icon: React.ElementType; renk: string; baslik: string; aciklama: string }> = {
    yukleniyor: { icon: Clock, renk: "#F59E0B", baslik: "Kontrol ediliyor...", aciklama: "Ödeme durumu sorgulanıyor." },
    bekliyor:   { icon: Clock, renk: "#F59E0B", baslik: "İşleminiz Bekleniyor", aciklama: "Ödemeniz işleniyor, kısa süre içinde onaylanacak." },
    tamamlandi: { icon: CheckCircle, renk: "#22C55E", baslik: "Ödeme Başarılı!", aciklama: "Ödemeniz alındı, teşekkürler." },
    basarisiz:  { icon: XCircle, renk: "#EF4444", baslik: "Ödeme Başarısız", aciklama: "Bir sorun oluştu. Lütfen tekrar deneyin." },
  };

  const c = config[durum];
  const Icon = c.icon;

  return (
    <div className="min-h-screen flex items-center justify-center px-5" style={{ backgroundColor: "#0F172A" }}>
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: c.renk + "20" }}>
          <Icon size={36} style={{ color: c.renk }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{c.baslik}</h1>
          <p className="text-sm mt-2" style={{ color: "#94A3B8" }}>{c.aciklama}</p>
          {tutar && durum === "tamamlandi" && (
            <p className="text-2xl font-bold mt-3" style={{ color: "#22C55E" }}>
              ₺{tutar.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}
            </p>
          )}
          {ref && (
            <p className="text-xs mt-3 font-mono" style={{ color: "#475569" }}>
              Ref: {ref.slice(0, 8)}...
            </p>
          )}
        </div>
        {durum !== "yukleniyor" && (
          <a href="/"
            className="inline-block px-8 py-3 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: "#1A73E8", color: "#fff" }}>
            Ana Sayfaya Dön
          </a>
        )}
      </div>
    </div>
  );
}

export default function OdemeSonucPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0F172A" }}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OdemeSonucIcerik />
    </Suspense>
  );
}
