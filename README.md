# Digital Wallet Management Platform

> A production-grade full-stack application demonstrating enterprise-level financial transaction handling with modern web technologies.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://your-frontend.vercel.app)
[![API Docs](https://img.shields.io/badge/API-documented-blue)](https://your-backend.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

##  Project Narrative

### The Genesis

This project began as a technical assessment challenge: build a simple wallet service with basic CRUD operations. However, I saw it as an opportunity to demonstrate how I approach real-world financial systems—where data integrity, transaction atomicity, and user experience are non-negotiable.

The core question I asked myself: **"If this were to handle real money for real users tomorrow, what would I need to get right today?"**

That question shaped every architectural decision, from choosing database transactions over in-memory locks to implementing idempotency keys from day one.

### The Problem Space

Digital wallet systems sit at the intersection of several complex requirements:
- **Financial Integrity**: Balances must always be accurate. Period.
- **Concurrency**: Multiple operations on the same wallet must not corrupt data
- **Auditability**: Every transaction must be traceable for compliance and debugging
- **Idempotency**: Network failures shouldn't result in duplicate charges
- **User Experience**: Complex backend logic must translate to intuitive interactions

---

## Architecture & Design Philosophy

### The Backend: NestJS + Prisma + PostgreSQL

**Why NestJS?**

I chose NestJS over Express or Fastify for several reasons:
1. **Dependency Injection**: Makes testing and scaling easier through loose coupling
2. **TypeScript-First**: Type safety reduces runtime errors in financial logic
3. **Modular Architecture**: Each domain (wallets, transactions) lives in its own module
4. **Decorator-Based**: Clean separation of concerns (validation, routing, error handling)

```
src/
├── wallet/              # Business domain
│   ├── dto/            # Request/response contracts
│   ├── entities/       # Domain models
│   ├── wallet.service.ts      # Business logic
│   ├── wallet.controller.ts   # HTTP layer
│   └── wallet.repository.ts   # Data access
```

This structure means adding new features (like transaction categories or recurring transfers) doesn't require touching existing code—just extend it.

**Why Prisma?**

Prisma was chosen over TypeORM or raw SQL for:
- **Type-Safe Queries**: The database schema generates TypeScript types automatically
- **Migration Safety**: Schema changes are versioned and trackable
- **Connection Pooling**: Built-in optimization for serverless environments
- **Developer Experience**: Prisma Studio provides instant database visualization

**Why PostgreSQL?**

While the assessment allowed for in-memory storage, I immediately switched to PostgreSQL because:
1. **ACID Compliance**: Transfers need to be atomic meaning both wallets update or neither does
2. **Row-Level Locking**: Prevents race conditions without application-level locks
3. **Production Parity**: Development should mirror production as closely as possible
4. **Vercel Integration**: Seamless deployment with Vercel Postgres

---

##  Implementation Decisions

### 1. Database Transactions Over In-Memory Locks

**The Challenge**: When user A transfers $100 to user B, we must ensure A's balance decreases by exactly $100, B's balance increases by exactly $100,
No other operation can interfere mid-transfer and if anything fails, both operations rollback

**Initial Approach (Rejected)**: In-memory locking with Maps
```typescript
// This works for single-instance apps but fails at scale
const locks = new Map<string, Promise<void>>();
await acquireLock(walletId);
// ... do work
releaseLock(walletId);
```

**Problem**: In a distributed system (multiple servers), in-memory locks don't synchronize across instances. 
User A could transfer on Server 1 while Server 2 processes another transfer, corrupting the balance.

**Final Approach**: Database-level transactions
```typescript
await prisma.$transaction(async (tx) => {
  // These operations are atomic
  await tx.wallet.update({ where: { id: sourceId }, data: { balance: newSourceBalance }});
  await tx.wallet.update({ where: { id: destId }, data: { balance: newDestBalance }});
  await tx.transaction.create({ data: transferRecord });
});
```

**Why This Matters**: PostgreSQL's MVCC (Multi-Version Concurrency Control) handles locking at the database level. If two transfers hit the same wallet simultaneously, Postgres serializes them automatically. One waits for the other to complete, ensuring data integrity.

### 2. Idempotency Keys

**The Problem**: Network requests can fail and retry. Without idempotency, a user could accidentally fund their wallet twice or transfer the same amount multiple times.

**Implementation**:
```typescript
// Check if this operation already happened
const existingTx = await findTransactionByIdempotencyKey(idempotencyKey);
if (existingTx) {
  return existingTx; // Return cached result, don't process again
}

// Process new operation
const transaction = await createTransaction({ ..., idempotencyKey });
```

**Unique Constraint**: The database enforces uniqueness on idempotency keys, so even if two requests slip through application logic, the database rejects the duplicate.

**Real-World Impact**: Stripe, PayPal, and every major payment processor use this pattern. It's not optional for financial systems.

### 3. Transaction Audit Trail

Every operation creates immutable transaction records with:
- `balanceBefore` and `balanceAfter`: Enables point-in-time balance reconstruction
- `type`: FUND, TRANSFER_IN, TRANSFER_OUT for clear categorization
- `sourceWalletId` and `destinationWalletId`: Full transfer traceability
- `status`: SUCCESS/FAILED for retry logic (future feature)

**Why This Matters**: If a user disputes a charge or regulators audit the system, we can prove exactly what happened and when. These records are append-only—never updated or deleted.

### 4. Decimal Precision Handling

**The Problem**: JavaScript uses floating-point arithmetic:
```javascript
0.1 + 0.2 === 0.30000000000004 // true 
```

**Solution**: Round all monetary values to 2 decimal places:
```typescript
private roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
```

**Better Solution (For Production)**: Use a dedicated library like `decimal.js` or store values as integers (cents instead of dollars) to avoid floating-point errors entirely.

---

## Frontend: React + Tailwind CSS

### Design Philosophy: Progressive Disclosure

The UI reveals complexity gradually:
1. **Empty State**: Friendly prompt to create first wallet
2. **Single Wallet**: Focus on funding and basic actions
3. **Multiple Wallets**: Transfer functionality appears
4. **Transaction History**: Detailed audit trail available on demand

**Why This Matters**: Financial UIs often overwhelm users with options. Progressive disclosure reduces cognitive load while maintaining power-user functionality.

### Dark Mode Implementation

Not just a theme toggle—dark mode uses different color psychology:
- **Dark Mode**: Calmer, reduces eye strain for frequent users
- **Light Mode**: Higher contrast, better for accessibility and quick tasks

Both modes maintain WCAG AA contrast ratios for accessibility compliance.

### Real-Time Updates

After every operation, the UI:
1. Updates wallet balances immediately (optimistic updates)
2. Refetches transaction history to show the latest state
3. Displays toast notifications for user feedback

**Future Enhancement**: WebSocket connections for real-time balance updates when other users transfer to your wallet.

---

##  Scalability: From 100 to 1,000,000 Users

### Current Architecture (Assessment Version)

**What Works**:
- Single-region deployment
- Synchronous API calls
- Database transactions for consistency
- Serverless functions on Vercel

**Bottlenecks at Scale**:
- Database connection limits (~100 concurrent)
- No caching layer
- Synchronous transfers block API responses
- Single database instance

### Production Architecture (Millions of Users)

Here's what I would implement for a production system:

#### 1. **Event-Driven Architecture**

Replace synchronous transfers with event streams:

```
API Request → Queue (SQS/RabbitMQ) → Worker → Database → Notification
```

**Benefits**:
- API responds instantly (200 OK) without waiting for DB
- Workers can retry failed operations automatically
- Horizontal scaling: spin up more workers during peak load
- Fault isolation: failed transfers don't crash the API

#### 2. **Database Sharding**

Partition wallets across multiple databases:
- **Shard by User ID**: Modulo or consistent hashing
- **Read Replicas**: Route transaction history queries to replicas
- **Write Master**: All balance updates go to the primary database

**Trade-off**: Cross-shard transfers become more complex (two-phase commit required).

#### 3. **Redis Cache Layer**

Cache frequently accessed data:
```
GET /wallets/:id
├─ Check Redis (sub-millisecond)
├─ If miss, query Postgres
└─ Cache result for 30 seconds
```

**Invalidation Strategy**: 
- On balance update → invalidate cache
- On transfer → invalidate both wallets

**Why 30 seconds?**: Balance staleness of 30s is acceptable for non-critical views. Critical operations (transfers) always query fresh data.

#### 4. **Rate Limiting & DDoS Protection**

Implement tiered rate limits:
- **Anonymous**: 10 requests/minute
- **Authenticated**: 100 requests/minute
- **Premium Users**: 1000 requests/minute

Use Redis + Token Bucket algorithm:
```typescript
const key = `rate_limit:${userId}`;
const current = await redis.incr(key);
if (current > limit) throw new TooManyRequestsException();
await redis.expire(key, 60); // Reset every minute
```

#### 5. **Monitoring & Observability**

Deploy full observability stack:
- **Logs**: Structured JSON logs with correlation IDs (DataDog, Grafana Loki)
- **Metrics**: RED metrics (Rate, Errors, Duration) per endpoint (Prometheus)
- **Traces**: Distributed tracing for cross-service requests (Jaeger, Zipkin)
- **Alerts**: PagerDuty for critical failures (balance mismatch, DB connection loss)

**Key Metrics to Track**:
- Transaction success rate (should be >99.9%)
- P99 latency (should be <500ms)
- Database connection pool utilization
- Failed idempotency key retries

#### 6. **Security Hardening**

Add enterprise-grade security:
- **Authentication**: JWT tokens with refresh mechanism (Auth0, Clerk)
- **Authorization**: Role-based access control (RBAC)
- **Encryption**: Encrypt sensitive data at rest (AWS KMS)
- **Audit Logs**: Separate append-only log for all admin actions
- **Fraud Detection**: ML models to flag suspicious transfer patterns

#### 7. **Multi-Region Deployment**

Deploy across multiple AWS/GCP regions:
- **Active-Active**: Users routed to nearest region (latency optimization)
- **Database Replication**: PostgreSQL streaming replication with <100ms lag
- **Conflict Resolution**: Last-write-wins with vector clocks

**Edge Cases**: 
- What if the same user transfers from US and EU simultaneously?
- Solution: Sticky sessions route users to their "home" region

#### 8. **Disaster Recovery**

Implement comprehensive backup strategy:
- **Database Snapshots**: Hourly snapshots, retained for 30 days
- **Point-in-Time Recovery**: Can restore to any second in the last 7 days
- **Offsite Backups**: Replicate to separate cloud provider (multi-cloud strategy)
- **Chaos Engineering**: Randomly kill services in staging to test resilience

**Recovery Time Objective (RTO)**: 15 minutes  
**Recovery Point Objective (RPO)**: 5 minutes (max acceptable data loss)

---

## Testing 

### Unit Tests
Test business logic in isolation:
```typescript
describe('WalletService', () => {
  it('should prevent negative balances', async () => {
    await expect(
      service.transfer({ amount: 1000, sourceBalance: 100 })
    ).rejects.toThrow(InsufficientBalanceException);
  });
});
```

### Integration Tests
Test API endpoints end-to-end:
```typescript
it('should create wallet and fund in sequence', async () => {
  const wallet = await request(app).post('/wallets').send({ currency: 'USD' });
  const funded = await request(app).post(`/wallets/${wallet.id}/fund`).send({ amount: 100 });
  expect(funded.body.wallet.balance).toBe(100);
});
```

### Load Tests (For Production)
Simulate realistic traffic with k6 or Artillery:
```javascript
// 10,000 concurrent users creating wallets and transferring
export default function() {
  http.post('https://api.example.com/wallets', '{"currency":"USD"}');
  http.post('https://api.example.com/wallets/transfer', transferPayload);
}
```

**Target**: 10,000 requests/second with P99 latency <500ms.

---

## Key Metrics & SLAs

For a production system, I would commit to:

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% (8.76 hours downtime/year) | Pingdom, UptimeRobot |
| API Latency (P99) | <500ms | Prometheus, DataDog |
| Transaction Success Rate | >99.95% | Custom metric tracking |
| Data Accuracy | 100% (zero balance mismatches) | Automated reconciliation jobs |
| Time to Recovery | <15 minutes | Incident response playbooks |

---

##  CI/CD Pipeline

Automated deployment pipeline:

```
1. Push to GitHub
   ↓
2. GitHub Actions runs:
   - Linting (ESLint)
   - Type checking (TypeScript)
   - Unit tests (Jest)
   - Build (Webpack)
   ↓
3. Deploy to Staging (Vercel Preview)
   ↓
4. Run E2E tests (Playwright)
   ↓
5. Manual approval for production
   ↓
6. Deploy to Production (Vercel)
   ↓
7. Run smoke tests
   ↓
8. Monitor error rates (rollback if >1% errors)
```

**Zero-Downtime Deployments**: Blue-green deployment strategy ensures users never see downtime.

---

## 🎓 What I Learned

### Technical Insights
1. **Database transactions are non-negotiable for financial systems**—in-memory solutions don't scale
2. **Idempotency isn't optional**—it's the foundation of reliable distributed systems
3. **Type safety catches bugs before production**—TypeScript + Prisma prevented numerous runtime errors
4. **Observability must be built in, not bolted on**—logging and monitoring from day one

### Product Insights
1. **Empty states matter**—users need guidance when starting fresh
2. **Progressive disclosure reduces overwhelm**—show complexity gradually
3. **Feedback loops are critical**—every action needs confirmation (toasts, animations)
4. **Dark mode isn't just aesthetic**—it's an accessibility and usability feature

### Process Insights
1. **Start with the data model**—get entities and relationships right first
2. **Write tests for edge cases immediately**—don't defer to "later"
3. **Deploy early and often**—Vercel preview deployments caught issues before production
4. **Document decisions as you go**—future you will thank present you

---

## 🚧 Future Enhancements

If I had more time, I would add:

### Short-Term (1-2 weeks)
- [ ] Multi-currency support with real-time exchange rates (Fixer.io API)
- [ ] Transaction search and filtering (date range, type, amount)
- [ ] Export transaction history (CSV, PDF)
- [ ] Wallet nicknames and custom icons
- [ ] Email notifications for transfers

### Medium-Term (1-2 months)
- [ ] Recurring transfers (scheduled payments)
- [ ] Transaction categories and budgets
- [ ] Multi-user wallet sharing (joint accounts)
- [ ] API rate limiting and usage analytics
- [ ] Admin dashboard for support team

### Long-Term (3-6 months)
- [ ] Mobile app (React Native)
- [ ] Biometric authentication
- [ ] Integration with external payment providers (Stripe, PayPal)
- [ ] Fraud detection with ML models
- [ ] Compliance reporting (AML, KYC)

---

##  Tech Stack Summary

### Backend
- **Framework**: NestJS (TypeScript)
- **ORM**: Prisma
- **Database**: PostgreSQL (Vercel Postgres)
- **Validation**: class-validator, class-transformer
- **Testing**: Jest

### Frontend
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite

### DevOps
- **Hosting**: Vercel (Serverless)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Version Control**: Git, GitHub

---
