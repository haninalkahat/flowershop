-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "freshness" TEXT DEFAULT 'Guaranteed 7 Days',
ADD COLUMN     "height" TEXT,
ADD COLUMN     "origin" TEXT DEFAULT 'Holland';

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "price" DECIMAL(65,30);
