-- CreateTable
CREATE TABLE "MenuItemStok" (
    "id" SERIAL NOT NULL,
    "menuItemId" INTEGER NOT NULL,
    "stokItemId" INTEGER NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "MenuItemStok_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MenuItemStok" ADD CONSTRAINT "MenuItemStok_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItemStok" ADD CONSTRAINT "MenuItemStok_stokItemId_fkey" FOREIGN KEY ("stokItemId") REFERENCES "StokItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
