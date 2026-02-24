-- CreateTable
CREATE TABLE "content_posts" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "topic" TEXT,
    "ai_generated" BOOLEAN NOT NULL DEFAULT false,
    "prompt" TEXT,
    "metadata" JSONB,
    "published_at" TIMESTAMPTZ(6),
    "scheduled_at" TIMESTAMPTZ(6),
    "performance_rating" TEXT,
    "performance_notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_posts_type_idx" ON "content_posts"("type");

-- CreateIndex
CREATE INDEX "content_posts_status_idx" ON "content_posts"("status");

-- CreateIndex
CREATE INDEX "content_posts_created_at_idx" ON "content_posts"("created_at");

-- CreateIndex
CREATE INDEX "content_posts_performance_rating_idx" ON "content_posts"("performance_rating");
