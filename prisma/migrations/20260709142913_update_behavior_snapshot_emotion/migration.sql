/*
  Warnings:

  - The `emotion` column on the `BehaviorSnapshot` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BehaviorSnapshot" ALTER COLUMN "attention" DROP DEFAULT,
ALTER COLUMN "confidence" DROP DEFAULT,
ALTER COLUMN "eyeContact" DROP DEFAULT,
ALTER COLUMN "headDirection" DROP DEFAULT,
DROP COLUMN "emotion",
ADD COLUMN     "emotion" JSONB,
ALTER COLUMN "blinkRate" DROP DEFAULT,
ALTER COLUMN "voiceVolume" DROP DEFAULT;
