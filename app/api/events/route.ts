import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 55; // Vercel Hobby limit 60s, biraz altında bırak

export async function GET(req: NextRequest) {
  const scope = req.nextUrl.searchParams.get("scope") ?? "all"; // all | masalar | siparisler

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch { closed = true; }
      };

      // İlk bağlantıda hemen gönder
      send("connected", { ts: Date.now() });

      let prevHash = "";

      while (!closed) {
        try {
          const [masalar, siparisler] = await Promise.all([
            (scope === "all" || scope === "masalar")
              ? prisma.masa.findMany({
                  orderBy: [{ alan: "asc" }, { no: "asc" }],
                  select: {
                    id: true, no: true, alan: true, durum: true, kapasite: true,
                    talepler: { where: { durum: "bekliyor" }, select: { id: true, tip: true, createdAt: true } },
                  },
                })
              : Promise.resolve(null),
            (scope === "all" || scope === "siparisler")
              ? prisma.siparis.findMany({
                  where: { durum: { not: "teslim" } },
                  include: { items: true, masa: { select: { no: true, alan: true } } },
                  orderBy: { createdAt: "asc" },
                })
              : Promise.resolve(null),
          ]);

          const payload = { masalar, siparisler, ts: Date.now() };
          const hash = JSON.stringify({ masalar, siparisler });

          if (hash !== prevHash) {
            send("update", payload);
            prevHash = hash;
          } else {
            // Heartbeat — bağlantıyı canlı tut
            send("ping", { ts: Date.now() });
          }
        } catch { /* DB hatası — sessizce devam */ }

        await new Promise((r) => setTimeout(r, 2000));
      }
    },
    cancel() { closed = true; },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
