-- CreateTable
CREATE TABLE "Masa" (
    "id" SERIAL NOT NULL,
    "no" INTEGER NOT NULL,
    "kapasite" INTEGER NOT NULL DEFAULT 4,
    "aktif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Masa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasaTalebi" (
    "id" SERIAL NOT NULL,
    "masaId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "durum" TEXT NOT NULL DEFAULT 'bekliyor',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasaTalebi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Masa_no_key" ON "Masa"("no");

-- AddForeignKey
ALTER TABLE "MasaTalebi" ADD CONSTRAINT "MasaTalebi_masaId_fkey" FOREIGN KEY ("masaId") REFERENCES "Masa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
