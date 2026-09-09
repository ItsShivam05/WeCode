# WeCode REST API Specification

Version: `1.0.0`  
Base Path: `/api/v1`

All responses follow a predictable JSON envelope structure.

---

## 1. Response Envelope Format

### Success Response Envelope (`2xx`)

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 105
  }
}
```

### Error Response Envelope (`4xx`, `5xx`)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request payload failed validation",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

---

## 2. Standard HTTP Status Codes

| Code                        | Meaning                       | Usage Scenario                                       |
| :-------------------------- | :---------------------------- | :--------------------------------------------------- |
| `200 OK`                    | Request succeeded             | Standard GET, PUT, or login responses                |
| `201 Created`               | Resource created              | Successful registration, problem creation            |
| `202 Accepted`              | Asynchronous processing       | Code submission enqueued for background worker       |
| `400 Bad Request`           | Validation failure            | Malformed JSON, missing parameters, bad email domain |
| `401 Unauthorized`          | Missing / invalid credentials | Expired JWT, wrong password, missing token           |
| `403 Forbidden`             | Insufficient permissions      | Student attempting to view another student's code    |
| `404 Not Found`             | Resource absent               | Problem slug or submission ID not found              |
| `409 Conflict`              | Duplicate unique resource     | Email address or problem slug already in use         |
| `429 Too Many Requests`     | Rate limit breached           | Exceeding submission or run burst frequency          |
| `500 Internal Server Error` | Unexpected error              | Database failure or unhandled exception              |
| `503 Service Unavailable`   | Service offline               | Redis queue down or runner worker offline            |

---

## 3. Endpoints

### 3.1 Authentication

#### `POST /auth/register`

Creates a new student or faculty account.

**Request Body:**

```json
{
  "email": "student@college.edu",
  "password": "StrongPassword123",
  "fullName": "Jane Doe",
  "role": "STUDENT"
}
```

**Response (`201 Created`):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
      "email": "student@college.edu",
      "fullName": "Jane Doe",
      "role": "STUDENT",
      "createdAt": "2026-09-09T23:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### `POST /auth/login`

Authenticates a user and sets an HTTP-only secure cookie.

**Request Body:**

```json
{
  "email": "student@college.edu",
  "password": "StrongPassword123"
}
```

**Response (`200 OK`):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-1234567890ab",
      "email": "student@college.edu",
      "fullName": "Jane Doe",
      "role": "STUDENT",
      "createdAt": "2026-09-09T23:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### `GET /auth/me`

Fetches authenticated user identity from the JWT session.

---

### 3.2 Problems

#### `GET /problems`

Lists published problems with optional difficulty and tag filtering.

**Query Parameters:**

- `difficulty` (optional): `EASY`, `MEDIUM`, `HARD`
- `tag` (optional): slug of algorithmic tag
- `search` (optional): search text in title or slug
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

**Response (`200 OK`):**

```json
{
  "success": true,
  "data": [
    {
      "id": "problem-uuid-1",
      "slug": "two-sum",
      "title": "Two Sum",
      "difficulty": "EASY",
      "tags": ["Arrays", "Hash Table"],
      "submissionCount": 150,
      "acceptedCount": 95,
      "isPublished": true,
      "createdAt": "2026-09-09T20:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 20
  }
}
```

#### `GET /problems/:slug`

Fetches problem description and **sample test cases only**. Hidden test cases are strictly filtered out.

**Response (`200 OK`):**

```json
{
  "success": true,
  "data": {
    "id": "problem-uuid-1",
    "slug": "two-sum",
    "title": "Two Sum",
    "descriptionMarkdown": "Given an array of integers `nums` and an integer `target`...",
    "difficulty": "EASY",
    "timeLimitMs": 2000,
    "memoryLimitMb": 256,
    "tags": ["Arrays", "Hash Table"],
    "sampleTestCases": [
      {
        "id": "tc-sample-1",
        "inputData": "4\n2 7 11 15\n9",
        "expectedOutput": "0 1",
        "isSample": true,
        "orderIndex": 0
      }
    ],
    "userSubmissionStatus": "ACCEPTED",
    "createdAt": "2026-09-09T20:00:00.000Z"
  }
}
```

#### `POST /problems` _(Admin Only)_

Creates a new problem.

---

### 3.3 Run Code (Interactive)

#### `POST /problems/:slug/run`

Executes code against sample or custom input without saving a submission.

**Request Body:**

```json
{
  "language": "CPP",
  "code": "#include <iostream>\nusing namespace std;\nint main() { int a, b; cin >> a >> b; cout << a + b << endl; return 0; }",
  "customInput": "10 20"
}
```

**Response (`200 OK`):**

```json
{
  "success": true,
  "data": {
    "verdict": "ACCEPTED",
    "executionTimeMs": 15,
    "memoryKb": 4096,
    "stdout": "30\n",
    "stderr": ""
  }
}
```

---

### 3.4 Submissions

#### `POST /problems/:slug/submit`

Enqueues a submission for asynchronous deterministic judging.

**Request Body:**

```json
{
  "language": "CPP",
  "code": "#include <iostream>..."
}
```

**Response (`202 Accepted`):**

```json
{
  "success": true,
  "data": {
    "submissionId": "sub-uuid-1234",
    "status": "PENDING",
    "verdict": "QUEUED"
  }
}
```

#### `GET /submissions/:id`

Retrieves submission status and test case results.

**Response (`200 OK`):**

```json
{
  "success": true,
  "data": {
    "id": "sub-uuid-1234",
    "userId": "user-uuid",
    "problemId": "problem-uuid-1",
    "problemTitle": "Two Sum",
    "problemSlug": "two-sum",
    "language": "CPP",
    "code": "#include <iostream>...",
    "status": "COMPLETED",
    "verdict": "ACCEPTED",
    "executionTimeMs": 35,
    "memoryKb": 8192,
    "results": [
      {
        "id": "res-1",
        "testCaseId": "tc-1",
        "orderIndex": 0,
        "isSample": true,
        "verdict": "ACCEPTED",
        "executionTimeMs": 12,
        "memoryKb": 4096,
        "inputData": "4\n2 7 11 15\n9",
        "expectedOutput": "0 1",
        "stdout": "0 1\n",
        "stderr": ""
      },
      {
        "id": "res-2",
        "testCaseId": "tc-hidden-1",
        "orderIndex": 1,
        "isSample": false,
        "verdict": "ACCEPTED",
        "executionTimeMs": 35,
        "memoryKb": 8192
      }
    ],
    "createdAt": "2026-09-09T23:10:00.000Z"
  }
}
```

_(Notice: For `isSample: false`, `inputData`, `expectedOutput`, `stdout`, and `stderr` are omitted to keep hidden tests completely confidential)._

---

### 3.5 AI Tutor (Phase 2 Boundary)

#### `POST /ai/hint`

Generates Socratic pedagogical guidance for a problem attempt.

**Request Body:**

```json
{
  "problemId": "problem-uuid-1",
  "code": "#include <iostream>...",
  "language": "CPP",
  "errorOutput": "Time Limit Exceeded on Test 4",
  "hintLevel": "ALGORITHMIC"
}
```

**Response (`200 OK`):**

```json
{
  "success": true,
  "data": {
    "hint": "Your nested loops result in O(N^2) complexity. Can you use a hash table (unordered_map) to look up complements in O(1) time?",
    "guidanceType": "ALGORITHMIC",
    "remainingDailyQuota": 9
  }
}
```
