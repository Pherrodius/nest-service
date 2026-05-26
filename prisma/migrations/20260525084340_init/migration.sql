/*
  Warnings:

  - Made the column `length` on table `testhistory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `testhistory` MODIFY `length` INTEGER NOT NULL;
