-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('NEW', 'UP', 'DOWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Check" (
    "id" TEXT NOT NULL,
    "uuid" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "intervalSeconds" INTEGER NOT NULL,
    "graceSeconds" INTEGER NOT NULL,
    "status" "CheckStatus" NOT NULL DEFAULT 'NEW',
    "lastPingedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Check_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PingLog" (
    "id" TEXT NOT NULL,
    "checkId" TEXT NOT NULL,
    "pingedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PingLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Check_uuid_key" ON "Check"("uuid");

-- CreateIndex
CREATE INDEX "Check_userId_idx" ON "Check"("userId");

-- CreateIndex
CREATE INDEX "PingLog_checkId_idx" ON "PingLog"("checkId");

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PingLog" ADD CONSTRAINT "PingLog_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES "Check"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
