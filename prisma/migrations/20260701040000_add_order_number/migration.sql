-- AlterTable
ALTER TABLE "Order" ADD COLUMN "orderNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
