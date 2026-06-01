/*
  Warnings:

  - You are about to drop the `documentcategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `document` DROP FOREIGN KEY `Document_categoryId_fkey`;

-- DropIndex
DROP INDEX `Document_categoryId_fkey` ON `document`;

-- DropTable
DROP TABLE `documentcategory`;
