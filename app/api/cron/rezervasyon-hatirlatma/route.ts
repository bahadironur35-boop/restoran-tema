import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rezervasyonHatirlatma } from "@/lib/mail";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const yarin = new Date();
  yarin.setDate(yarin.getDate() + 1);
  const yarinStr = yarin.toISOString().split("T")[0];

  const rezervasyonlar = await prisma.rezervasyon.findMany({
    where: { date: yarinStr, status: "onaylandi" },
  });

  let gonderilen = 0;
  for (const r of rezervasyonlar) {
    await rezervasyonHatirlatma({
      name: r.name, email: r.email, date: r.date,
      time: r.time, guests: r.guests, notes: r.notes,
    });
    gonderilen++;
  }

  return NextResponse.json({ ok: true, tarih: yarinStr, gonderilen });
}
