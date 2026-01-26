/**
 * OpenAPI specification for Crypto World Cup API
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Crypto World Cup API',
    version: '1.0.0',
    description: 'Server-side API for the Crypto World Cup voting platform',
    contact: {
      name: 'API Support',
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_APP_DOMAIN || 'http://localhost:3000',
      description: 'API Server',
    },
  ],
  tags: [
    { name: 'Indexer', description: 'Blockchain event indexing and synchronization' },
    { name: 'Qualification', description: 'Qualification phase data and statistics' },
    { name: 'Matches', description: 'Match management and queries' },
    { name: 'Countries', description: 'Country/team data' },
    { name: 'Votes', description: 'Vote tracking and history' },
    { name: 'Users', description: 'User statistics and profiles' },
    { name: 'Leaderboard', description: 'Rankings and leaderboards' },
    { name: 'Tournaments', description: 'Tournament management' },
    { name: 'Groups', description: 'Group stage management' },
    { name: 'Standings', description: 'Group standings and rankings' },
  ],
  paths: {
    '/api/indexer/sync': {
      get: {
        tags: ['Indexer'],
        summary: 'Get indexer status',
        description: 'Check the current status and last indexed block for a blockchain',
        parameters: [
          {
            name: 'chainId',
            in: 'query',
            schema: { type: 'integer', enum: [84532, 8453], default: 84532 },
            description: 'Chain ID (84532 for Base Sepolia, 8453 for Base Mainnet)',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    chainId: { type: 'integer' },
                    lastIndexedBlock: { type: 'string', nullable: true },
                    lastIndexedAt: { type: 'string', format: 'date-time', nullable: true },
                    status: { type: 'string', enum: ['ready', 'not_initialized'] },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid chainId' },
        },
      },
      post: {
        tags: ['Indexer'],
        summary: 'Sync blockchain events',
        description: 'Trigger blockchain event indexing and database updates',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['chainId'],
                properties: {
                  chainId: {
                    type: 'integer',
                    enum: [84532, 8453],
                    description: 'Chain ID (84532 for Base Sepolia, 8453 for Base Mainnet)',
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Sync completed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    chainId: { type: 'integer' },
                    blockRange: {
                      type: 'object',
                      properties: {
                        from: { type: 'string' },
                        to: { type: 'string' },
                      },
                    },
                    processed: {
                      type: 'object',
                      properties: {
                        votes: { type: 'integer' },
                        qualifications: { type: 'integer' },
                        claims: { type: 'integer' },
                        countries: { type: 'integer' },
                      },
                    },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid chainId' },
          500: { description: 'Sync failed' },
        },
      },
    },
    '/api/qualification/countries': {
      get: {
        tags: ['Qualification'],
        summary: 'List qualification country statistics',
        description: 'Fetch aggregated voting statistics for all countries',
        parameters: [
          {
            name: 'qualified',
            in: 'query',
            schema: { type: 'string', enum: ['true', 'false'] },
            description: 'Filter by qualification status',
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['votes', 'eth', 'code'], default: 'votes' },
            description: 'Sort field',
          },
          {
            name: 'order',
            in: 'query',
            schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
            description: 'Sort order',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50, maximum: 100 },
            description: 'Maximum number of results',
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Pagination offset',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/CountryStats' },
                    },
                    count: { type: 'integer' },
                    limit: { type: 'integer' },
                    offset: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/qualification/countries/{code}': {
      get: {
        tags: ['Qualification'],
        summary: 'Get country statistics',
        description: 'Fetch detailed statistics for a specific country including rank and top voters',
        parameters: [
          {
            name: 'code',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Country code (e.g., US, BR, GB-ENG)',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/CountryStatsDetailed' },
                  },
                },
              },
            },
          },
          404: { description: 'Country not found' },
        },
      },
    },
    '/api/qualification/votes': {
      get: {
        tags: ['Qualification'],
        summary: 'List qualification votes',
        description: 'Fetch vote history with filtering and pagination',
        parameters: [
          {
            name: 'country',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by country code',
          },
          {
            name: 'voter',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by voter address',
          },
          {
            name: 'sort',
            in: 'query',
            schema: { type: 'string', enum: ['recent', 'oldest', 'votes', 'cost'], default: 'recent' },
            description: 'Sort field',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 20, maximum: 100 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/QualificationVote' },
                    },
                    count: { type: 'integer' },
                    limit: { type: 'integer' },
                    offset: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/qualification/leaderboard': {
      get: {
        tags: ['Qualification'],
        summary: 'Get qualification leaderboard',
        description: 'Fetch top users by various metrics',
        parameters: [
          {
            name: 'metric',
            in: 'query',
            schema: { type: 'string', enum: ['votes', 'spent', 'countries'], default: 'votes' },
            description: 'Sort metric (votes: total votes, spent: ETH spent, countries: number of countries voted for)',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 10, maximum: 100 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/LeaderboardEntry' },
                    },
                    count: { type: 'integer' },
                    limit: { type: 'integer' },
                    offset: { type: 'integer' },
                    metric: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/qualification/summary': {
      get: {
        tags: ['Qualification'],
        summary: 'Get qualification summary',
        description: 'Fetch overall statistics, top countries, recent votes, and top voters',
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/QualificationSummary' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/matches': {
      get: {
        tags: ['Matches'],
        summary: 'List all matches',
        description: 'Fetch all matches with optional filters',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['upcoming', 'voting', 'completed'] },
            description: 'Filter by match status',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50 },
            description: 'Maximum number of results',
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
            description: 'Pagination offset',
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Match' } },
                    count: { type: 'integer' },
                    limit: { type: 'integer' },
                    offset: { type: 'integer' },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Matches'],
        summary: 'Create a new match',
        description: 'Create a new match (admin only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMatch' },
            },
          },
        },
        responses: {
          201: { description: 'Match created successfully' },
          400: { description: 'Invalid input' },
          500: { description: 'Internal server error' },
        },
      },
    },
    '/api/matches/{id}': {
      get: {
        tags: ['Matches'],
        summary: 'Get match by ID',
        description: 'Fetch a single match with full details including votes',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Match ID',
          },
        ],
        responses: {
          200: { description: 'Successful response' },
          404: { description: 'Match not found' },
        },
      },
      patch: {
        tags: ['Matches'],
        summary: 'Update match',
        description: 'Update match status or result (admin only)',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['upcoming', 'voting', 'completed'] },
                  winning_team: { type: 'integer', enum: [0, 1, 255] },
                  team1_score: { type: 'integer' },
                  team2_score: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Match updated successfully' },
        },
      },
    },
    '/api/countries': {
      get: {
        tags: ['Countries'],
        summary: 'List all countries',
        parameters: [
          {
            name: 'qualified',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'Filter by qualification status',
          },
          {
            name: 'group',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by group (A, B, C, etc.)',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 100 },
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer', default: 0 },
          },
        ],
        responses: {
          200: { description: 'Successful response' },
        },
      },
    },
    '/api/votes': {
      get: {
        tags: ['Votes'],
        summary: 'List votes',
        parameters: [
          {
            name: 'match_id',
            in: 'query',
            schema: { type: 'string', format: 'uuid' },
            description: 'Filter by match ID',
          },
          {
            name: 'voter_address',
            in: 'query',
            schema: { type: 'string' },
            description: 'Filter by voter wallet address',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 50 },
          },
        ],
        responses: {
          200: { description: 'Successful response' },
        },
      },
    },
    '/api/users/{address}': {
      get: {
        tags: ['Users'],
        summary: 'Get user statistics',
        description: 'Fetch user stats and voting history by wallet address',
        parameters: [
          {
            name: 'address',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Wallet address',
          },
        ],
        responses: {
          200: { description: 'Successful response' },
        },
      },
    },
    '/api/leaderboard': {
      get: {
        tags: ['Leaderboard'],
        summary: 'Get leaderboard',
        parameters: [
          {
            name: 'sort_by',
            in: 'query',
            schema: { type: 'string', enum: ['total_won_eth', 'total_votes', 'matches_won'], default: 'total_won_eth' },
            description: 'Sort field',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', default: 100 },
          },
        ],
        responses: {
          200: { description: 'Successful response' },
        },
      },
    },
    '/api/tournaments': {
      get: {
        tags: ['Tournaments'],
        summary: 'List tournaments',
        parameters: [
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['upcoming', 'qualification', 'group_stage', 'knockout', 'completed'] },
          },
          {
            name: 'year',
            in: 'query',
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: { description: 'Successful response' },
        },
      },
    },
    '/api/tournaments/{id}/groups': {
      get: {
        tags: ['Groups'],
        summary: 'Get tournament groups',
        description: 'Fetch all groups for a tournament with standings',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Group' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/groups/{id}/standings': {
      get: {
        tags: ['Standings'],
        summary: 'Get group standings',
        description: 'Fetch standings for a specific group',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Standing' } },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ['Standings'],
        summary: 'Recalculate standings',
        description: 'Manually trigger standings recalculation for a group',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Standings recalculated successfully' },
        },
      },
    },
  },
  components: {
    schemas: {
      Match: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          team1_id: { type: 'string', format: 'uuid' },
          team2_id: { type: 'string', format: 'uuid' },
          contract_address: { type: 'string' },
          match_start_time: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['upcoming', 'voting', 'completed'] },
          team1: { $ref: '#/components/schemas/Country' },
          team2: { $ref: '#/components/schemas/Country' },
        },
      },
      Country: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          code: { type: 'string' },
          flag_emoji: { type: 'string' },
          fifa_rank: { type: 'integer', nullable: true },
        },
      },
      CreateMatch: {
        type: 'object',
        required: ['team1_id', 'team2_id', 'contract_address', 'match_start_time'],
        properties: {
          team1_id: { type: 'string', format: 'uuid' },
          team2_id: { type: 'string', format: 'uuid' },
          contract_address: { type: 'string' },
          match_start_time: { type: 'string', format: 'date-time' },
          tournament_id: { type: 'string', format: 'uuid' },
          group_id: { type: 'string', format: 'uuid' },
        },
      },
      Group: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          display_name: { type: 'string' },
          standings: { type: 'array', items: { $ref: '#/components/schemas/Standing' } },
        },
      },
      Standing: {
        type: 'object',
        properties: {
          position: { type: 'integer' },
          country: { $ref: '#/components/schemas/Country' },
          matches_played: { type: 'integer' },
          wins: { type: 'integer' },
          draws: { type: 'integer' },
          losses: { type: 'integer' },
          votes_for: { type: 'integer' },
          votes_against: { type: 'integer' },
          vote_difference: { type: 'integer' },
          points: { type: 'integer' },
          qualified: { type: 'boolean' },
        },
      },
      CountryStats: {
        type: 'object',
        properties: {
          country_code: { type: 'string', description: 'Country code (e.g., US, BR)' },
          total_votes: { type: 'integer', description: 'Total votes received' },
          total_eth: { type: 'string', description: 'Total ETH backing this country' },
          qualified: { type: 'boolean', description: 'Whether country qualified' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CountryStatsDetailed: {
        type: 'object',
        properties: {
          country_code: { type: 'string' },
          total_votes: { type: 'integer' },
          total_eth: { type: 'string' },
          qualified: { type: 'boolean' },
          rank: { type: 'integer', description: '1-based ranking by votes' },
          top_voters: {
            type: 'array',
            description: 'Top 5 voters for this country',
            items: {
              type: 'object',
              properties: {
                voter_address: { type: 'string' },
                total_votes: { type: 'integer' },
              },
            },
          },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      QualificationVote: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          country_code: { type: 'string' },
          voter_address: { type: 'string' },
          vote_count: { type: 'integer', description: 'Number of votes purchased' },
          total_cost_eth: { type: 'string', description: 'ETH spent on these votes' },
          tx_hash: { type: 'string', description: 'Transaction hash' },
          block_number: { type: 'integer', description: 'Block number' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      LeaderboardEntry: {
        type: 'object',
        properties: {
          rank: { type: 'integer', description: '1-based rank' },
          wallet_address: { type: 'string' },
          qualification_votes: { type: 'integer' },
          qualification_spent_eth: { type: 'string' },
          qualification_won_eth: { type: 'string' },
          countries_voted_for: { type: 'integer' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      QualificationSummary: {
        type: 'object',
        properties: {
          total_votes: { type: 'integer', description: 'Total votes across all countries' },
          total_eth: { type: 'string', description: 'Total ETH spent' },
          total_countries: { type: 'integer', description: 'Number of countries with votes' },
          total_voters: { type: 'integer', description: 'Number of unique voters' },
          qualified_count: { type: 'integer', description: 'Number of qualified countries' },
          top_countries: {
            type: 'array',
            description: 'Top 5 countries by votes',
            items: { $ref: '#/components/schemas/CountryStats' },
          },
          recent_votes: {
            type: 'array',
            description: '5 most recent votes',
            items: { $ref: '#/components/schemas/QualificationVote' },
          },
          top_voters: {
            type: 'array',
            description: 'Top 5 voters',
            items: { $ref: '#/components/schemas/LeaderboardEntry' },
          },
        },
      },
    },
  },
}
