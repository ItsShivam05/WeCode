# WeCode Security Model & Hostile Input Threat Analysis

## 1. Core Threat Philosophy: All Student Code is Hostile

In an academic coding environment, untrusted student code must be treated with zero trust. Students may intentionally or unintentionally submit:

- Fork bombs to crash the host server.
- Infinite loops to monopolize CPU cores.
- Memory leaks to trigger host system OOM (Out Of Memory) panics.
- Network scans or reverse shells to compromise internal college networks.
- File system commands to inspect competitor solutions or modify server files.
- Memory timing or side-channel exploits to leak hidden test cases.

---

## 2. Threat Vector Matrix & Defense-in-Depth Mitigations

| Threat Vector            | Attack Mechanism                                                                         | Implemented Defense & Sandbox Mitigation                                                                                                                                                                                            |
| :----------------------- | :--------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Fork Bombs**           | Recursively spawning child processes (`while(1) fork();`) to exhaust PID space.          | Docker `--pids-limit 64`. Kernel strictly denies process creation past 64 pids, preventing OS process table starvation.                                                                                                             |
| **CPU Starvation**       | Unbounded loops (`while(true);`) consuming 100% of host CPU cores.                       | Docker `--cpus 1.0 --cpu-shares 1024` hard quota + Host watchdog timer forcefully issuing `SIGKILL` if runtime exceeds limit + 500ms.                                                                                               |
| **Memory Exhaustion**    | Continuous heap allocation (`while(1) malloc(10MB);`) aiming to trigger host OOM killer. | Linux cgroups hard ceiling: `--memory 256m --memory-swap 256m`. Container is killed instantly with exit code 137, mapped to `MEMORY_LIMIT_EXCEEDED`.                                                                                |
| **Network Exfiltration** | Opening sockets to exfiltrate test cases, connect to C2 servers, or scan the intranet.   | Docker `--network none`. Container network namespace has no loopback or external interfaces. Socket syscalls fail immediately.                                                                                                      |
| **Filesystem Tampering** | Writing to `/etc`, deleting root files, or reading host configs.                         | Docker `--read-only` root filesystem. Only a small, in-memory `tmpfs` (/tmp: 16MB) is mounted with `noexec,nosuid`.                                                                                                                 |
| **Privilege Escalation** | Container breakout using Linux kernel vulnerabilities or setuid binaries.                | Docker `--security-opt=no-new-privileges:true`, `--cap-drop=ALL`, running as dedicated unprivileged user `sandbox` (UID 10001).                                                                                                     |
| **Output Flooding**      | Infinite printing (`while(1) cout << 'A';`) to fill host disk and crash logging daemons. | Worker streams truncate stdout and stderr buffers at 64 KB (`MAX_OUTPUT_SIZE_BYTES = 65536`). Remaining bytes are discarded.                                                                                                        |
| **Hidden Test Snooping** | Timing analysis, error code signaling, or API snooping to reveal test inputs.            | 1. Database layer: public queries only fetch `WHERE is_sample = true`.<br>2. API layer: `submission_results` omits input/expected output for hidden tests.<br>3. Ephemeral sandboxes: each test runs in a clean isolated execution. |

---

## 3. Sandboxing Implementation: Docker Execution Flags

When the runner worker executes compiled user code, it invokes the Docker engine with these mandatory parameters:

```bash
docker run \
  --rm \
  -i \
  --network none \
  --memory 256m \
  --memory-swap 256m \
  --cpus 1.0 \
  --pids-limit 64 \
  --read-only \
  --security-opt=no-new-privileges:true \
  --cap-drop=ALL \
  --user 10001:10001 \
  -v /tmp/wecode-run-xyz/solution:/sandbox/solution:ro \
  --tmpfs /tmp:rw,noexec,nosuid,size=16m \
  wecode-cpp-runner:latest \
  /sandbox/solution
```

---

## 4. API & Authentication Security

### 4.1 Rate Limiting Architecture

To prevent denial-of-service and brute-force attacks, multi-tier rate limiting is enforced via Redis:

1. **Global API Limiter**: Max 100 requests / minute per IP address.
2. **Submission Limiter**: Max 5 submissions / minute per authenticated student.
3. **Interactive Run Limiter**: Max 10 test runs / minute per authenticated student.
4. **AI Tutor Limiter**: Max 10 hints / hour per student to prevent LLM abuse and cost overruns.

### 4.2 College Email Verification & Domain Restricting

Registration enforces an optional regular expression filter (e.g. `ALLOWED_EMAIL_DOMAIN_REGEX=^[a-zA-Z0-9._%+-]+@.*college.*\.edu$`). Accounts cannot be created outside the college's approved domain.

### 4.3 Secrets Management

- All sensitive keys (`DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`) are loaded exclusively from environment variables via Zod schema validation.
- Missing or malformed configuration aborts backend startup immediately (`fail-fast` pattern).
- Secrets are never committed to version control (`.gitignore` enforces exclusions).

### 4.4 Deterministic Judging Separation from AI

The AI Tutor has **zero authority** over judging:

- Judging is 100% deterministic and computed by the sandbox execution diff against test cases.
- AI is only invoked upon student request to provide Socratic guidance.
- AI prompts have guardrails barring direct code synthesis to uphold academic integrity.
