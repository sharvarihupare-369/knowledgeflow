/*
  Warnings:

  - You are about to drop the column `companyDomain` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `companyName` on the `Organisation` table. All the data in the column will be lost.
  - You are about to drop the column `companySlug` on the `Organisation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[domain]` on the table `Organisation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Organisation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `domain` to the `Organisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Organisation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Organisation` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Organisation_companyDomain_key";

-- DropIndex
DROP INDEX "Organisation_companySlug_key";

-- AlterTable
ALTER TABLE "Organisation" DROP COLUMN "companyDomain",
DROP COLUMN "companyName",
DROP COLUMN "companySlug",
ADD COLUMN     "domain" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_domain_key" ON "Organisation"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_slug_key" ON "Organisation"("slug");
