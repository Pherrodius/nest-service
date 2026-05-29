/*
  Warnings:

  - You are about to alter the column `yourAnswer` on the `resolution` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.
  - You are about to alter the column `correctAnswer` on the `resolution` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `resolution` MODIFY `yourAnswer` JSON NOT NULL,
    MODIFY `correctAnswer` JSON NOT NULL;
