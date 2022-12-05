-- CreateTable
CREATE TABLE "server_data" (
    "id" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "description" TEXT,
    "attrs" JSONB,
    "wipes" TEXT[],
    "force_wipes" TEXT[],

    CONSTRAINT "server_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "server_parsed" (
    "id" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "wipe_schedule" TEXT,
    "game_mode" TEXT,
    "primary_day" INTEGER,
    "primary_hour" INTEGER,
    "last_primary" TEXT,
    "secondary_day" INTEGER,
    "secondary_hour" INTEGER,
    "last_secondary" TEXT,
    "force_hour" TEXT,
    "last_force" TEXT,

    CONSTRAINT "server_parsed_pkey" PRIMARY KEY ("id")
);
