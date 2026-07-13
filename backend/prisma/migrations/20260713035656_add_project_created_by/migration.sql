-- Add createdBy column as nullable first so existing rows are not blocked
ALTER TABLE `Project` ADD COLUMN `createdBy` INTEGER NULL;

-- Backfill: for existing projects, set the creator to the current manager
-- (managerId is the best proxy — whoever is managing was likely the creator)
UPDATE `Project` SET `createdBy` = `managerId` WHERE `createdBy` IS NULL;

-- Now enforce NOT NULL
ALTER TABLE `Project` MODIFY COLUMN `createdBy` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
