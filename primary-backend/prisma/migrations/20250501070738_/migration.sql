/*
  Warnings:

  - You are about to drop the column `name` on the `MessageFeed` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[contactName]` on the table `MessageFeed` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[constactId]` on the table `MessageFeed` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `constactId` to the `MessageFeed` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactName` to the `MessageFeed` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MessageFeed_name_key";

-- AlterTable
ALTER TABLE "MessageFeed" DROP COLUMN "name",
ADD COLUMN     "constactId" TEXT NOT NULL,
ADD COLUMN     "contactName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MessageFeed_contactName_key" ON "MessageFeed"("contactName");

-- CreateIndex
CREATE UNIQUE INDEX "MessageFeed_constactId_key" ON "MessageFeed"("constactId");
