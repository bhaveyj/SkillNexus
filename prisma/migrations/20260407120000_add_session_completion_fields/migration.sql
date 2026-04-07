-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('pending', 'accepted', 'completed');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('exchange', 'paid');

-- AlterTable
ALTER TABLE "ChatSession"
ADD COLUMN "status" "SessionStatus" NOT NULL DEFAULT 'accepted',
ADD COLUMN "sessionType" "SessionType" NOT NULL DEFAULT 'exchange',
ADD COLUMN "teacherCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "learnerCompleted" BOOLEAN NOT NULL DEFAULT false;
