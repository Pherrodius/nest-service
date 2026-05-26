/*
  Warnings:

  - The primary key for the `document` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fileType` on the `document` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[filename]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryId` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document` DROP PRIMARY KEY,
    DROP COLUMN `fileType`,
    ADD COLUMN `categoryId` INTEGER NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `mimeType` VARCHAR(191) NOT NULL,
    MODIFY `content` VARCHAR(191) NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `DocumentCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `DocumentCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Document_filename_key` ON `Document`(`filename`);

-- AddForeignKey
ALTER TABLE `Document` ADD CONSTRAINT `Document_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `DocumentCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
