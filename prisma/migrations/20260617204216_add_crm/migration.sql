-- AlterTable
ALTER TABLE "Rezervasyon" ADD COLUMN     "musteriId" INTEGER;

-- CreateTable
CREATE TABLE "Musteri" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "dogumGunu" TEXT,
    "vip" BOOLEAN NOT NULL DEFAULT false,
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Musteri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusteriZiyaret" (
    "id" SERIAL NOT NULL,
    "musteriId" INTEGER NOT NULL,
    "tarih" TEXT NOT NULL,
    "kisiSayisi" INTEGER NOT NULL,
    "not" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MusteriZiyaret_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Musteri_email_key" ON "Musteri"("email");

-- AddForeignKey
ALTER TABLE "Rezervasyon" ADD CONSTRAINT "Rezervasyon_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusteriZiyaret" ADD CONSTRAINT "MusteriZiyaret_musteriId_fkey" FOREIGN KEY ("musteriId") REFERENCES "Musteri"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
