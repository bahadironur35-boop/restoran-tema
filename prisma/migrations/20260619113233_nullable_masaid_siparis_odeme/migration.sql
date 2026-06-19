-- DropForeignKey
ALTER TABLE "Siparis" DROP CONSTRAINT "Siparis_masaId_fkey";

-- AlterTable
ALTER TABLE "Odeme" ALTER COLUMN "masaId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Siparis" ALTER COLUMN "masaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_masaId_fkey" FOREIGN KEY ("masaId") REFERENCES "Masa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
