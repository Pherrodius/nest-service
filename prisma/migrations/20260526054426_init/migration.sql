/*
  Warnings:

  - You are about to drop the column `type` on the `testhistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `testhistory` DROP COLUMN `type`,
    ADD COLUMN `disciplineId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `TestHistory` ADD CONSTRAINT `TestHistory_disciplineId_fkey` FOREIGN KEY (`disciplineId`) REFERENCES `Discipline`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
