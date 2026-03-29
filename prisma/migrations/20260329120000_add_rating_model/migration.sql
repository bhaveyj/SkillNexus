-- Create ratings table for user-to-user feedback
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "revieweeId" TEXT NOT NULL,
    "sessionId" TEXT,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Rating_revieweeId_idx" ON "Rating"("revieweeId");

CREATE UNIQUE INDEX "Rating_reviewerId_sessionId_key" ON "Rating"("reviewerId", "sessionId");

ALTER TABLE "Rating"
ADD CONSTRAINT "Rating_reviewerId_fkey"
FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Rating"
ADD CONSTRAINT "Rating_revieweeId_fkey"
FOREIGN KEY ("revieweeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
