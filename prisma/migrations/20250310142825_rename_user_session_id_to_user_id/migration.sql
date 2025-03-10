/*
  Warnings:

  - You are about to drop the column `userSessionId` on the `FileMetadata` table. All the data in the column will be lost.
  - Added the required column `userId` to the `FileMetadata` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FileMetadata" DROP COLUMN "userSessionId",
ADD COLUMN     "userId" TEXT NOT NULL;
