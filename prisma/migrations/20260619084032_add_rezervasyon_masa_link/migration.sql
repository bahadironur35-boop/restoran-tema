-- AlterTable
ALTER TABLE "Rezervasyon" ADD COLUMN     "masaId" INTEGER;

-- AddForeignKey
ALTER TABLE "Rezervasyon" ADD CONSTRAINT "Rezervasyon_masaId_fkey" FOREIGN KEY ("masaId") REFERENCES "Masa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
