/*
  Warnings:

  - Added the required column `force_wipe` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_wipe` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondary_wipe` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Server" ADD COLUMN     "force_wipe" TEXT NOT NULL,
ADD COLUMN     "force_wipes" TEXT[],
ADD COLUMN     "primary_wipe" TEXT NOT NULL,
ADD COLUMN     "secondary_wipe" TEXT NOT NULL;
