-- CreateTable
CREATE TABLE "Odeme" (
    "id" SERIAL NOT NULL,
    "masaId" INTEGER NOT NULL,
    "tutar" DOUBLE PRECISION NOT NULL,
    "yontem" TEXT NOT NULL DEFAULT 'nakit',
    "notlar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Odeme_pkey" PRIMARY KEY ("id")
);
