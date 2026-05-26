-- CreateTable
CREATE TABLE `Document` (
    `filename` VARCHAR(191) NOT NULL,
    `originalName` VARCHAR(191) NOT NULL,
    `previewUrl` VARCHAR(191) NOT NULL,
    `downloadUrl` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `fileType` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `downloadCount` INTEGER NOT NULL DEFAULT 0,
    `createdTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`filename`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
