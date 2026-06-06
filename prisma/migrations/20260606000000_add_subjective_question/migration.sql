ALTER TABLE `Question` MODIFY `type` ENUM('SingleChoice', 'MultiChoice', 'TrueFalse', 'Subjective') NOT NULL;

CREATE TABLE `SubjectiveAnswer` (
    `questionId` INTEGER NOT NULL,
    `reference` TEXT NOT NULL,

    PRIMARY KEY (`questionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `SubjectiveAnswer` ADD CONSTRAINT `SubjectiveAnswer_questionId_fkey`
FOREIGN KEY (`questionId`) REFERENCES `Question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
