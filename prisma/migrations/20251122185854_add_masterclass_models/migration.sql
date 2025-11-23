-- CreateEnum
CREATE TYPE "MasterclassLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "Masterclass" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructorId" TEXT NOT NULL,
    "instructorName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" "MasterclassLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "meetLink" TEXT NOT NULL,
    "maxStudents" INTEGER,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Masterclass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterclassRegistration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "masterclassId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MasterclassRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterclassRegistration_userId_masterclassId_key" ON "MasterclassRegistration"("userId", "masterclassId");

-- AddForeignKey
ALTER TABLE "Masterclass" ADD CONSTRAINT "Masterclass_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterclassRegistration" ADD CONSTRAINT "MasterclassRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterclassRegistration" ADD CONSTRAINT "MasterclassRegistration_masterclassId_fkey" FOREIGN KEY ("masterclassId") REFERENCES "Masterclass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
