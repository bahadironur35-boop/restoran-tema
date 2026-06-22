import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const users = await prisma.kullanici.findMany();
console.log(JSON.stringify(users, null, 2));
await prisma.$disconnect();
