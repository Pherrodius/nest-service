/*
  Warnings:

  - You are about to drop the column `description` on the `collection` table. All the data in the column will be lost.
  - You are about to alter the column `type` on the `collection` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `Enum(EnumId(5))`.
  - You are about to drop the column `discipline` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `dislikes` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `subDiscipline` on the `question` table. All the data in the column will be lost.
  - Added the required column `bankId` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `disciplineId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `collection` DROP COLUMN `description`,
    MODIFY `type` ENUM('Mistake', 'Note') NOT NULL DEFAULT 'Note';

-- AlterTable
ALTER TABLE `question` DROP COLUMN `discipline`,
    DROP COLUMN `dislikes`,
    DROP COLUMN `likes`,
    DROP COLUMN `subDiscipline`,
    ADD COLUMN `bankId` INTEGER NOT NULL,
    ADD COLUMN `disciplineId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Bank` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `creatorId` INTEGER NOT NULL,
    `createdTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Bank_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Discipline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Discipline_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_BankToDiscipline` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_BankToDiscipline_AB_unique`(`A`, `B`),
    INDEX `_BankToDiscipline_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Bank` ADD CONSTRAINT `Bank_creatorId_fkey` FOREIGN KEY (`creatorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `Bank`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_disciplineId_fkey` FOREIGN KEY (`disciplineId`) REFERENCES `Discipline`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BankToDiscipline` ADD CONSTRAINT `_BankToDiscipline_A_fkey` FOREIGN KEY (`A`) REFERENCES `Bank`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_BankToDiscipline` ADD CONSTRAINT `_BankToDiscipline_B_fkey` FOREIGN KEY (`B`) REFERENCES `Discipline`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
