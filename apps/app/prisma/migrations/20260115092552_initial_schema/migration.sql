-- CreateTable
CREATE TABLE "countries" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "flag_emoji" TEXT NOT NULL,
    "fifa_rank" INTEGER,
    "group" TEXT,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "tournament_id" UUID,
    "qualification_status" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournaments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "host_countries" TEXT[],
    "total_teams" INTEGER NOT NULL,
    "start_date" TIMESTAMPTZ(6) NOT NULL,
    "end_date" TIMESTAMPTZ(6) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "current_phase" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_phases" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tournament_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "phase_order" INTEGER NOT NULL,
    "start_date" TIMESTAMPTZ(6),
    "end_date" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_phases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "tournament_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "max_teams" INTEGER NOT NULL DEFAULT 4,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_standings" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "group_id" UUID NOT NULL,
    "country_id" UUID NOT NULL,
    "matches_played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "votes_for" INTEGER NOT NULL DEFAULT 0,
    "votes_against" INTEGER NOT NULL DEFAULT 0,
    "vote_difference" INTEGER,
    "points" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_standings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "team1_id" UUID NOT NULL,
    "team2_id" UUID NOT NULL,
    "contract_address" TEXT NOT NULL,
    "match_start_time" TIMESTAMPTZ(6) NOT NULL,
    "voting_end_time" TIMESTAMPTZ(6) NOT NULL,
    "match_end_time" TIMESTAMPTZ(6) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "winning_team" INTEGER,
    "tournament_id" UUID,
    "phase_id" UUID,
    "group_id" UUID,
    "match_number" INTEGER,
    "is_qualification" BOOLEAN NOT NULL DEFAULT false,
    "team1_score" INTEGER,
    "team2_score" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "match_id" UUID NOT NULL,
    "voter_address" TEXT NOT NULL,
    "team_index" INTEGER NOT NULL,
    "vote_count" INTEGER NOT NULL,
    "total_cost_eth" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "block_number" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "wallet_address" TEXT NOT NULL,
    "total_votes" INTEGER NOT NULL DEFAULT 0,
    "total_spent_eth" TEXT NOT NULL DEFAULT '0',
    "total_won_eth" TEXT NOT NULL DEFAULT '0',
    "matches_participated" INTEGER NOT NULL DEFAULT 0,
    "matches_won" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "countries_code_key" ON "countries"("code");

-- CreateIndex
CREATE INDEX "countries_code_idx" ON "countries"("code");

-- CreateIndex
CREATE INDEX "countries_qualified_idx" ON "countries"("qualified");

-- CreateIndex
CREATE INDEX "tournament_phases_tournament_id_idx" ON "tournament_phases"("tournament_id");

-- CreateIndex
CREATE INDEX "group_standings_group_id_idx" ON "group_standings"("group_id");

-- CreateIndex
CREATE UNIQUE INDEX "group_standings_group_id_country_id_key" ON "group_standings"("group_id", "country_id");

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "matches_tournament_id_idx" ON "matches"("tournament_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_tx_hash_key" ON "votes"("tx_hash");

-- CreateIndex
CREATE INDEX "votes_match_id_idx" ON "votes"("match_id");

-- CreateIndex
CREATE INDEX "votes_voter_address_idx" ON "votes"("voter_address");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_wallet_address_key" ON "user_stats"("wallet_address");

-- CreateIndex
CREATE INDEX "user_stats_wallet_address_idx" ON "user_stats"("wallet_address");

-- AddForeignKey
ALTER TABLE "countries" ADD CONSTRAINT "countries_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_phases" ADD CONSTRAINT "tournament_phases_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_standings" ADD CONSTRAINT "group_standings_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_standings" ADD CONSTRAINT "group_standings_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team1_id_fkey" FOREIGN KEY ("team1_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_team2_id_fkey" FOREIGN KEY ("team2_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "tournament_phases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
