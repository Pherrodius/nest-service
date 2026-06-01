-- AlterTable
ALTER TABLE `user` ADD COLUMN `area` VARCHAR(191) NULL,
    ADD COLUMN `direction` VARCHAR(191) NULL,
    ADD COLUMN `gender` ENUM('男', '女') NULL,
    ADD COLUMN `introduction` VARCHAR(191) NULL;
