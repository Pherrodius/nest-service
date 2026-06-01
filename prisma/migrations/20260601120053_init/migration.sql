-- DropForeignKey
ALTER TABLE `bankcollection` DROP FOREIGN KEY `BankCollection_bankId_fkey`;

-- DropForeignKey
ALTER TABLE `bankcollection` DROP FOREIGN KEY `BankCollection_userId_fkey`;

-- DropForeignKey
ALTER TABLE `collection` DROP FOREIGN KEY `Collection_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `collection` DROP FOREIGN KEY `Collection_userId_fkey`;

-- DropForeignKey
ALTER TABLE `multichoiceanswer` DROP FOREIGN KEY `MultiChoiceAnswer_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `option` DROP FOREIGN KEY `Option_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `Question_bankId_fkey`;

-- DropForeignKey
ALTER TABLE `question` DROP FOREIGN KEY `Question_disciplineId_fkey`;

-- DropForeignKey
ALTER TABLE `resolution` DROP FOREIGN KEY `Resolution_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `resolution` DROP FOREIGN KEY `Resolution_userId_fkey`;

-- DropForeignKey
ALTER TABLE `singleanswer` DROP FOREIGN KEY `SingleAnswer_questionId_fkey`;

-- DropForeignKey
ALTER TABLE `testhistory` DROP FOREIGN KEY `TestHistory_bankId_fkey`;

-- DropForeignKey
ALTER TABLE `testhistory` DROP FOREIGN KEY `TestHistory_userId_fkey`;

-- DropForeignKey
ALTER TABLE `truefalseanswer` DROP FOREIGN KEY `TrueFalseAnswer_questionId_fkey`;

-- DropIndex
DROP INDEX `BankCollection_bankId_fkey` ON `bankcollection`;

-- DropIndex
DROP INDEX `Collection_questionId_fkey` ON `collection`;

-- DropIndex
DROP INDEX `MultiChoiceAnswer_questionId_fkey` ON `multichoiceanswer`;

-- DropIndex
DROP INDEX `Question_bankId_fkey` ON `question`;

-- DropIndex
DROP INDEX `Question_disciplineId_fkey` ON `question`;

-- DropIndex
DROP INDEX `Resolution_questionId_fkey` ON `resolution`;

-- DropIndex
DROP INDEX `TestHistory_bankId_fkey` ON `testhistory`;

-- DropIndex
DROP INDEX `TestHistory_userId_fkey` ON `testhistory`;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `Bank`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Question` ADD CONSTRAINT `Question_disciplineId_fkey` FOREIGN KEY (`disciplineId`) REFERENCES `Discipline`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Option` ADD CONSTRAINT `Option_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SingleAnswer` ADD CONSTRAINT `SingleAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MultiChoiceAnswer` ADD CONSTRAINT `MultiChoiceAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrueFalseAnswer` ADD CONSTRAINT `TrueFalseAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankCollection` ADD CONSTRAINT `BankCollection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BankCollection` ADD CONSTRAINT `BankCollection_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `Bank`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resolution` ADD CONSTRAINT `Resolution_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Resolution` ADD CONSTRAINT `Resolution_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestHistory` ADD CONSTRAINT `TestHistory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TestHistory` ADD CONSTRAINT `TestHistory_bankId_fkey` FOREIGN KEY (`bankId`) REFERENCES `Bank`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
