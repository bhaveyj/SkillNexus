-- CreateEnum
CREATE TYPE "ExchangeStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ExchangeRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "senderSkillId" TEXT NOT NULL,
    "receiverSkillId" TEXT NOT NULL,
    "status" "ExchangeStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExchangeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExchangeRequest_receiverId_status_idx" ON "ExchangeRequest"("receiverId", "status");

-- CreateIndex
CREATE INDEX "ExchangeRequest_senderId_status_idx" ON "ExchangeRequest"("senderId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRequest_senderId_receiverId_senderSkillId_receiverS_key" ON "ExchangeRequest"("senderId", "receiverId", "senderSkillId", "receiverSkillId");

-- AddForeignKey
ALTER TABLE "ExchangeRequest" ADD CONSTRAINT "ExchangeRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRequest" ADD CONSTRAINT "ExchangeRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRequest" ADD CONSTRAINT "ExchangeRequest_senderSkillId_fkey" FOREIGN KEY ("senderSkillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeRequest" ADD CONSTRAINT "ExchangeRequest_receiverSkillId_fkey" FOREIGN KEY ("receiverSkillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
