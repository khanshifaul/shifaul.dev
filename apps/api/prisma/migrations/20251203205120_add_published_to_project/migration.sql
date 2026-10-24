-- AlterTable
ALTER TABLE "blog_posts" ALTER COLUMN "published" SET DEFAULT false;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "projects_published_idx" ON "projects"("published");
