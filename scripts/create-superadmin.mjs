import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const hash = await bcrypt.hash("Can22021977", 10);
const user = await prisma.kullanici.upsert({
  where: { email: "bahadironur35@gmail.com" },
  update: { password: hash, isSuperAdmin: true, active: true, role: "admin", name: "Onur Bahadir" },
  create: { email: "bahadironur35@gmail.com", password: hash, isSuperAdmin: true, active: true, role: "admin", name: "Onur Bahadir" },
});
console.log("SuperAdmin oluşturuldu:", user.id, user.email);
await prisma.$disconnect();
