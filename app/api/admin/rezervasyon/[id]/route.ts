import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthenticated } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  const { status } = await req.json();
  const rezervasyon = await prisma.rezervasyon.findUnique({ where: { id: Number(id) } });
  if (!rezervasyon) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });

  const updated = await prisma.rezervasyon.update({ where: { id: Number(id) }, data: { status } });

  // Onaylandığında müşteriyi CRM'e ekle / güncelle
  if (status === "onaylandi") {
    const musteri = await prisma.musteri.upsert({
      where: { email: rezervasyon.email },
      update: { name: rezervasyon.name, phone: rezervasyon.phone },
      create: { name: rezervasyon.name, email: rezervasyon.email, phone: rezervasyon.phone },
    });
    await prisma.rezervasyon.update({ where: { id: Number(id) }, data: { musteriId: musteri.id } });
    await prisma.musteriZiyaret.create({
      data: { musteriId: musteri.id, tarih: rezervasyon.date, kisiSayisi: rezervasyon.guests, not: rezervasyon.notes },
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  const { id } = await params;
  await prisma.rezervasyon.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
