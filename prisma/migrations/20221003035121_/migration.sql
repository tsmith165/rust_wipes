/*
  Warnings:

  - You are about to drop the column `force_wipe` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `primary_wipe` on the `Server` table. All the data in the column will be lost.
  - You are about to drop the column `secondary_wipe` on the `Server` table. All the data in the column will be lost.
  - Added the required column `force_wipe_hour` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_day` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `primary_hour` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondary_day` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `secondary_hour` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "force_wipe",
DROP COLUMN "primary_wipe",
DROP COLUMN "secondary_wipe",
ADD COLUMN     "force_wipe_hour" TEXT NOT NULL,
ADD COLUMN     "primary_day" INTEGER NOT NULL,
ADD COLUMN     "primary_hour" INTEGER NOT NULL,
ADD COLUMN     "secondary_day" INTEGER NOT NULL,
ADD COLUMN     "secondary_hour" INTEGER NOT NULL;
