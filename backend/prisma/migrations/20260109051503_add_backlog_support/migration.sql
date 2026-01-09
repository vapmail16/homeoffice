-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "isBacklog" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "expectedDate" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Task_isBacklog_idx" ON "Task"("isBacklog");
