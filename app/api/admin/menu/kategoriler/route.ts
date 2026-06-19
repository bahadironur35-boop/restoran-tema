import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const AYAR_KEY = "menuKategoriler";
const DEFAULT = ["Başlangıçlar", "Ana Yemekler", "Tatlılar", "İçecekler"];

async function getKategoriler(): Promise<string[]> {
  const row = await prisma.ayar.findUnique({ where: { key: AYAR_KEY } });
  if (!row) return DEFAULT;
  try { return JSON.parse(row.value); } catch { return DEFAULT; }
}

// GET — liste döner
export async function GET() {
  return NextResponse.json(await getKategoriler());
}

// POST — { action: "add"|"rename"|"delete", name, newName? }
export async function POST(req: NextRequest) {
  const { action, name, newName } = await req.json();
  let cats = await getKategoriler();

  if (action === "add") {
    const trimmed = (name as string).trim();
    if (!trimmed || cats.includes(trimmed))
      return NextResponse.json({ error: "Geçersiz veya mevcut kategori" }, { status: 400 });
    cats = [...cats, trimmed];
  } else if (action === "delete") {
    const inUse = await prisma.menuItem.findFirst({ where: { category: name } });
    if (inUse)
      return NextResponse.json({ error: "Kategoride menü öğesi var, önce taşıyın" }, { status: 400 });
    cats = cats.filter((c) => c !== name);
  } else if (action === "rename") {
    const trimmed = (newName as string).trim();
    if (!trimmed || cats.includes(trimmed))
      return NextResponse.json({ error: "Geçersiz veya mevcut isim" }, { status: 400 });
    // Menü öğelerini güncelle
    await prisma.menuItem.updateMany({ where: { category: name }, data: { category: trimmed } });
    cats = cats.map((c) => (c === name ? trimmed : c));
  } else {
    return NextResponse.json({ error: "Geçersiz action" }, { status: 400 });
  }

  await prisma.ayar.upsert({
    where: { key: AYAR_KEY },
    update: { value: JSON.stringify(cats) },
    create: { key: AYAR_KEY, value: JSON.stringify(cats) },
  });

  return NextResponse.json(cats);
}

// PATCH — sıra değiştirme: { kategoriler: string[] }
export async function PATCH(req: NextRequest) {
  const { kategoriler } = await req.json();
  if (!Array.isArray(kategoriler))
    return NextResponse.json({ error: "Geçersiz" }, { status: 400 });

  await prisma.ayar.upsert({
    where: { key: AYAR_KEY },
    update: { value: JSON.stringify(kategoriler) },
    create: { key: AYAR_KEY, value: JSON.stringify(kategoriler) },
  });

  return NextResponse.json(kategoriler);
}
