/*
  Warnings:

  - A unique constraint covering the columns `[senderId,receiverId,senderSkillId,receiverSkillId,requestType]` on the table `ExchangeRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ExchangeRequestType" AS ENUM ('SWAP', 'PAID');

-- DropIndex
DROP INDEX "ExchangeRequest_senderId_receiverId_senderSkillId_receiverS_key";

-- AlterTable
ALTER TABLE "ExchangeRequest" ADD COLUMN     "requestType" "ExchangeRequestType" NOT NULL DEFAULT 'SWAP',
ALTER COLUMN "senderSkillId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ExchangeRequest_senderId_receiverId_senderSkillId_receiverS_key" ON "ExchangeRequest"("senderId", "receiverId", "senderSkillId", "receiverSkillId", "requestType");
