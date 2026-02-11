-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "gridRow" INTEGER NOT NULL,
    "gridCol" INTEGER NOT NULL,
    "spanCols" INTEGER NOT NULL DEFAULT 1,
    "color" TEXT NOT NULL DEFAULT '#1a1a1a',
    "size" TEXT NOT NULL DEFAULT 'medium',
    "imagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_gridRow_gridCol_key" ON "Message"("gridRow", "gridCol");
