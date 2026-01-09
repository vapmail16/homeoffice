-- AlterTable: Add role to User with default
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'husband';

-- AlterTable: Add assignedToId as nullable first
ALTER TABLE "Task" ADD COLUMN     "assignedToId" TEXT;

-- Update existing tasks: assign them to their creator
UPDATE "Task" SET "assignedToId" = "userId";

-- Now make assignedToId NOT NULL
ALTER TABLE "Task" ALTER COLUMN "assignedToId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
