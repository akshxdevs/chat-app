-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT,
    "name" TEXT,
    "mobileNo" TEXT NOT NULL,
    "profileImg" TEXT,
    "bio" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageFeed" (
    "id" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "constactId" TEXT NOT NULL,
    "profilePic" TEXT,
    "phoneNo" TEXT,
    "bio" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "MessageFeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobileNo_key" ON "User"("mobileNo");

-- CreateIndex
CREATE UNIQUE INDEX "MessageFeed_contactName_key" ON "MessageFeed"("contactName");

-- CreateIndex
CREATE UNIQUE INDEX "MessageFeed_constactId_key" ON "MessageFeed"("constactId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageFeed_phoneNo_key" ON "MessageFeed"("phoneNo");

-- AddForeignKey
ALTER TABLE "MessageFeed" ADD CONSTRAINT "MessageFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
