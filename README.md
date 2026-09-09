# WeCode — AI-Powered College Coding Platform

> Production-minded, secure, and scalable coding platform engineered for college programming education and competitive solving.

---

## Overview

**WeCode** provides a modern, deterministic, and educational coding environment designed specifically for universities. Students can browse curated algorithmic problems, write and execute code in an integrated browser editor, receive deterministic judge verdicts, track their mastery progress, and access Socratic AI tutoring guidance.

Phase 1 establishes the production architecture, database schema, decoupled worker queue, C++ execution sandbox, and REST API foundation.

---

## Technology Stack

| Layer                 | Technology                                        | Rationale                                                              |
| :-------------------- | :------------------------------------------------ | :--------------------------------------------------------------------- |
| **Frontend**          | React 18, TypeScript, Tailwind CSS, Monaco Editor | High-performance, responsive code workspace with native IDE features   |
| **Backend API**       | Node.js, Express, TypeScript, Zod                 | Modular monolith with strict typing, fast validation, and low overhead |
| **Database**          | PostgreSQL 16, Prisma ORM                         | ACID transactional integrity, relational consistency, migrations       |
| **Queue & Cache**     | Redis 7, BullMQ                                   | Asynchronous submission scheduling, worker decoupling, rate limiting   |
| **Execution Sandbox** | Docker, Linux cgroups                             | Isolated, non-networked (`--network none`) C++ execution sandbox       |
| **AI Integration**    | Modular service boundary                          | Socratic pedagogical mentoring (strictly separated from judging)       |

---

## Monorepo Structure

```
WeCode/
├── package.json              # Monorepo workspaces configuration
├── tsconfig.base.json        # Base TypeScript compiler options
├── docker-compose.yml        # PostgreSQL, Redis, Backend, and Runner services
├── .env.example              # Documented environment configuration template
├── shared/                   # Shared TypeScript contracts, enums, & Zod schemas
│   ├── src/enums/            # Role, Difficulty, Language, SubmissionStatus, Verdict
│   ├── src/types/            # DTOs, API envelopes, and runner task contracts
│   └── src/validators/       # Zod schemas for runtime request validation
├── backend/                  # Modular Monolith Express REST API
│   ├── prisma/schema.prisma  # PostgreSQL relational models & migrations
│   └── src/
│       ├── config/           # Validated env, Prisma client, Redis connection, Pino logger
│       ├── middleware/       # Auth (JWT), RBAC, validation, rate limiting, error handler
│       ├── modules/          # Auth, Problems, Submissions, Run, Users, AI
│       └── queue/            # BullMQ submission & run producers
├── runner/                   # Isolated Code Execution Worker
│   ├── docker/cpp/           # Minimalist, secure C++ container environment
│   └── src/
│       ├── sandbox/          # DockerSandboxDriver (--network none, cgroups) & Process fallback
│       ├── judge/            # Deterministic output comparator & evaluator
│       └── queue/            # BullMQ worker consumers writing to PostgreSQL
├── frontend/                 # React SPA
│   └── src/
│       ├── components/       # ProblemList, ProblemWorkspace, SubmissionHistory, AuthModal
│       └── services/api.ts   # Typed API client
└── docs/                     # Comprehensive Architecture & Technical Specifications
    ├── requirements.md       # Requirements matrix categorized by MVP, Phase 2, Future
    ├── architecture.md       # Modular monolith topology & data flows A-F
    ├── database-schema.md    # PostgreSQL tables, relations, indexes, and constraints
    ├── api-spec.md           # REST API endpoints, request/response formats, error envelopes
    ├── security-threat-model.md # Hostile input threat model & sandbox isolation
    ├── development-setup.md  # Step-by-step local development setup
    └── phase-2-plan.md       # Concrete Phase 2 roadmap (AI, Contests, Classrooms)
```

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

### 3. Launch Services via Docker Compose

```bash
docker compose up -d postgres redis
```

### 4. Run Migrations & Start Development Servers

```bash
# Generate Prisma Client & Run Migrations
npm run prisma:generate --workspace=@wecode/backend
npm run prisma:migrate --workspace=@wecode/backend

# Build C++ Runner Image
docker build -t wecode-cpp-runner:latest runner/docker/cpp/

# Start Servers
npm run dev:backend    # Express API on http://localhost:4000
npm run dev:runner     # Worker processing submission queues
npm run dev:frontend   # Vite frontend on http://localhost:5173
```

---

## Running Tests

Run the complete Vitest test suite across all workspaces:

```bash
npm run test
```

---

## Security & Sandboxing Highlights

- **Zero Trust Execution**: All student code is treated as potentially hostile.
- **Docker Hardening**: Ephemeral containers run with `--network none`, `--memory 256m`, `--cpus 1.0`, `--pids-limit 64`, `--read-only`, and unprivileged UID (`nobody` / 10001).
- **Hidden Test Protection**: Hidden test case inputs and expected outputs are never exposed through public or student submission endpoints.
- **AI Separation**: The AI service provides pedagogical Socratic guidance and code reviews; it is never the source of truth for judging correctness.

---

## Documentation Index

- [Requirements Specification](docs/requirements.md)
- [System Architecture & Data Flows](docs/architecture.md)
- [Database Schema & Constraints](docs/database-schema.md)
- [REST API Specification](docs/api-spec.md)
- [Security Threat Model & Sandbox](docs/security-threat-model.md)
- [Development Setup Guide](docs/development-setup.md)
- [Phase 2 Roadmap](docs/phase-2-plan.md)
