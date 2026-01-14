-- Migration: Add Tournament Structure
-- Run this AFTER the initial schema.sql has been executed

-- Tournaments table (e.g., World Cup 2026)
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  host_countries TEXT[], -- Array of host country codes
  total_teams INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'qualification', 'group_stage', 'knockout', 'completed')),
  current_phase VARCHAR(30),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament phases (qualification, group stage, knockout rounds)
CREATE TABLE tournament_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL, -- 'qualification', 'group_stage', 'round_of_16', 'quarter_final', 'semi_final', 'final'
  display_name VARCHAR(100) NOT NULL,
  phase_order INTEGER NOT NULL, -- 1=qualification, 2=group_stage, 3=round_of_16, etc.
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, name)
);

-- Groups for group stage (Group A, B, C, etc.)
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name VARCHAR(1) NOT NULL, -- 'A', 'B', 'C', etc.
  display_name VARCHAR(20) NOT NULL, -- 'Group A', 'Group B', etc.
  max_teams INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, name)
);

-- Group standings (team performance in group stage)
CREATE TABLE group_standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  vote_difference INTEGER GENERATED ALWAYS AS (votes_for - votes_against) STORED,
  points INTEGER DEFAULT 0, -- 3 points per win, 1 per draw
  position INTEGER, -- 1st, 2nd, 3rd, 4th in group
  qualified BOOLEAN DEFAULT false, -- Top 2 qualify for knockout
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, country_id)
);

-- Update matches table to include tournament context
ALTER TABLE matches
  ADD COLUMN tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  ADD COLUMN phase_id UUID REFERENCES tournament_phases(id) ON DELETE SET NULL,
  ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE SET NULL,
  ADD COLUMN match_number INTEGER, -- Sequential number within phase
  ADD COLUMN is_qualification BOOLEAN DEFAULT false,
  ADD COLUMN team1_score INTEGER, -- Actual match result (for group standings)
  ADD COLUMN team2_score INTEGER;

-- Update countries table to include tournament participation
ALTER TABLE countries
  ADD COLUMN tournament_id UUID REFERENCES tournaments(id) ON DELETE SET NULL,
  ADD COLUMN qualification_status VARCHAR(20) CHECK (qualification_status IN ('competing', 'qualified', 'eliminated', 'host'));

-- Indexes for performance
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournament_phases_tournament ON tournament_phases(tournament_id);
CREATE INDEX idx_tournament_phases_order ON tournament_phases(phase_order);
CREATE INDEX idx_groups_tournament ON groups(tournament_id);
CREATE INDEX idx_group_standings_group ON group_standings(group_id);
CREATE INDEX idx_group_standings_country ON group_standings(country_id);
CREATE INDEX idx_group_standings_points ON group_standings(points DESC);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);
CREATE INDEX idx_matches_phase ON matches(phase_id);
CREATE INDEX idx_matches_group ON matches(group_id);

-- Add updated_at triggers
CREATE TRIGGER update_tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_phases_updated_at
  BEFORE UPDATE ON tournament_phases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_standings_updated_at
  BEFORE UPDATE ON group_standings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate group standings
CREATE OR REPLACE FUNCTION calculate_group_standings(p_group_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Update standings based on match results in this group
  UPDATE group_standings gs
  SET
    matches_played = (
      SELECT COUNT(*)
      FROM matches m
      WHERE m.group_id = p_group_id
        AND (m.team1_id = gs.country_id OR m.team2_id = gs.country_id)
        AND m.team1_score IS NOT NULL
        AND m.team2_score IS NOT NULL
    ),
    wins = (
      SELECT COUNT(*)
      FROM matches m
      WHERE m.group_id = p_group_id
        AND m.team1_score IS NOT NULL
        AND m.team2_score IS NOT NULL
        AND (
          (m.team1_id = gs.country_id AND m.team1_score > m.team2_score) OR
          (m.team2_id = gs.country_id AND m.team2_score > m.team1_score)
        )
    ),
    draws = (
      SELECT COUNT(*)
      FROM matches m
      WHERE m.group_id = p_group_id
        AND (m.team1_id = gs.country_id OR m.team2_id = gs.country_id)
        AND m.team1_score IS NOT NULL
        AND m.team2_score = m.team1_score
    ),
    losses = (
      SELECT COUNT(*)
      FROM matches m
      WHERE m.group_id = p_group_id
        AND m.team1_score IS NOT NULL
        AND m.team2_score IS NOT NULL
        AND (
          (m.team1_id = gs.country_id AND m.team1_score < m.team2_score) OR
          (m.team2_id = gs.country_id AND m.team2_score < m.team1_score)
        )
    ),
    votes_for = (
      SELECT COALESCE(SUM(
        CASE
          WHEN m.team1_id = gs.country_id THEN m.team1_score
          WHEN m.team2_id = gs.country_id THEN m.team2_score
          ELSE 0
        END
      ), 0)
      FROM matches m
      WHERE m.group_id = p_group_id
        AND (m.team1_id = gs.country_id OR m.team2_id = gs.country_id)
        AND m.team1_score IS NOT NULL
        AND m.team2_score IS NOT NULL
    ),
    votes_against = (
      SELECT COALESCE(SUM(
        CASE
          WHEN m.team1_id = gs.country_id THEN m.team2_score
          WHEN m.team2_id = gs.country_id THEN m.team1_score
          ELSE 0
        END
      ), 0)
      FROM matches m
      WHERE m.group_id = p_group_id
        AND (m.team1_id = gs.country_id OR m.team2_id = gs.country_id)
        AND m.team1_score IS NOT NULL
        AND m.team2_score IS NOT NULL
    )
  WHERE gs.group_id = p_group_id;

  -- Calculate points (3 for win, 1 for draw)
  UPDATE group_standings
  SET points = (wins * 3) + draws
  WHERE group_id = p_group_id;

  -- Assign positions based on points, then vote difference
  WITH ranked AS (
    SELECT
      id,
      ROW_NUMBER() OVER (
        ORDER BY points DESC, vote_difference DESC, votes_for DESC
      ) as rank
    FROM group_standings
    WHERE group_id = p_group_id
  )
  UPDATE group_standings gs
  SET
    position = ranked.rank,
    qualified = (ranked.rank <= 2) -- Top 2 teams qualify
  FROM ranked
  WHERE gs.id = ranked.id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate standings when match results are updated
CREATE OR REPLACE FUNCTION trigger_recalculate_standings()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.group_id IS NOT NULL AND NEW.team1_score IS NOT NULL THEN
    PERFORM calculate_group_standings(NEW.group_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recalculate_standings_on_match_result
  AFTER INSERT OR UPDATE OF team1_score, team2_score ON matches
  FOR EACH ROW
  WHEN (NEW.group_id IS NOT NULL)
  EXECUTE FUNCTION trigger_recalculate_standings();

-- Sample data: World Cup 2026
INSERT INTO tournaments (name, year, host_countries, total_teams, start_date, end_date, status, current_phase)
VALUES (
  'FIFA World Cup 2026',
  2026,
  ARRAY['USA', 'MEX', 'CAN'],
  48,
  '2026-06-11',
  '2026-07-19',
  'upcoming',
  'qualification'
);

-- Get the tournament ID for subsequent inserts
DO $$
DECLARE
  tournament_uuid UUID;
BEGIN
  SELECT id INTO tournament_uuid FROM tournaments WHERE year = 2026 LIMIT 1;

  -- Insert tournament phases
  INSERT INTO tournament_phases (tournament_id, name, display_name, phase_order, status) VALUES
    (tournament_uuid, 'qualification', 'Qualification Phase', 1, 'active'),
    (tournament_uuid, 'group_stage', 'Group Stage', 2, 'upcoming'),
    (tournament_uuid, 'round_of_16', 'Round of 16', 3, 'upcoming'),
    (tournament_uuid, 'quarter_final', 'Quarter Finals', 4, 'upcoming'),
    (tournament_uuid, 'semi_final', 'Semi Finals', 5, 'upcoming'),
    (tournament_uuid, 'third_place', 'Third Place Playoff', 6, 'upcoming'),
    (tournament_uuid, 'final', 'Final', 7, 'upcoming');

  -- Insert groups (12 groups of 4 teams each for 48-team format)
  INSERT INTO groups (tournament_id, name, display_name, max_teams) VALUES
    (tournament_uuid, 'A', 'Group A', 4),
    (tournament_uuid, 'B', 'Group B', 4),
    (tournament_uuid, 'C', 'Group C', 4),
    (tournament_uuid, 'D', 'Group D', 4),
    (tournament_uuid, 'E', 'Group E', 4),
    (tournament_uuid, 'F', 'Group F', 4),
    (tournament_uuid, 'G', 'Group G', 4),
    (tournament_uuid, 'H', 'Group H', 4),
    (tournament_uuid, 'I', 'Group I', 4),
    (tournament_uuid, 'J', 'Group J', 4),
    (tournament_uuid, 'K', 'Group K', 4),
    (tournament_uuid, 'L', 'Group L', 4);
END $$;
