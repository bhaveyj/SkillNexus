/*
  Warnings:

  - A unique constraint covering the columns `[userId,source]` on the table `CreditTransaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CreditTransaction_userId_source_key" ON "CreditTransaction"("userId", "source");
