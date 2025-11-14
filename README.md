# Origin Therapy - Session Management Dashboard

A full-stack therapy session management system prototype built with Next.js, TypeScript, and PostgreSQL.

[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791)](https://neon.tech/)

## Features

- 📅 Create, view, and update therapy sessions
- 🔍 Search, filter, and sort sessions
- 📄 Pagination with configurable page sizes
- ⚡ Optimistic UI updates
- 📱 Fully responsive design
- ✅ 58+ passing tests
- 🎯 100% TypeScript (strict mode, no `any`)

## Tech Stack

**Frontend:** Next.js 16 (App Router), TypeScript, TailwindCSS, React Hooks  
**Backend:** Next.js API Routes, PostgreSQL (Neon), Drizzle ORM, Zod  
**Testing:** Jest, React Testing Library

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone
git clone https://github.com/yilu79/origin-takehome-interview.git
cd origin-takehome-interview

# Setup environment
cp .env.example .env.local
# Edit .env.local and add your DATABASE_URL shared by Ni Xu or your interviewer

# install the dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Environment Variables

Validate the environment variables in `.env.local` containing the Neon database connection:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require"
```

## Testing

### Automated Testing

Run the full test suite with Jest and React Testing Library:

```bash
npm test            # Run all 58+ tests
```

## API Endpoints

**Base URL:** `http://localhost:3001/api`

### Sessions

- **GET /api/sessions** - List all sessions
- **POST /api/sessions** - Create session
  ```json
  { "therapist_id": 1, "patient_id": 2, "date": "2025-11-15T10:00:00Z" }
  ```
- **PATCH /api/sessions/[id]** - Update status
  ```json
  { "status": "Completed" }
  ```

### Users

- **GET /api/therapists** - List therapists
- **GET /api/patients** - List patients

### Error Codes

- **400** - Invalid input
- **404** - Not found
- **500** - Server error

### Postman Collection

**Collection File:** [`test/origin-therapy-session-management.postman_collection.json`](./test/origin-therapy-session-management.postman_collection.json)

**Included Requests:**

- Get all sessions
- Create a session
- Update session status
- Get therapists/patients
- Error handling examples (404, 400)

**Import to Postman:**

1. Open Postman
2. Click **Import** → **Choose Files**
3. Select `test/origin-therapy-session-management.postman_collection.json`
4. Run requests against `http://localhost:3001`

## Deploy to Vercel

### Setup

1. **Install Vercel CLI & Login**

   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Link Project**

   ```bash
   vercel
   ```

   Follow prompts to create new project.

3. **Add Environment Variable**

   Go to [Vercel Dashboard](https://vercel.com) → Your Project → Settings → Environment Variables

   Add:

   - **Name:** `DATABASE_URL`
   - **Value:** Your DATABASE_URL
   - **Environments:** Production, Preview, Development (select all)

4. **Deploy**
   ```bash
   vercel --prod
   ```

Your app will be live at `https://your-project.vercel.app`

Please check out [Therapy Session Dashboard](https://origin-therapist-session-dashboard-7vjn1zmyn-annie-lus-projects.vercel.app/) for reference.

### Troubleshooting

- **500 Error:** DATABASE_URL not set → Add it in Vercel dashboard
- **Build Error:** Run `npm run build` locally first to verify
- **DB Connection Error:** Test locally with `npm run db:test`

## Architecture Notes

### Key Decisions

- **Next.js App Router:** Server components for better performance
- **Drizzle ORM:** Type-safe, serverless-friendly
- **Client-Side Filtering:** Faster UX for moderate datasets (<1000 sessions)
- **CSS Modules + Tailwind:** Scoped styles + utility classes

### MVP Assumptions & Limitations

**Current State:**

- **Session States:** Only Scheduled/Completed (production needs: Cancelled, Rescheduled, No-Show)
- **Authentication:** None - assumes internal tool or demo environment
- **Data Volume:** Optimized for <1000 sessions with client-side filtering
- **Booking Conflicts:** No double-booking prevention or therapist availability checking
- **Concurrency:** Basic optimistic updates without conflict resolution
- **Data Retention:** No archiving strategy - all sessions kept indefinitely

### Production Readiness Roadmap

#### 1. Authentication & Authorization

**Implementation Strategy:**

```typescript
// Recommended: NextAuth.js with JWT + Database sessions
// - Role-Based Access Control (RBAC): Admin, Therapist, Patient, Receptionist
// - Row-Level Security (RLS) in PostgreSQL for data isolation
// - Session management with secure HTTP-only cookies
// - OAuth2 integration (Google, Microsoft) for SSO
```

**Security Enhancements:**

- Multi-factor authentication (MFA) for admin/therapist roles
- API rate limiting per user (e.g., 100 requests/minute)
- CSRF protection with token rotation
- Audit logging for sensitive operations (session creation, status changes)

#### 2. Smart Booking & Conflict Prevention

**Therapist Availability Engine:**

```typescript
// - Working hours configuration (9 AM - 5 PM, customizable per therapist)
// - Vacation/time-off calendar integration
// - Concurrent booking prevention with database locks
// - Buffer time between sessions (e.g., 15-minute breaks)
// - Timezone-aware scheduling (store UTC, display local)
```

**Booking Intelligence:**

- Double-booking prevention with optimistic locking (`version` column)
- Patient preference tracking (preferred therapist, time slots)
- Automatic rescheduling suggestions based on availability
- Waitlist management for fully booked slots

#### 3. Performance & Scalability

**Database Optimizations:**

```sql
-- Connection Pooling Strategy (Neon/Supabase)
-- - Pool size: 10-20 connections for typical load
-- - Idle timeout: 30 seconds
-- - Max lifetime: 30 minutes to handle connection rotation

-- Indexes for Performance
CREATE INDEX CONCURRENTLY idx_sessions_date_status ON sessions(date, status);
CREATE INDEX CONCURRENTLY idx_sessions_therapist_date ON sessions(therapist_id, date);
CREATE INDEX CONCURRENTLY idx_sessions_patient_id ON sessions(patient_id);

-- Materialized Views for Analytics
CREATE MATERIALIZED VIEW session_stats AS
  SELECT therapist_id, COUNT(*) as total_sessions,
         AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_duration
  FROM sessions GROUP BY therapist_id;
```

**Caching Strategy:**

```typescript
// Multi-tier caching approach
// 1. Redis Cache (hot data, 5-15 min TTL)
//    - Active sessions list
//    - Therapist/patient details
//    - Availability calendars
//
// 2. CDN Edge Caching (static assets)
//    - Next.js static pages with ISR (revalidate: 60s)
//    - Stale-while-revalidate for session lists
//
// 3. Browser Cache (SWR pattern)
//    - useSWR with 30s revalidation
//    - Optimistic updates with automatic rollback
```

**API Resilience:**

```typescript
// Retry Logic with Exponential Backoff
const retryConfig = {
  maxRetries: 3,
  initialDelay: 100, // ms
  maxDelay: 2000,
  backoffMultiplier: 2,
  retryableErrors: [408, 429, 500, 502, 503, 504],
};

// Circuit Breaker Pattern
// - Open circuit after 5 consecutive failures
// - Half-open after 30s to test recovery
// - Close circuit after 2 successful requests

// Database Connection Resilience
// - Automatic reconnection with exponential backoff
// - Health check endpoint: GET /api/health
// - Graceful degradation (show cached data if DB unavailable)
```

#### 4. Data Management & Archiving

**Archiving Strategy:**

```typescript
// Cold Storage Policy (cost optimization + performance)
// - Archive sessions older than 2 years to S3/Glacier
// - Keep metadata in hot database for quick lookups
// - Automated nightly job (cron: 0 2 * * *)

// Implementation:
// 1. Partition sessions table by year (PostgreSQL partitioning)
// 2. Export old partitions to Parquet/JSON in S3
// 3. Drop old partitions, keep reference table
// 4. On-demand restore for compliance/audit (rare access)

// Soft Delete Pattern
ALTER TABLE sessions ADD COLUMN deleted_at TIMESTAMP;
CREATE INDEX idx_sessions_active ON sessions(id) WHERE deleted_at IS NULL;
// - Retain deleted records for 90 days before permanent deletion
// - GDPR compliance: permanent delete on user request
```

**Backup & Disaster Recovery:**

- Continuous backup with Point-in-Time Recovery (PITR) - 30 day retention
- Cross-region replication for high availability (99.99% uptime)
- Weekly full database backups to separate storage
- Automated backup testing (monthly restore drills)
- RTO: 15 minutes, RPO: 5 minutes

#### 5. Monitoring & Observability

**System Health Monitoring:**

```typescript
// Metrics to Track (Datadog/New Relic/Prometheus)
// - API latency (p50, p95, p99)
// - Error rate (5xx responses)
// - Database query performance (slow query log)
// - Connection pool utilization
// - Memory/CPU usage
// - Cache hit ratio (target: >80%)

// Alerting Thresholds
// - ERROR: API error rate >1% for 5 minutes
// - WARNING: Response time p95 >500ms for 10 minutes
// - CRITICAL: Database connection failures >3 in 1 minute
```

**Logging Strategy:**

- Structured JSON logging (context, trace_id, user_id)
- Centralized log aggregation (CloudWatch/ELK/Datadog)
- Log levels: DEBUG (dev), INFO (prod), ERROR (always)
- PII redaction in logs (patient names, emails)

#### 6. Security Hardening

**Application Security:**

- SQL injection prevention (Drizzle ORM parameterized queries ✓)
- XSS protection (React auto-escaping ✓, CSP headers)
- CORS configuration (whitelist allowed origins)
- Secrets management (AWS Secrets Manager, not env vars in prod)
- Dependency scanning (Snyk, npm audit) in CI/CD

**Compliance & Privacy:**

- HIPAA compliance requirements (if handling PHI)
  - Encrypted at rest (AES-256) and in transit (TLS 1.3)
  - Access logs for audit trails
  - Business Associate Agreement (BAA) with vendors
- GDPR compliance (data portability, right to deletion)
- Regular security audits and penetration testing

#### 7. High Availability Architecture

**Infrastructure Design:**

```
┌─────────────┐         ┌──────────────┐
│   Vercel    │────────▶│  PostgreSQL  │
│  (Multi-AZ) │         │  (Neon HA)   │
│   + CDN     │         │  Read Replicas│
└─────────────┘         └──────────────┘
      │                        │
      ▼                        ▼
┌─────────────┐         ┌──────────────┐
│    Redis    │         │   S3 Backup  │
│   (Cache)   │         │  (Archives)  │
└─────────────┘         └──────────────┘
```

**Deployment Strategy:**

- Blue-green deployments (zero-downtime)
- Feature flags for gradual rollout (LaunchDarkly)
- Automated rollback on error threshold breach
- Database migrations with backward compatibility
- Canary releases (5% traffic → full rollout)

**Current MVP Implementation:**

- ✅ React optimization: `useMemo`/`useCallback` for rendering
- ✅ Database: Indexed queries with JOINs
- ✅ Build: Turbopack, SWC minification, code splitting
- ✅ Type safety: 100% TypeScript strict mode
- ✅ Testing: 58+ tests with comprehensive coverage

## License

MIT License - see [LICENSE](./LICENSE)

## Contact

**Annie Lu** - [GitHub](https://github.com/yilu79)

---

Built with Next.js 16, TypeScript, Drizzle ORM, and Neon PostgreSQL

```

```
