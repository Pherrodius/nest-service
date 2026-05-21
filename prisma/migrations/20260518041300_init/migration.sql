/*
  Warnings:

  - A unique constraint covering the columns `[userId,questionId,type]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Collection_userId_questionId_type_key` ON `Collection`(`userId`, `questionId`, `type`);
