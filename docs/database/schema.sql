-- Crypto World Cup Database Schema
-- Run this in your Supabase SQL editor to create the database tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Countries table
CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(3) NOT NULL UNIQUE, -- ISO 3166-1 alpha-3
  flag_emoji VARCHAR(10) NOT NULL,
  fifa_rank INTEGER,
  "group" VARCHAR(1), -- Group letter (A, B, C, etc.)
  qualified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team1_id UUID NOT NULL REFERENCES countries(id),
  team2_id UUID NOT NULL REFERENCES countries(id),
  contract_address VARCHAR(42) NOT NULL UNIQUE, -- Ethereum address
  match_start_time TIMESTAMPTZ NOT NULL,
  voting_end_time TIMESTAMPTZ NOT NULL,
  match_end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'voting', 'completed')),
  winning_team INTEGER CHECK (winning_team IN (0, 1, 255)), -- 0=team1, 1=team2, 255=tie
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT different_teams CHECK (team1_id != team2_id)
);

-- Votes table (indexed from blockchain events)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id),
  voter_address VARCHAR(42) NOT NULL, -- Ethereum address (lowercase)
  team_index INTEGER NOT NULL CHECK (team_index IN (0, 1)),
  vote_count INTEGER NOT NULL CHECK (vote_count > 0),
  total_cost_eth VARCHAR(50) NOT NULL, -- Store as string to preserve precision
  tx_hash VARCHAR(66) NOT NULL UNIQUE, -- Transaction hash
  block_number BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats table (aggregated statistics)
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR(42) NOT NULL UNIQUE, -- Ethereum address (lowercase)
  total_votes INTEGER DEFAULT 0,
  total_spent_eth VARCHAR(50) DEFAULT '0', -- Store as string to preserve precision
  total_won_eth VARCHAR(50) DEFAULT '0',
  matches_participated INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_start_time ON matches(match_start_time);
CREATE INDEX idx_matches_contract_address ON matches(contract_address);
CREATE INDEX idx_votes_match_id ON votes(match_id);
CREATE INDEX idx_votes_voter_address ON votes(voter_address);
CREATE INDEX idx_votes_tx_hash ON votes(tx_hash);
CREATE INDEX idx_votes_block_number ON votes(block_number);
CREATE INDEX idx_user_stats_wallet ON user_stats(wallet_address);
CREATE INDEX idx_user_stats_rank ON user_stats(rank);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON countries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_stats_updated_at
  BEFORE UPDATE ON user_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing (optional)
-- Uncomment to insert sample countries

/*
INSERT INTO countries (name, code, flag_emoji, fifa_rank, qualified) VALUES
  ('Brazil', 'BRA', '🇧🇷', 1, true),
  ('Argentina', 'ARG', '🇦🇷', 2, true),
  ('France', 'FRA', '🇫🇷', 3, true),
  ('England', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 4, true),
  ('Belgium', 'BEL', '🇧🇪', 5, true),
  ('Netherlands', 'NED', '🇳🇱', 6, true),
  ('Portugal', 'POR', '🇵🇹', 7, true),
  ('Spain', 'ESP', '🇪🇸', 8, true),
  ('Italy', 'ITA', '🇮🇹', 9, true),
  ('Germany', 'GER', '🇩🇪', 10, true),
  ('United States', 'USA', '🇺🇸', 13, true),
  ('Mexico', 'MEX', '🇲🇽', 15, true),
  ('Japan', 'JPN', '🇯🇵', 17, true),
  ('South Korea', 'KOR', '🇰🇷', 23, true),
  ('Canada', 'CAN', '🇨🇦', 41, true);
*/
