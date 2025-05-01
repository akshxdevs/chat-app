-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT;

-- CreateTable
CREATE TABLE "MessageFeed" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "profilePic" TEXT,
    "phoneNo" TEXT,
    "bio" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MessageFeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageFeed_name_key" ON "MessageFeed"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MessageFeed_phoneNo_key" ON "MessageFeed"("phoneNo");

-- AddForeignKey
ALTER TABLE "MessageFeed" ADD CONSTRAINT "MessageFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
