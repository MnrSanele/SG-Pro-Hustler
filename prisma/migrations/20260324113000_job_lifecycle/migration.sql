-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('REQUESTER_TO_PROVIDER', 'PROVIDER_TO_REQUESTER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JobStatus" ADD VALUE 'IN_REVIEW';
ALTER TYPE "JobStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "JobStatus" ADD VALUE 'DISPUTED';

-- AlterTable
ALTER TABLE "reviews" ADD COLUMN     "type" "ReviewType";

UPDATE "reviews"
SET "type" = 'REQUESTER_TO_PROVIDER'
WHERE "type" IS NULL;

ALTER TABLE "reviews" ALTER COLUMN "type" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_jobId_providerProfileId_key" ON "job_applications"("jobId", "providerProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_jobId_squadId_key" ON "job_applications"("jobId", "squadId");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_jobId_authorId_type_key" ON "reviews"("jobId", "authorId", "type");
