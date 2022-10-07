/*
  Warnings:

  - You are about to drop the column `bm_id` on the `Server` table. All the data in the column will be lost.
  - Added the required column `rank` to the `Server` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Server" DROP COLUMN "bm_id",
ADD COLUMN     "rank" INTEGER NOT NULL,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "Server_id_seq";
