-- Backfill existing users to avoid NOT NULL violations
UPDATE "User" SET "skills" = ARRAY[]::TEXT[] WHERE "skills" IS NULL;
UPDATE "User" SET "interests" = ARRAY[]::TEXT[] WHERE "interests" IS NULL;

-- Ensure defaults exist for future OAuth/credentials user creation
ALTER TABLE "User" ALTER COLUMN "skills" SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "User" ALTER COLUMN "interests" SET DEFAULT ARRAY[]::TEXT[];

-- Keep Prisma and DB schema aligned
ALTER TABLE "User" ALTER COLUMN "skills" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "interests" SET NOT NULL;
