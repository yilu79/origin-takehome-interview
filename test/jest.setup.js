// jest.setup.js
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return ''
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock fetch globally with proper jest functions
const mockFetch = jest.fn()
global.fetch = mockFetch

// Setup fetch mock helper
global.mockFetch = (data, ok = true, status = 200) => {
  mockFetch.mockResolvedValueOnce({
    ok,
    status,
    json: async () => data,
  })
}

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})

// Mock console.error to avoid noisy test output
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Mock Next.js Web API globals for API route testing
if (typeof global.Request === 'undefined') {
  global.Request = class MockRequest {
    constructor(input, init) {
      this.url = typeof input === 'string' ? input : input.url;
      this._json = init?.body ? JSON.parse(init.body) : {};
    }
    async json() {
      return this._json;
    }
  }
}

if (typeof global.Response === 'undefined') {
  global.Response = class MockResponse {
    constructor(body, init) {
      this.body = body;
      this.init = init;
      this.status = init?.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
    }
    static json(body, init) {
      return new MockResponse(JSON.stringify(body), {
        ...init,
        headers: { 'Content-Type': 'application/json', ...init?.headers }
      });
    }
  }
}