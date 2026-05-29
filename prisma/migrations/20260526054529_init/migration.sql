/*
  Warnings:

  - Made the column `disciplineId` on table `testhistory` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `testhistory` DROP FOREIGN KEY `TestHistory_disciplineId_fkey`;

-- DropIndex
DROP INDEX `TestHistory_disciplineId_fkey` ON `testhistory`;

-- AlterTable
ALTER TABLE `testhistory` MODIFY `disciplineId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `TestHistory` ADD CONSTRAINT `TestHistory_disciplineId_fkey` FOREIGN KEY (`disciplineId`) REFERENCES `Discipline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
