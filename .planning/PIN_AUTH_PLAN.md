# PIN-Based Authentication Implementation Plan (Revised)

This plan outlines the architecture for implementing a local-first PIN lock for the Habit and Expense Tracker. The system is designed as a lightweight screen-lock -- not a multi-user auth system -- consistent with the single-user, local-first philosophy defined in `GEMINI.md`.

---

## Architectural Overview

### Design Philosophy
- **Single-User Local Lock:** Privacy gate for a single-user local SQLite database.
- **JWT Token Flow:** Backend issues 24-hour JWT tokens upon success. All data routes require valid tokens.
- **Bcrypt Hashing:** PINs and recovery keys are hashed with `bcrypt` (12 rounds) + unique salts.
- **Recovery Strategy (Option A):** 16-character alphanumeric Recovery Key generated during setup. ONE-TIME display.

### Security Boundaries
| Concern | Decision |
|:---|:---|
| PIN Storage | Bcrypt hash in `auth_config` table. |
| Recovery Key | Bcrypt hash in `auth_config` table. |
| Token Storage | `localStorage` on frontend. |
| Brute Force | 5 failed attempts = 60-second lockout (Backend enforced). |
| Complexity | 4-8 digit numeric PIN. Blocklist for simple patterns (1234, 0000). |

---

## Implementation Roadmap

### Phase 1: Backend Auth Layer

#### 1.1 New Dependencies
- `pyjwt>=2.8.0` (JWT tokens)
- `bcrypt>=4.1.0` (Secure hashing)

#### 1.2 Database: `auth_config` Table
| Column | Type | Description |
|:---|:---|:---|
| `id` | INTEGER | Primary key (1) |
| `pin_hash` | STRING | Bcrypt-hashed PIN |
| `recovery_key_hash`| STRING | Bcrypt-hashed recovery key |
| `failed_attempts` | INTEGER | Atomic counter |
| `locked_until` | DATETIME | Lockout expiry |

#### 1.3 Endpoints
- `GET /auth/status`: Check if setup is complete and lockout status.
- `POST /auth/setup`: Create PIN + Recovery Key. Returns plain Recovery Key (once).
- `POST /auth/login`: Verify PIN -> Returns JWT.
- `POST /auth/change-pin`: [Auth Required] Verify current PIN -> Set new PIN.
- `POST /auth/recover`: Verify Recovery Key -> Set new PIN.

---

### Phase 2: Frontend Lock Screen

#### 2.1 UI Components
- `PinInput.tsx`: Custom dot-masked numeric input.
- `LockScreen.tsx`: Full-screen glassmorphism overlay.
- `PinSetup.tsx`: PIN creation + Recovery Key confirmation step.
- `ChangePinModal.tsx`: Post-login management.

#### 2.2 Auth Flow
1. **Check Status:** If not configured, show `PinSetup`.
2. **Setup:** User sets PIN -> App shows Recovery Key -> User confirms saving -> App stores.
3. **Login:** PIN entry -> Store token in `localStorage`.
4. **Interception:** `api.ts` catch 401s -> Clear store -> Redirect to lock.

---

### Phase 3: Edge Case Handling

| Case | Mitigation |
|:---|:---|
| **Multi-tab Logout**| `localStorage` event listener to sync auth state across tabs. |
| **Token Expiry** | Frontend checks `exp` claim; prompts re-entry before expiry. |
| **Atomic Racing** | Use DB-level increments (`failed_attempts = failed_attempts + 1`). |
| **Weak PINs** | Blocklist common patterns (1234, 1111, serial digits). |
| **Forgot PIN** | Enter 16-char Recovery Key to override and set new PIN. |
| **Setup Confirmation**| User must type first 4 chars of Recovery Key to confirm save. |
| **DB Recreation** | Dependency allows bypass if `auth_config` table is empty. |

---

## 2 W's & 1 H (Implementation Strategy)
- **What:** Implementing a secure, recovery-enabled PIN lock system.
- **Why:** To provide local device privacy without requiring external cloud auth providers.
- **How:** By combining bcrypt-hashed local persistence with short-lived JWT session tokens.
