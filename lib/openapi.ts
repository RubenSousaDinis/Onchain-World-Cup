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
    },
  },
}
