/*
  Warnings:

  - Made the column `isCorrect` on table `resolution` required. This step will fail if there are existing NULL values in that column.
  - Made the column `yourAnswer` on table `resolution` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `resolution` MODIFY `isCorrect` BOOLEAN NOT NULL,
    MODIFY `yourAnswer` VARCHAR(191) NOT NULL;
