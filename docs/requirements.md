# WeCode Requirements Specification

This document details the functional and non-functional requirements for the **WeCode** college coding platform. Each feature is explicitly classified into its target phase:

- **[MVP]**: Phase 1 Foundation & Core Coding Experience.
- **[Phase 2]**: Extended Community & Educational Features (AI Tutor, Contests, Leaderboards).
- **[Future]**: Advanced Institutional Ecosystem (Faculty Classrooms, Advanced Plagiarism Detection, Institutional Analytics).

---

## 1. User Roles & Personas

### 1.1 Student

- **[MVP]**: Browse published problems filtered by difficulty (Easy, Medium, Hard) and tags.
- **[MVP]**: Write solutions in browser code editor (C++ support in Phase 1).
- **[MVP]**: Test code against sample test cases and custom input ("Run Code").
- **[MVP]**: Submit code against hidden test cases for deterministic judging ("Submit Code").
- **[MVP]**: View personal submission history, verdicts, runtime, and memory metrics.
- **[MVP]**: View personal progress metrics (solved count, difficulty breakdown).
- **[Phase 2]**: Request Socratic AI hints on failed test cases or compilation errors.
- **[Phase 2]**: Participate in timed contests and view live leaderboards.
- **[Future]**: Enroll in faculty classrooms and submit homework assignments.

### 1.2 Admin

- **[MVP]**: Authenticate with administrative privileges.
- **[MVP]**: Create, update, publish, or unpublish problems with title, markdown description, limits, and tags.
- **[MVP]**: Add and manage sample and hidden test cases with custom point weights.
- **[MVP]**: View any student submission and full unmasked execution outputs for debugging.
- **[Phase 2]**: Create and schedule contests with problem sets and registration windows.
- **[Future]**: Manage college departments, faculty role assignments, and institutional quotas.

### 1.3 Faculty (Future Role)

- **[Future]**: Create and manage virtual classrooms / lab sections.
- **[Future]**: Assign custom problem sets with due dates and strict submission windows.
- **[Future]**: View class-wide student completion analytics, common bug patterns, and export grades.
- **[Future]**: Run automated moss-based plagiarism detection across student assignment submissions.

---

## 2. Authentication & Access Control

- **[MVP]**: Email and password registration with college domain enforcement (e.g. `@college.edu`).
- **[MVP]**: Secure password hashing using Argon2id / bcrypt with strong work factor (cost 12).
- **[MVP]**: Stateless JWT authentication with short-lived access tokens (15m) and secure refresh tokens.
- **[MVP]**: Role-Based Access Control (RBAC) middleware enforcing `STUDENT`, `ADMIN`, and `FACULTY` policies.
- **[Phase 2]**: Single Sign-On (SSO) integration with College LDAP / Google Workspace / SAML.
- **[Future]**: Multi-factor authentication (MFA) for administrative accounts.

---

## 3. Problems & Test Cases

- **[MVP]**: Problem metadata: title, unique URL-friendly slug, markdown problem description, difficulty (`EASY`, `MEDIUM`, `HARD`), time limit (ms), memory limit (MB), publication status.
- **[MVP]**: Tagging system with many-to-many relationship (`arrays`, `dynamic-programming`, `graphs`, etc.).
- **[MVP]**: Test cases categorized into **Sample** (`is_sample = true`) and **Hidden** (`is_sample = false`).
- **[MVP]**: Strict API isolation: hidden test cases are NEVER returned to public/student endpoints.
- **[Phase 2]**: Multi-language starter code templates and solution editorial writeups.
- **[Future]**: Subtask grading (IOI-style partial scores) and custom problem validators (Special Judge / Testlib).

---

## 4. Code Editor & Execution

- **[MVP]**: Browser-based Monaco code editor with syntax highlighting, indentation, and keyboard shortcuts.
- **[MVP]**: "Run Code" flow: executes solution against sample or custom input without persisting to database submissions.
- **[MVP]**: "Submit Code" flow: creates submission record, enqueues to worker queue, evaluates against hidden tests.
- **[MVP]**: Asynchronous execution via Redis/BullMQ: API is completely decoupled from execution runners.
- **[Phase 2]**: Support for Python 3.12 and Java 21 runners alongside C++17.
- **[Future]**: Collaborative pair-programming editor using WebSockets (OT/CRDTs).

---

## 5. Judge & Evaluation Engine

- **[MVP]**: Deterministic output comparator ignoring trailing whitespace on lines and trailing empty lines.
- **[MVP]**: Granular, structured verdicts:
  - `QUEUED`: Enqueued in worker backlog.
  - `COMPILING`: Actively compiling solution.
  - `RUNNING`: Executing test suite.
  - `ACCEPTED`: Passed all test cases.
  - `WRONG_ANSWER`: Output differed from expected output.
  - `TIME_LIMIT_EXCEEDED`: Exceeded allocated CPU/wall-clock limit.
  - `MEMORY_LIMIT_EXCEEDED`: Exceeded memory ceiling (OOM).
  - `COMPILATION_ERROR`: g++ compilation failure with compiler diagnostics.
  - `RUNTIME_ERROR`: Non-zero exit code (segfault, uncaught exception).
  - `SYSTEM_ERROR`: Infrastructure, queue, or container failure.
- **[MVP]**: Per-test-case results stored in `submission_results` with execution time and memory.
- **[Phase 2]**: Interactive problems support (reactive judging via stdin/stdout pipes).

---

## 6. Submissions & Progress

- **[MVP]**: Paginated submission history view filtered by user and problem.
- **[MVP]**: Detailed submission modal displaying verdict, runtime, memory, and code.
- **[MVP]**: Student progress dashboard: total solved count, total attempts, breakdown by difficulty tier.
- **[Phase 2]**: Visual submission heatmaps (GitHub-style activity calendar) and streak tracking.

---

## 7. Leaderboards & Contests

- **[Phase 2]**: College-wide global leaderboard ranked by accepted problem count and score.
- **[Phase 2]**: Timed contest module: contest start/end timestamps, live contest scoreboard with penalty time (ICPC scoring).
- **[Phase 2]**: Virtual contest participation (simulate past contests in real time).
- **[Future]**: Batch contest re-judging and frozen scoreboard reveal animation.

---

## 8. AI Tutor & Learning Guidance

- **[Phase 2]**: Dedicated AI microservice / modular integration boundary.
- **[Phase 2]**: Socratic hints on compilation errors and wrong answer verdicts.
- **[Phase 2]**: Code review guidance: identifies asymptotic inefficiencies ($O(N^2)$ vs $O(N \log N)$) and code smells.
- **[Phase 2]**: Strict pedagogical safety: AI is strictly barred from writing direct solution code or bypassing tests.
- **[Phase 2]**: AI rate limiting and token quota management per student per day.
- **[Future]**: Personalized learning roadmap recommending next problems based on student weakness tags.

---

## 9. Classrooms & Faculty Analytics

- **[Future]**: Faculty dashboard for cohort and section management.
- **[Future]**: Lab assignment distribution with deadline management and late penalty policies.
- **[Future]**: Class-wide analytics: error distribution charts, time-to-solve distributions, drop-off rates.
- **[Future]**: Plagiarism detector with AST tokenization and similarity heatmaps.

---

## 10. Platform Security & Sandboxing

- **[MVP]**: Ephemeral Docker sandboxes with `--network none`, `--memory 256m`, `--cpus 1.0`, `--pids-limit 64`, `--read-only`, and non-root execution (`nobody` / UID 10001).
- **[MVP]**: Process watchdog timer forcefully terminating stalled containers with `SIGKILL`.
- **[MVP]**: Stdout/Stderr output truncation capped at 64 KB to mitigate logging bombs.
- **[MVP]**: Rate limiting on API routes, authentication attempts, code runs, and submissions.
- **[MVP]**: Input sanitization and Zod runtime schema validation on every endpoint.
