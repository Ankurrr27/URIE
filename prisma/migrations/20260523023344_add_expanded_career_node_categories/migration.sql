-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CareerNodeType" ADD VALUE 'CONTACT_INFO';
ALTER TYPE "CareerNodeType" ADD VALUE 'SOCIAL_HANDLE';
ALTER TYPE "CareerNodeType" ADD VALUE 'ACHIEVEMENT';
ALTER TYPE "CareerNodeType" ADD VALUE 'RELEVANT_COURSEWORK';
ALTER TYPE "CareerNodeType" ADD VALUE 'POSITION_OF_RESPONSIBILITY';
ALTER TYPE "CareerNodeType" ADD VALUE 'CODING_PROFILE';
