-- CreateTable
CREATE TABLE "Siparis" (
    "id" SERIAL NOT NULL,
    "masaId" INTEGER NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'bekliyor',
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Siparis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiparisItem" (
    "id" SERIAL NOT NULL,
    "siparisId" INTEGER NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "adet" INTEGER NOT NULL DEFAULT 1,
    "not" TEXT,

    CONSTRAINT "SiparisItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_masaId_fkey" FOREIGN KEY ("masaId") REFERENCES "Masa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisItem" ADD CONSTRAINT "SiparisItem_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "Siparis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
