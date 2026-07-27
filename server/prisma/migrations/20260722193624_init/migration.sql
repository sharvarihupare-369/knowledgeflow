/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyDomain" TEXT NOT NULL,
    "companySlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_companyDomain_key" ON "Organisation"("companyDomain");

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_companySlug_key" ON "Organisation"("companySlug");
