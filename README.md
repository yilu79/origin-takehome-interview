# Origin Therapy - Session Management Dashboard

A modern, full-stack web application for managing therapy sessions between therapists and patients. Built with Next.js 16, TypeScript, and PostgreSQL.

[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)](https://neon.tech/)
[![License](https://img.shields.io/badge/license-MIT-green)](./docs/LICENSE)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Design Decisions](#-design-decisions)
- [Performance Optimizations](#-performance-optimizations)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality

- **📅 Session Management**: View, create, and update therapy sessions
- **👥 Real-time Dashboard**: Display sessions with therapist and patient details
- **✅ Status Updates**: Mark sessions as completed with optimistic UI updates
- **🔍 Advanced Filtering**: Multi-criteria search and filter system
- **📊 Sorting**: Sort by date, therapist, or patient name (ascending/descending)
- **📄 Pagination**: Configurable items per page (5, 10, 20, 50)
- **📱 Responsive Design**: Mobile-first approach with adaptive layouts

### User Experience

- **⚡ Optimistic Updates**: Instant UI feedback with error rollback
- **🎨 Modern UI**: Clean, professional interface with TailwindCSS
- **♿ Accessibility**: ARIA labels, keyboard navigation, focus states
- **🔄 Loading States**: Skeleton screens and loading indicators
- **❌ Error Handling**: Graceful error messages with retry functionality
- **✨ Visual Feedback**: Success messages, hover states, smooth transitions

### Technical Features

- **🎯 Type-Safe**: Strict TypeScript throughout (no `any` types)
- **⚡ Performance**: React hooks optimization (useMemo, useCallback)
- **🧪 Well-Tested**: Comprehensive test suite with 58+ tests
- **📦 Optimized Build**: Code splitting, tree shaking, SWC minification
- **🔒 Secure**: Environment variable management, API validation

## 🛠️ Tech Stack

### Frontend

- **Framework**: [Next.js 16.0.3](https://nextjs.org/) (App Router with Turbopack)
- **Language**: [TypeScript 5.0](https://www.typescriptlang.org/) (Strict mode)
- **Styling**: [TailwindCSS 3.4](https://tailwindcss.com/) + CSS Modules
- **UI Components**: Custom React components with SVG icons
- **State Management**: React hooks (useState, useEffect, useMemo, useCallback)

### Backend

- **API**: Next.js API Routes (REST)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Neon Serverless)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Validation**: [Zod](https://zod.dev/) schemas
- **Date Handling**: [date-fns](https://date-fns.org/)

### Development & Testing

- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/react)
- **Linting**: ESLint with Next.js config
- **Build Tool**: Turbopack (Next.js 16)
- **Package Manager**: npm

## 📁 Project Structure

```
origin-takehome-interview/
├── src/                           # Source code
│   ├── app/                       # Next.js App Router
│   │   ├── api/                   # API routes
│   │   │   ├── sessions/          # Session endpoints
│   │   │   ├── therapists/        # Therapist endpoints
│   │   │   └── patients/          # Patient endpoints
│   │   ├── layout.tsx             # Root layout
│   │   └── page.tsx               # Main dashboard
│   ├── components/                # React components
│   │   ├── SessionTable.tsx       # Session list display
│   │   ├── CreateSessionModal.tsx # Session creation form
│   │   ├── ErrorBoundary.tsx      # Error handling
│   │   └── Icons.tsx              # SVG icon components
│   ├── lib/                       # Utilities and database
│   │   ├── db.ts                  # Database connection
│   │   ├── schema.ts              # Drizzle schema
│   │   └── utils.ts               # Helper functions
│   ├── types/                     # TypeScript types
│   │   └── index.ts               # Type definitions
│   └── styles/                    # CSS modules
│       ├── components/            # Component styles
│       └── globals/               # Global styles
├── test/                          # Test suite
│   ├── app/                       # Page tests
│   ├── components/                # Component tests
│   └── utils/                     # Test utilities
├── config/                        # Configuration files
│   ├── jest.config.js             # Jest configuration
│   ├── next.config.js             # Next.js configuration
│   ├── tailwind.config.js         # Tailwind configuration
│   └── postcss.config.js          # PostCSS configuration
├── database/                      # Database files
│   └── db_schema_reference.sql    # Schema reference
├── docs/                          # Documentation
│   ├── DEPLOYMENT.md              # Deployment guide
│   ├── OPTIMIZATION_SUMMARY.md    # Performance docs
│   └── LICENSE                    # License file
└── scripts/                       # Build/utility scripts
```

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **PostgreSQL**: Neon account (or local PostgreSQL 14+)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yilu79/origin-takehome-interview.git
   cd origin-takehome-interview
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Environment Setup

1. **Create environment file**

   ```bash
   cp .env.example .env.local
   # or create manually
   ```

2. **Configure environment variables**

   Add your database connection string to `.env.local`:

   ```env
   DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
   ```

   **For Neon Database:**

   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string from your project dashboard
   - Paste it as the `DATABASE_URL` value

3. **Initialize the database**

   The database schema is automatically created. Reference schema:

   ```sql
   -- See database/db_schema_reference.sql for full schema

   -- Tables: therapists, patients, sessions
   -- Foreign keys: therapist_id, patient_id
   -- Indexes: date, status
   ```

### Running the Application

#### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Production Build

```bash
npm run build
npm start
```

### Development Commands

```bash
# Start development server (hot reload enabled)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:components
npm run test:app

# Lint code
npm run lint
```

### Production Commands

```bash
# Build for production
npm run build

# Build with explicit production environment
npm run build:prod

# Start production server locally (requires .env.local)
npm start

# Start with explicit production environment
npm run start:prod

# Test database connection
npm run db:test
```

### Deployment Commands

```bash
# Deploy to Vercel production
npm run vercel:deploy

# Deploy to Vercel preview
npm run vercel:preview
```

## 📡 API Documentation

### Base URL

```
http://localhost:3000/api
```

### Endpoints

#### **GET /api/sessions**

Retrieve all sessions with therapist and patient details.

**Response:**

```json
[
  {
    "id": 1,
    "therapist_id": 1,
    "patient_id": 2,
    "therapist_name": "Dr. Sarah Johnson",
    "patient_name": "John Doe",
    "date": "2025-11-15T10:00:00Z",
    "status": "Scheduled"
  }
]
```

#### **POST /api/sessions**

Create a new therapy session.

**Request Body:**

```json
{
  "therapist_id": 1,
  "patient_id": 2,
  "date": "2025-11-15T10:00:00Z"
}
```

**Response:** `201 Created`

```json
{
  "id": 1,
  "therapist_id": 1,
  "patient_id": 2,
  "date": "2025-11-15T10:00:00Z",
  "status": "Scheduled"
}
```

#### **PATCH /api/sessions/[id]**

Update a session's status.

**Request Body:**

```json
{
  "status": "Completed"
}
```

**Response:** `200 OK`

```json
{
  "id": 1,
  "status": "Completed",
  ...
}
```

#### **GET /api/therapists**

Get all therapists.

#### **GET /api/patients**

Get all patients.

### Error Responses

**400 Bad Request** - Invalid input

```json
{
  "error": "Invalid input",
  "details": [...]
}
```

**404 Not Found** - Resource not found

```json
{
  "error": "Session not found"
}
```

**500 Internal Server Error** - Server error

```json
{
  "error": "Internal server error"
}
```

## 🧪 Testing

### Test Coverage

- **58+ Tests** across components, pages, and utilities
- **Component Tests**: SessionTable, CreateSessionModal, ErrorBoundary
- **Integration Tests**: Dashboard functionality, API mocking
- **Unit Tests**: Utility functions, type definitions

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- SessionTable.test.tsx

# Run in watch mode
npm run test:watch

# Run CI tests
npm run test:ci
```

### Test Structure

```
test/
├── app/
│   └── page.test.tsx              # Dashboard tests
├── components/
│   ├── SessionTable.test.tsx      # Table component tests
│   └── CreateSessionModal.test.tsx # Modal tests
└── utils/
    └── test-utils.tsx             # Testing utilities
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Import to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Environment Variables**

   - Add `DATABASE_URL` in Vercel dashboard
   - Settings → Environment Variables

4. **Deploy**
   - Vercel automatically deploys on push
   - Production URL provided

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed deployment instructions.

## 🎯 Design Decisions

### Architecture Choices

#### **1. Next.js App Router**

- **Why**: Modern routing with server components support
- **Benefit**: Better performance, cleaner API routes
- **Trade-off**: Newer API, less community resources than Pages Router

#### **2. Drizzle ORM**

- **Why**: Lightweight, type-safe, serverless-friendly
- **Benefit**: Better TypeScript integration than Prisma
- **Trade-off**: Smaller ecosystem, manual schema management

#### **3. Client-Side Filtering vs. API Pagination**

- **Current**: Client-side filtering with frontend pagination
- **Why**: Faster user experience, no API roundtrips
- **Limitation**: Not suitable for very large datasets (>1000 sessions)
- **Future**: Implement API-side pagination for scalability

#### **4. Optimistic UI Updates**

- **Why**: Better perceived performance
- **Implementation**: Update UI immediately, revert on error
- **Benefit**: Feels instant to users, modern UX pattern

#### **5. CSS Modules + TailwindCSS**

- **Why**: Scoped styles + utility classes
- **Benefit**: No style conflicts, rapid development
- **Trade-off**: Slightly larger CSS bundle

### Assumptions

1. **Session Status**: Only two states (Scheduled/Completed)
   - Real-world might need: Cancelled, Rescheduled, No-Show
2. **User Authentication**: Not implemented
   - Assumed for demo/internal tool
   - Would add: NextAuth.js or Auth0
3. **Data Volume**: Moderate dataset (<1000 sessions)
   - Client-side filtering acceptable
   - API pagination needed for production scale
4. **Session Conflicts**: No validation
   - Would add: Double-booking prevention
   - Therapist availability checking

## ⚡ Performance Optimizations

### Frontend Optimizations

1. **React Performance**

   - `useMemo` for expensive filtering/sorting operations
   - `useCallback` for event handlers to prevent re-renders
   - Memoized components with stable references

2. **Build Optimizations**

   - Turbopack for faster builds (Next.js 16)
   - SWC minification
   - Automatic code splitting
   - Tree shaking for unused code elimination

3. **CSS Optimization**

   - CSS Modules for scoped styles
   - TailwindCSS with PurgeCSS
   - Shared utility classes

4. **Image & Asset Optimization**
   - SVG icons (inline, no requests)
   - WebP/AVIF format support
   - Lazy loading images

### Backend Optimizations

1. **Database Queries**

   - Single query with JOINs for session list
   - Indexed columns (date, status, foreign keys)
   - Connection pooling (Neon serverless)

2. **API Caching**

   - Response caching headers
   - Stale-while-revalidate strategy
   - Conditional requests support

3. **Error Handling**
   - Proper HTTP status codes
   - Zod validation for type safety
   - Graceful degradation

See [docs/OPTIMIZATION_SUMMARY.md](./docs/OPTIMIZATION_SUMMARY.md) for detailed performance metrics.

## 🔮 Future Enhancements

### High Priority

- [ ] **API-Side Pagination**: For datasets >1000 sessions
- [ ] **Real-time Updates**: WebSocket/Server-Sent Events for live updates
- [ ] **Session Conflict Detection**: Prevent double-booking
- [ ] **Advanced Filtering**: Date range, therapist specialty, patient demographics
- [ ] **Export Functionality**: CSV/PDF export of session data

### Medium Priority

- [ ] **User Authentication**: NextAuth.js integration
- [ ] **Role-Based Access**: Admin, Therapist, Patient roles
- [ ] **Session Notes**: Add/edit session notes and outcomes
- [ ] **Calendar View**: Visual calendar for session scheduling
- [ ] **Email Notifications**: Appointment reminders

### Low Priority

- [ ] **Analytics Dashboard**: Session statistics, trends
- [ ] **Therapist Availability**: Working hours, vacation management
- [ ] **Patient Portal**: Self-service booking
- [ ] **Mobile App**: React Native companion app
- [ ] **Internationalization**: Multi-language support

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure all tests pass
- Use conventional commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./docs/LICENSE) file for details.

## 📞 Contact

**Annie Lu** - [GitHub](https://github.com/yilu79)

**Project Link**: [https://github.com/yilu79/origin-takehome-interview](https://github.com/yilu79/origin-takehome-interview)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Vercel](https://vercel.com/) - Hosting platform
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS

---

**Built with ❤️ for Origin Therapy**
