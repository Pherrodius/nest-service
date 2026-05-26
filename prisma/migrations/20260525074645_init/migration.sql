/*
  Warnings:

  - The `takenTime` column on the `testhistory` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `testhistory` ADD COLUMN `createdTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    DROP COLUMN `takenTime`,
    ADD COLUMN `takenTime` INTEGER NOT NULL DEFAULT 0;
