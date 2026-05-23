---
phase: 03
slug: initial-testing-framework
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-19
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | pytest 8.x / vitest 3.x |
| **Config file** | pyproject.toml / vitest.config.ts |
| **Quick run command** | `pytest backend/tests/test_parity.py` |
| **Full suite command** | `pytest backend/tests && npm run test --prefix frontend` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pytest backend/tests -k <test_name>`
- **After every plan wave:** Run `test_backend.bat && test_frontend.bat`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | REQ-201 | — | N/A | integration | `pytest backend/tests/test_api.py` | ❌ W0 | ⬜ pending |
| 3-01-02 | 01 | 1 | REQ-203 | — | N/A | property | `pytest backend/tests/test_parity.py` | ❌ W0 | ⬜ pending |
| 3-02-01 | 02 | 2 | REQ-202 | — | N/A | unit | `npm run test --prefix frontend` | ❌ W0 | ⬜ pending |

---

## Wave 0 Requirements

- [ ] `backend/tests/conftest.py` — shared fixtures for async DB
- [ ] `backend/tests/test_parity.py` — stubs for Hypothesis tests
- [ ] `frontend/src/__tests__/store.test.ts` — stubs for store tests

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| .bat script execution | REQ-201 | OS-level | Manually run `test_backend.bat` and verify output color coding. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
