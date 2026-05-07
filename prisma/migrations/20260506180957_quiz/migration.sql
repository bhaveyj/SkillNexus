-- CreateTable
CREATE TABLE "MasterclassQuiz" (
    "id" TEXT NOT NULL,
    "masterclassId" TEXT NOT NULL,
    "questions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterclassQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterclassQuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "masterclassId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "score" INTEGER NOT NULL,
    "maxScore" INTEGER NOT NULL,
    "feedback" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterclassQuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterclassQuiz_masterclassId_key" ON "MasterclassQuiz"("masterclassId");

-- CreateIndex
CREATE INDEX "MasterclassQuizAttempt_userId_masterclassId_idx" ON "MasterclassQuizAttempt"("userId", "masterclassId");

-- AddForeignKey
ALTER TABLE "MasterclassQuiz" ADD CONSTRAINT "MasterclassQuiz_masterclassId_fkey" FOREIGN KEY ("masterclassId") REFERENCES "Masterclass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterclassQuizAttempt" ADD CONSTRAINT "MasterclassQuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterclassQuizAttempt" ADD CONSTRAINT "MasterclassQuizAttempt_masterclassId_fkey" FOREIGN KEY ("masterclassId") REFERENCES "Masterclass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterclassQuizAttempt" ADD CONSTRAINT "MasterclassQuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "MasterclassQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
