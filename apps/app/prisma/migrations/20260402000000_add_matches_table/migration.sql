-- CreateTable
CREATE TABLE "matches" (
    "id"               UUID        NOT NULL DEFAULT uuid_generate_v4(),
    "team1_code"       TEXT        NOT NULL,
    "team2_code"       TEXT        NOT NULL,
    "contract_address" TEXT        NOT NULL DEFAULT '0x0000000000000000000000000000000000000000',
    "match_start_time" TIMESTAMPTZ(6) NOT NULL,
    "voting_end_time"  TIMESTAMPTZ(6) NOT NULL,
    "match_end_time"   TIMESTAMPTZ(6) NOT NULL,
    "status"           TEXT        NOT NULL DEFAULT 'upcoming',
    "match_type"       TEXT        NOT NULL DEFAULT 'onchain',
    "winning_team"     INTEGER,
    "team1_score"      INTEGER,
    "team2_score"      INTEGER,
    "created_at"       TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matches_status_idx" ON "matches"("status");

-- CreateIndex
CREATE INDEX "matches_start_time_idx" ON "matches"("match_start_time");

-- CreateIndex
CREATE INDEX "matches_type_idx" ON "matches"("match_type");
