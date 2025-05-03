/*
  Warnings:

  - You are about to drop the column `constactId` on the `MessageFeed` table. All the data in the column will be lost.
  - Added the required column `contactId` to the `MessageFeed` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MessageFeed_constactId_key";

-- DropIndex
DROP INDEX "MessageFeed_contactName_key";

-- DropIndex
DROP INDEX "MessageFeed_phoneNo_key";

-- AlterTable
ALTER TABLE "MessageFeed" DROP COLUMN "constactId",
ADD COLUMN     "contactId" TEXT NOT NULL,
ADD COLUMN     "timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Chats" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "chat" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Chats_senderId_idx" ON "Chats"("senderId");

-- CreateIndex
CREATE INDEX "Chats_receiverId_idx" ON "Chats"("receiverId");

-- CreateIndex
CREATE INDEX "Chats_timeStamp_idx" ON "Chats"("timeStamp");

-- CreateIndex
CREATE INDEX "MessageFeed_userId_idx" ON "MessageFeed"("userId");

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chats" ADD CONSTRAINT "Chats_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
