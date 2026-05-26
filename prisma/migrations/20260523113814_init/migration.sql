/*
  Warnings:

  - You are about to drop the column `downloadUrl` on the `document` table. All the data in the column will be lost.
  - You are about to drop the column `previewUrl` on the `document` table. All the data in the column will be lost.
  - Added the required column `url` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `document` DROP COLUMN `downloadUrl`,
    DROP COLUMN `previewUrl`,
    ADD COLUMN `url` VARCHAR(191) NOT NULL;
