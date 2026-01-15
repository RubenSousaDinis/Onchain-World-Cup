-- CreateTable
CREATE TABLE "qualification_votes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "wallet_address" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "amount_eth" DECIMAL(18,8) NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "block_number" BIGINT NOT NULL,
    "block_timestamp" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "qualification_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "wallet_address" TEXT NOT NULL,
    "total_votes" INTEGER NOT NULL DEFAULT 0,
    "total_spent_eth" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "total_won_eth" DECIMAL(18,8) NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "qualification_votes_tx_hash_key" ON "qualification_votes"("tx_hash");

-- CreateIndex
CREATE INDEX "qualification_votes_wallet_address_idx" ON "qualification_votes"("wallet_address");

-- CreateIndex
CREATE INDEX "qualification_votes_country_code_idx" ON "qualification_votes"("country_code");

-- CreateIndex
CREATE INDEX "qualification_votes_block_number_idx" ON "qualification_votes"("block_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_wallet_address_key" ON "user_stats"("wallet_address");

-- CreateIndex
CREATE INDEX "user_stats_wallet_address_idx" ON "user_stats"("wallet_address");

-- CreateIndex
CREATE INDEX "user_stats_rank_idx" ON "user_stats"("rank");
