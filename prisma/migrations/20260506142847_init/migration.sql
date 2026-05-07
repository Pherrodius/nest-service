-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_name_key`(`name`),
    UNIQUE INDEX `User_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Question` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` ENUM('Choice', 'MultiChoice', 'TrueFalse') NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `optionId` INTEGER NOT NULL DEFAULT 0,
    `discipline` VARCHAR(191) NOT NULL,
    `subDiscipline` VARCHAR(191) NULL,
    `createdTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `likes` INTEGER NOT NULL DEFAULT 0,
    `dislikes` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Option` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` ENUM('A', 'B', 'C', 'D') NOT NULL,
    `text` VARCHAR(191) NOT NULL,
    `questionId` INTEGER NOT NULL,

    UNIQUE INDEX `Option_questionId_key_key`(`questionId`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SingleAnswer` (
    `questionId` INTEGER NOT NULL,
    `answerKey` ENUM('A', 'B', 'C', 'D') NOT NULL,

    PRIMARY KEY (`questionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MultiChoiceAnswer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `questionId` INTEGER NOT NULL,
    `answerKey` ENUM('A', 'B', 'C', 'D') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TrueFalseAnswer` (
    `questionId` INTEGER NOT NULL,
    `answerKey` ENUM('A', 'B', 'C', 'D') NOT NULL,

    PRIMARY KEY (`questionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Collection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `questionId` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` ENUM('Mistake', 'Note', 'Other') NOT NULL DEFAULT 'Mistake',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Option` ADD CONSTRAINT `Option_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SingleAnswer` ADD CONSTRAINT `SingleAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MultiChoiceAnswer` ADD CONSTRAINT `MultiChoiceAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TrueFalseAnswer` ADD CONSTRAINT `TrueFalseAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Collection` ADD CONSTRAINT `Collection_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
