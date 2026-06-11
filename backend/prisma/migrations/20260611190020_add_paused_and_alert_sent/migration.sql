-- AlterTable
ALTER TABLE "Check" ADD COLUMN     "alertSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paused" BOOLEAN NOT NULL DEFAULT false;
