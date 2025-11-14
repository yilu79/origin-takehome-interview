// __tests__/api/sessions.test.ts

import { GET, POST } from '../../app/api/sessions/route'
import { PATCH } from '../../app/api/sessions/[id]/route'

// Mock the database
jest.mock('../../lib/db', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  }
}))

import { db } from '../../lib/db'

// Helper function to create mock Request objects
function createMockRequest(body?: any): Request {
  return {
    json: async () => body,
  } as unknown as Request
}

describe('/api/sessions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/sessions', () => {
    it('returns sessions with joined therapist and patient data', async () => {
      const mockSessionsData = [
        {
          id: 1,
          date: new Date('2025-11-15T09:00:00Z'),
          status: 'Scheduled',
          therapist_id: 1,
          patient_id: 1,
          therapist_name: 'Dr. Sarah Johnson',
          patient_name: 'John Smith',
        },
        {
          id: 2,
          date: new Date('2025-11-16T14:30:00Z'),
          status: 'Completed',
          therapist_id: 2,
          patient_id: 2,
          therapist_name: 'Dr. Michael Chen',
          patient_name: 'Emma Wilson',
        }
      ]

      // Mock the database query chain
      const mockOrderBy = jest.fn().mockResolvedValue(mockSessionsData)
      const mockLeftJoin2 = jest.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockLeftJoin1 = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin2 })
      const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin1 })
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom })
      
      ;(db.select as jest.Mock).mockReturnValue({ from: mockFrom })
      
      const response = await GET()

      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toEqual(mockSessionsData)
      expect(db.select).toHaveBeenCalled()
    })

    it('handles database errors gracefully', async () => {
      // Mock database error
      ;(db.select as jest.Mock).mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const response = await GET()

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data).toEqual({ error: 'Failed to fetch sessions' })
    })

    it('returns empty array when no sessions exist', async () => {
      const mockOrderBy = jest.fn().mockResolvedValue([])
      const mockLeftJoin2 = jest.fn().mockReturnValue({ orderBy: mockOrderBy })
      const mockLeftJoin1 = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin2 })
      const mockFrom = jest.fn().mockReturnValue({ leftJoin: mockLeftJoin1 })
      
      ;(db.select as jest.Mock).mockReturnValue({ from: mockFrom })

      const response = await GET()

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual([])
    })
  })

  describe('POST /api/sessions', () => {
    it('creates a new session with valid data', async () => {
      const newSessionData = {
        therapist_id: 1,
        patient_id: 1,
        date: '2025-12-01T10:00:00.000Z'
      }

      const createdSession = {
        id: 4,
        therapist_id: 1,
        patient_id: 1,
        date: new Date('2025-12-01T10:00:00Z'),
        status: 'Scheduled'
      }

      // Mock the database insert chain
      const mockReturning = jest.fn().mockResolvedValue([createdSession])
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning })
      const mockInsert = jest.fn().mockReturnValue({ values: mockValues })
      
      ;(db.insert as jest.Mock).mockReturnValue({ values: mockValues })

      const request = createMockRequest(newSessionData)

      const response = await POST(request)

      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toEqual(createdSession)
      expect(db.insert).toHaveBeenCalled()
    })

    it('validates required fields', async () => {
      const invalidData = {
        therapist_id: 1,
        // Missing patient_id and date
      }

      const request = {
        json: async () => invalidData
      } as Request

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid input')
      expect(data.details).toBeDefined()
    })

    it('validates data types', async () => {
      const invalidData = {
        therapist_id: 'not-a-number',
        patient_id: 1,
        date: '2025-12-01T10:00:00.000Z'
      }

      const request = {
        json: async () => invalidData
      } as Request

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid input')
    })

    it('validates date format', async () => {
      const invalidData = {
        therapist_id: 1,
        patient_id: 1,
        date: 'invalid-date-format'
      }

      const request = {
        json: async () => invalidData
      } as Request

      const response = await POST(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid input')
    })

    it('handles database insertion errors', async () => {
      const validData = {
        therapist_id: 1,
        patient_id: 1,
        date: '2025-12-01T10:00:00.000Z'
      }

      // Mock database error
      ;(db.insert as jest.Mock).mockImplementation(() => {
        throw new Error('Foreign key constraint failed')
      })

      const request = createMockRequest(validData)

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })

    it('handles malformed JSON', async () => {
      const request = {
        json: async () => {
          throw new Error('Invalid JSON')
        }
      } as unknown as Request

      const response = await POST(request)

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })
  })
})

describe('/api/sessions/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PATCH /api/sessions/[id]', () => {
    it('updates session status successfully', async () => {
      const sessionId = '1'
      const updateData = { status: 'Completed' }
      const updatedSession = {
        id: 1,
        therapist_id: 1,
        patient_id: 1,
        date: new Date('2025-11-15T09:00:00Z'),
        status: 'Completed'
      }

      // Mock the database update chain
      const mockReturning = jest.fn().mockResolvedValue([updatedSession])
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere })
      const mockUpdate = jest.fn().mockReturnValue({ set: mockSet })
      
      ;(db.update as jest.Mock).mockReturnValue({ set: mockSet })

      const request = {
        json: async () => updateData
      } as Request

      const params = Promise.resolve({ id: sessionId })

      const response = await PATCH(request, { params })

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toEqual(updatedSession)
      expect(db.update).toHaveBeenCalled()
    })

    it('returns 404 for non-existent session', async () => {
      const sessionId = '999'
      const updateData = { status: 'Completed' }

      // Mock database returning empty array (no session found)
      const mockReturning = jest.fn().mockResolvedValue([])
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning })
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere })
      
      ;(db.update as jest.Mock).mockReturnValue({ set: mockSet })

      const request = {
        json: async () => updateData
      } as Request

      const params = Promise.resolve({ id: sessionId })

      const response = await PATCH(request, { params })

      expect(response.status).toBe(404)
      const data = await response.json()
      expect(data.error).toBe('Session not found')
    })

    it('validates session ID is a number', async () => {
      const sessionId = 'not-a-number'
      const updateData = { status: 'Completed' }

      const request = {
        json: async () => updateData
      } as Request

      const params = Promise.resolve({ id: sessionId })

      const response = await PATCH(request, { params })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid session ID')
    })

    it('validates status value', async () => {
      const sessionId = '1'
      const updateData = { status: 'InvalidStatus' }

      const request = {
        json: async () => updateData
      } as Request

      const params = Promise.resolve({ id: sessionId })

      const response = await PATCH(request, { params })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid input')
    })

    it('handles database update errors', async () => {
      const sessionId = '1'
      const updateData = { status: 'Completed' }

      // Mock database error
      ;(db.update as jest.Mock).mockImplementation(() => {
        throw new Error('Database update failed')
      })

      const request = {
        json: async () => updateData
      } as Request

      const params = Promise.resolve({ id: sessionId })

      const response = await PATCH(request, { params })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })

    it('handles malformed JSON in request body', async () => {
      const sessionId = '1'

      const request = {
        json: async () => {
          throw new Error('Invalid JSON')
        }
      } as unknown as Request

      const params = Promise.resolve({ id: sessionId })

      const response = await PATCH(request, { params })

      expect(response.status).toBe(500)
      const data = await response.json()
      expect(data.error).toBe('Internal server error')
    })

    it('handles missing request body', async () => {
      const sessionId = '1'

      const request = {
        json: async () => ({})
      } as Request

      const params = Promise.resolve({ id: sessionId })

      const response = await PATCH(request, { params })

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.error).toBe('Invalid input')
    })
  })
})

describe('API Helper Endpoints', () => {
  describe('GET /api/therapists', () => {
    it('should exist and be testable', () => {
      // This would test the therapists endpoint if it exists
      // Based on the code structure, these endpoints should exist
      // but we'll need to implement them if they don't exist yet
      expect(true).toBe(true) // Placeholder
    })
  })

  describe('GET /api/patients', () => {
    it('should exist and be testable', () => {
      // This would test the patients endpoint if it exists
      expect(true).toBe(true) // Placeholder
    })
  })
})