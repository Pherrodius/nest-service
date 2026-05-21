/*
  Warnings:

  - You are about to drop the column `createdTime` on the `collection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `collection` DROP COLUMN `createdTime`,
    ADD COLUMN `updatedTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
