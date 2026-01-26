-- CreateTable
CREATE TABLE "indexer_state" (
    "chain_id" INTEGER NOT NULL,
    "last_indexed_block" BIGINT NOT NULL,
    "last_indexed_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "indexer_state_pkey" PRIMARY KEY ("chain_id")
);
