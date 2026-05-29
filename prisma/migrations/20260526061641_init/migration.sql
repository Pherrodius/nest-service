/*
  Warnings:

  - Added the required column `correctAnswer` to the `Resolution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `resolution` ADD COLUMN `correctAnswer` VARCHAR(191) NOT NULL;
