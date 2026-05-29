/*
  Warnings:

  - Added the required column `uploaderId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document` ADD COLUMN `uploaderId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_uploaderId_fkey` FOREIGN KEY (`uploaderId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
