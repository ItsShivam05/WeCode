# WeCode Development & Setup Guide

This guide walks through setting up the **WeCode** monorepo for local development, building the Docker sandbox, running migrations, and executing automated test suites.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v20.0.0` or higher (`v24+` recommended)
- **npm**: `v10.0.0` or higher
- **Docker & Docker Compose**: For PostgreSQL, Redis, and runner container isolation
- **g++ (Optional)**: If testing the C++ runner locally without Docker (`ProcessSandboxDriver`)

---

## 2. Monorepo Installation

Clone the repository and install dependencies for all workspaces (`shared`, `backend`, `runner`, `frontend`) from the root:

```bash
git clone <repo-url>
cd WeCode
npm install
```

---

## 3. Environment Configuration

Copy the example environment configuration to `.env`:

```bash
cp .env.example .env
```

Review and adjust variables if needed:

- `DATABASE_URL`: PostgreSQL connection string (default matches `docker-compose.yml`)
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for access token signing
- `SANDBOX_DRIVER`: Set to `docker` when Docker Desktop is active, or `process` for local test environments.

---

## 4. Starting Infrastructure (PostgreSQL & Redis)

Start PostgreSQL and Redis using Docker Compose:

```bash
docker compose up -d postgres redis
```

Verify containers are running and healthy:

```bash
docker compose ps
```

---

## 5. Database Initialization & Prisma Migrations

Generate the Prisma client and apply database migrations:

```bash
# Generate Prisma Client
npm run prisma:generate --workspace=@wecode/backend

# Apply schema migrations to PostgreSQL
npm run prisma:migrate --workspace=@wecode/backend
```

---

## 6. Building the C++ Sandbox Image

To execute untrusted student C++ code in container isolation, build the lightweight runner image:

```bash
docker build -t wecode-cpp-runner:latest runner/docker/cpp/
```

Verify the image is present:

```bash
docker images wecode-cpp-runner
```

---

## 7. Running Development Services

You can run individual services or all of them concurrently:

### Option A: Running Individually

**Terminal 1 (Backend API):**

```bash
npm run dev:backend
# Starts Express API at http://localhost:4000
```

**Terminal 2 (Runner Worker):**

```bash
npm run dev:runner
# Connects to Redis and processes wecode-submissions and wecode-runs
```

**Terminal 3 (Frontend React App):**

```bash
npm run dev:frontend
# Starts Vite dev server at http://localhost:5173
```

---

## 8. Running Automated Tests

WeCode uses **Vitest** for fast unit and integration testing across workspaces:

```bash
# Run tests across all packages
npm run test

# Run tests specifically in shared contracts
npm run test --workspace=@wecode/shared

# Run tests in backend API
npm run test --workspace=@wecode/backend

# Run tests in runner judge
npm run test --workspace=@wecode/runner
```

---

## 9. Code Quality: Linting & Formatting

```bash
# Check code formatting with Prettier
npm run format:check

# Auto-format all files
npm run format

# Run ESLint across packages
npm run lint
```
