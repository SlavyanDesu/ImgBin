-- CreateTable
CREATE TABLE "FileMetadata" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "userSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileMetadata_publicId_key" ON "FileMetadata"("publicId");
