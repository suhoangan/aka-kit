---
title: Security Review Checklist
tags: security, OWASP, XSS, SQL injection, auth, secrets, API
---

# Security Review

Language-agnostic security audit checklist following OWASP Top 10 and web security best practices.

## 1. Authentication & Authorization

- [ ] Auth required on all protected routes/endpoints
- [ ] Authorization checked at the resource level (not just route level)
- [ ] No privilege escalation paths (user can't act as admin)
- [ ] Password hashing uses bcrypt/argon2 (never MD5/SHA1)
- [ ] Token expiry enforced (JWT exp, session timeout)
- [ ] Failed login attempts rate-limited or throttled

## 2. Input Validation & Sanitization

- [ ] All user input validated before processing
- [ ] Whitelist validation (not blacklist)
- [ ] Type coercion/casting on all numeric params
- [ ] File upload: whitelist extensions + MIME type check + size limit
- [ ] Reject unexpected fields (strict schema validation)

## 3. SQL Injection Prevention

- [ ] No raw string concatenation in queries
- [ ] Parameterized queries / prepared statements used
- [ ] ORM methods used correctly (no raw SQL escape bypasses)
- [ ] Query results not trusted as safe for further queries

```
❌ `SELECT * FROM users WHERE email = '${email}'`
✅ `db.query('SELECT * FROM users WHERE email = ?', [email])`
```

## 4. XSS (Cross-Site Scripting) Prevention

- [ ] All dynamic output HTML-escaped before render
- [ ] No `dangerouslySetInnerHTML` / `innerHTML` with user data
- [ ] JSON embedded in HTML properly encoded
- [ ] `Content-Security-Policy` header configured
- [ ] User-controlled URLs validated before use in `href`/`src`

## 5. CSRF Protection

- [ ] State-changing requests use anti-CSRF tokens or `SameSite` cookies
- [ ] AJAX requests include CSRF token in headers
- [ ] `SameSite=Strict` or `SameSite=Lax` on session cookies
- [ ] GET requests never perform state changes

## 6. Secrets & Credentials

- [ ] No hardcoded secrets, API keys, or passwords in code
- [ ] `.env` files not committed (check `.gitignore`)
- [ ] Secrets loaded from environment variables or vault
- [ ] CI/CD secrets stored in secrets manager (not in YAML files)
- [ ] Log statements don't output tokens, passwords, or PII

```
❌ `const API_KEY = 'sk-abc123...'`
✅ `const API_KEY = process.env.API_KEY`
```

## 7. API Security

- [ ] All endpoints require authentication (unless intentionally public)
- [ ] Rate limiting implemented on public/auth endpoints
- [ ] Error responses don't leak stack traces or internal paths
- [ ] CORS configured to allowlist (not `*`) for credentialed requests
- [ ] HTTP methods restricted (no DELETE on a GET-only resource)
- [ ] Response headers: `X-Content-Type-Options`, `X-Frame-Options`

## 8. Session Security

- [ ] Session cookies: `HttpOnly`, `Secure`, `SameSite` flags set
- [ ] Session ID regenerated after login
- [ ] Session invalidated on logout (server-side)
- [ ] Session timeout enforced

## 9. Sensitive Data Protection

- [ ] PII not logged
- [ ] Sensitive data encrypted at rest (DB fields, files)
- [ ] Payment data never stored — use payment provider tokens
- [ ] Data minimization: only collect what's needed
- [ ] HTTPS enforced (no HTTP fallback for sensitive routes)

## 10. Dependencies

- [ ] Run `npm audit` / `composer audit` / `pip-audit` — no known critical/high CVEs
- [ ] Pinned versions in lockfile (not loose ranges for production deps)
- [ ] Unused dependencies removed

---

## Report Format

```markdown
## Security Audit Report

**Scope:** [files/modules reviewed]
**Date:** YYYY-MM-DD

### Summary
- Critical: X | High: X | Medium: X | Low: X

### Findings

#### [CRITICAL] <title>
**Location:** `path/to/file.ts:42`
**Issue:** <what is wrong>
**Risk:** <what can be exploited>
**Fix:** <concrete fix>

#### [HIGH] <title>
...

#### [MEDIUM] <title>
...

#### [LOW] <title>
...

### Verdict
- [ ] APPROVED — no critical/high issues
- [ ] APPROVED WITH COMMENTS — medium/low only
- [ ] CHANGES REQUIRED — fix critical/high before merge
```
