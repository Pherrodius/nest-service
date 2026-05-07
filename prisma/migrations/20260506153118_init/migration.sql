/*
  Warnings:

  - The values [Choice] on the enum `Question_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `question` MODIFY `type` ENUM('SingleChoice', 'MultiChoice', 'TrueFalse') NOT NULL;
