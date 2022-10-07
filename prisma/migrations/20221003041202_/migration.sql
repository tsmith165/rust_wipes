-- AlterTable
ALTER TABLE "Server" ALTER COLUMN "force_wipe_hour" DROP NOT NULL,
ALTER COLUMN "primary_day" DROP NOT NULL,
ALTER COLUMN "primary_hour" DROP NOT NULL,
ALTER COLUMN "secondary_day" DROP NOT NULL,
ALTER COLUMN "secondary_hour" DROP NOT NULL;
