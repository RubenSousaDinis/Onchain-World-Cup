/**
 * API Response Types
 *
 * Type definitions for API endpoints matching the Supabase schema
 */

// Country
export interface Country {
  id: string
  name: string
  code: string
  flag_emoji: string
  fifa_rank?: number
  group?: string
  qualified: boolean
  created_at: string
}

// Match
export interface Match {
  id: string
  team1_id: string
  team2_id: string
  contract_address: string
  match_start_time: string
  voting_end_time: string
  match_end_time: string
  status: 'upcoming' | 'voting' | 'completed'
  winner_team_id?: string
  tournament_phase_id?: string
  created_at: string
  // Relations
  team1?: Country
  team2?: Country
}

// Vote
export interface Vote {
  id: string
  match_id: string
  user_address: string
  team_id: string
  amount_eth: string
  nft_id?: string
  transaction_hash: string
  block_number: number
  voted_at: string
}

// User Stats
export interface UserStats {
  user_address: string
  total_votes: number
  total_wagered_eth: string
  total_won_eth: string
  matches_participated: number
  matches_won: number
  win_rate: number
  updated_at: string
  rank?: number
}

// Tournament
export interface Tournament {
  id: string
  name: string
  year: number
  start_date: string
  end_date: string
  status: 'upcoming' | 'ongoing' | 'completed'
  created_at: string
}

// Tournament Phase
export interface TournamentPhase {
  id: string
  tournament_id: string
  phase_name: string
  phase_type: 'qualification' | 'group_stage' | 'round_of_32' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final'
  start_date: string
  end_date: string
  created_at: string
}

// Group
export interface Group {
  id: string
  tournament_id: string
  name: string
  display_name: string
  max_teams: number
  created_at: string
  standings?: GroupStanding[]
}

// Group Standing
export interface GroupStanding {
  id: string
  group_id: string
  country_id: string
  matches_played: number
  wins: number
  draws: number
  losses: number
  votes_for: number
  votes_against: number
  vote_difference: number
  points: number
  position?: number
  qualified: boolean
  created_at: string
  updated_at: string
  // Relations
  country?: Country
  group?: Group
}

/**
 * API Response Wrappers
 */

export interface ApiResponse<T> {
  data: T
  count?: number
  limit?: number
  offset?: number
}

export interface ApiError {
  error: string
  details?: string
}

/**
 * Query Parameters
 */

export interface MatchesQueryParams {
  status?: 'upcoming' | 'voting' | 'completed'
  limit?: number
  offset?: number
}

export interface CountriesQueryParams {
  qualified?: boolean
  group?: string
  limit?: number
  offset?: number
}

export interface LeaderboardQueryParams {
  limit?: number
  offset?: number
  sort_by?: 'total_won_eth' | 'total_votes' | 'matches_won'
}

export interface VotesQueryParams {
  match_id?: string
  user_address?: string
  team_id?: string
  limit?: number
  offset?: number
}
