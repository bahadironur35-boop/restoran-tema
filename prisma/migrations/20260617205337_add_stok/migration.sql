-- CreateTable
CREATE TABLE "StokItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "birim" TEXT NOT NULL DEFAULT 'adet',
    "miktar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minMiktar" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "kategori" TEXT NOT NULL DEFAULT 'Malzeme',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StokItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StokHareket" (
    "id" SERIAL NOT NULL,
    "stokItemId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StokHareket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StokHareket" ADD CONSTRAINT "StokHareket_stokItemId_fkey" FOREIGN KEY ("stokItemId") REFERENCES "StokItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
