/**
 * Server-side Supabase client
 *
 * IMPORTANT: This file should ONLY be imported in API routes and server components.
 * DO NOT import this in client components or it will expose your service role key.
 *
 * Usage:
 *   import { getSupabaseClient } from '@/lib/server/supabase'
 *
 *   const supabase = getSupabaseClient()
 *   const { data, error } = await supabase.from('matches').select('*')
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

/**
 * Get server-side Supabase client with service role key
 * This client has full admin access - use only in API routes
 */
export function getSupabaseClient(): SupabaseClient {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  // Singleton pattern - reuse client instance
  if (!supabaseInstance) {
    supabaseInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )
  }

  return supabaseInstance
}

/**
 * Type-safe database types
 * TODO: Generate these from Supabase schema using `supabase gen types typescript`
 */
export interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          id: string
          name: string
          code: string
          flag_emoji: string
          fifa_rank: number | null
          group: string | null
          qualified: boolean
          tournament_id: string | null
          qualification_status: 'competing' | 'qualified' | 'eliminated' | 'host' | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['countries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['countries']['Insert']>
      }
      matches: {
        Row: {
          id: string
          team1_id: string
          team2_id: string
          contract_address: string
          match_start_time: string
          voting_end_time: string
          match_end_time: string
          status: 'upcoming' | 'voting' | 'completed'
          winning_team: number | null
          tournament_id: string | null
          phase_id: string | null
          group_id: string | null
          match_number: number | null
          is_qualification: boolean
          team1_score: number | null
          team2_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
      }
      votes: {
        Row: {
          id: string
          match_id: string
          voter_address: string
          team_index: number
          vote_count: number
          total_cost_eth: string
          tx_hash: string
          block_number: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['votes']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['votes']['Insert']>
      }
      user_stats: {
        Row: {
          id: string
          wallet_address: string
          total_votes: number
          total_spent_eth: string
          total_won_eth: string
          matches_participated: number
          matches_won: number
          rank: number | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_stats']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_stats']['Insert']>
      }
      tournaments: {
        Row: {
          id: string
          name: string
          year: number
          host_countries: string[]
          total_teams: number
          start_date: string
          end_date: string
          status: 'upcoming' | 'qualification' | 'group_stage' | 'knockout' | 'completed'
          current_phase: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tournaments']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tournaments']['Insert']>
      }
      tournament_phases: {
        Row: {
          id: string
          tournament_id: string
          name: string
          display_name: string
          phase_order: number
          start_date: string | null
          end_date: string | null
          status: 'upcoming' | 'active' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tournament_phases']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tournament_phases']['Insert']>
      }
      groups: {
        Row: {
          id: string
          tournament_id: string
          name: string
          display_name: string
          max_teams: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['groups']['Insert']>
      }
      group_standings: {
        Row: {
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
          position: number | null
          qualified: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['group_standings']['Row'], 'id' | 'vote_difference' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['group_standings']['Insert']>
      }
    }
  }
}
