-- CreateTable
CREATE TABLE "Server" (
    "id" SERIAL NOT NULL,
    "bm_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "wipes" TEXT[],

    CONSTRAINT "Server_pkey" PRIMARY KEY ("id")
);
