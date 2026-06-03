-- AlterTable
ALTER TABLE `document` ADD COLUMN `status` ENUM('Uploaded', 'Pending', 'Resolved', 'Rejected') NOT NULL DEFAULT 'Uploaded';
