-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "completedDate" TIMESTAMP(3),
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Task_isCompleted_idx" ON "Task"("isCompleted");
