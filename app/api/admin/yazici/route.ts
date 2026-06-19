import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import net from "net";

// ESC/POS komutları
const ESC = 0x1b;
const GS = 0x1d;

function escpos(satirlar: string[], genislik: number): Buffer {
  const chunks: Buffer[] = [];

  const push = (...bytes: number[]) => chunks.push(Buffer.from(bytes));
  const text = (s: string) => chunks.push(Buffer.from(isoEncode(s)));

  // Init + latin charset
  push(ESC, 0x40);         // initialize
  push(ESC, 0x74, 0x12);  // code page 857 (Turkish)

  // Ortalanmış yazdırma helper'ı satirlar içinde [C] prefix ile işaretlenecek
  for (const satir of satirlar) {
    if (satir === "---") {
      text("-".repeat(genislik) + "\n");
    } else if (satir === "===") {
      text("=".repeat(genislik) + "\n");
    } else if (satir.startsWith("[C]")) {
      push(ESC, 0x61, 0x01); // center align
      text(satir.slice(3) + "\n");
      push(ESC, 0x61, 0x00); // left align
    } else if (satir.startsWith("[B]")) {
      push(ESC, 0x45, 0x01); // bold on
      text(satir.slice(3) + "\n");
      push(ESC, 0x45, 0x00); // bold off
    } else if (satir.startsWith("[ROW]")) {
      // "[ROW]sol|sag" → iki sütun
      const parts = satir.slice(5).split("|");
      const sol = parts[0] ?? "";
      const sag = parts[1] ?? "";
      const bosluk = Math.max(1, genislik - sol.length - sag.length);
      text(sol + " ".repeat(bosluk) + sag + "\n");
    } else {
      text(satir + "\n");
    }
  }

  // Kesme + besleme
  push(ESC, 0x64, 0x04); // feed 4 lines
  push(GS, 0x56, 0x41, 0x00); // full cut

  return Buffer.concat(chunks);
}

// Türkçe karakter → code page 857 dönüşümü
function isoEncode(s: string): Buffer {
  const map: Record<string, number> = {
    "ğ": 0xf0, "Ğ": 0xd0, "ş": 0xfe, "Ş": 0xde,
    "ı": 0xfd, "İ": 0xdd, "ç": 0xe7, "Ç": 0xc7,
    "ö": 0xf6, "Ö": 0xd6, "ü": 0xfc, "Ü": 0xdc,
  };
  const out = Buffer.alloc(s.length);
  let i = 0;
  for (const ch of s) {
    out[i++] = map[ch] ?? (ch.charCodeAt(0) < 256 ? ch.charCodeAt(0) : 0x3f);
  }
  return out.slice(0, i);
}

function tcpGonder(ip: string, port: number, data: Buffer): Promise<void> {
  return new Promise((resolve, reject) => {
    const sock = new net.Socket();
    sock.setTimeout(3000);
    sock.connect(port, ip, () => {
      sock.write(data, () => {
        sock.end();
        resolve();
      });
    });
    sock.on("error", reject);
    sock.on("timeout", () => { sock.destroy(); reject(new Error("timeout")); });
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    tip: "fis" | "adisyon";
    satirlar: string[];
  };

  const ayarlar = await prisma.ayar.findMany({
    where: { key: { in: ["yaziciIp", "yaziciPort", "yaziciGenislik"] } },
  });
  const ayarMap = Object.fromEntries(ayarlar.map((a) => [a.key, a.value]));

  const ip = ayarMap["yaziciIp"];
  if (!ip) return NextResponse.json({ error: "Yazıcı IP ayarlı değil" }, { status: 400 });

  const port = parseInt(ayarMap["yaziciPort"] ?? "9100");
  const genislik = parseInt(ayarMap["yaziciGenislik"] ?? "42");

  const data = escpos(body.satirlar, genislik);

  try {
    await tcpGonder(ip, port, data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Yazıcı bağlantı hatası";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
