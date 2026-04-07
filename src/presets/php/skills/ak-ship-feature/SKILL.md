---
name: ak:ship-feature
description: End-to-end PHP feature implementation with testing and security review. Use when building new features, modules, or services in PHP projects (Magento 2, Laravel, Symfony).
argument-hint: <feature description>
---

# Ship Feature — End-to-End PHP Implementation

**Purpose:** Orchestrate complete feature implementation from planning through security review for PHP projects.

**Auto-Injected Context:**
- PHP version: {{ php -v }}
- Git status: {{ git status --short }}
- Current branch: {{ git branch --show-current }}

---

## Phase 1: Planning & Architecture

**Tasks:**
1. Analyze feature requirements and decompose into components
2. Design directory structure and class hierarchy
3. Plan dependency injection / service container configuration
4. Design database schema (migrations)
5. Plan API endpoints / routes (if applicable)
6. Identify security requirements (ACL, auth, validation)

**Deliverables:**
- Component/module structure
- DI/service configuration design
- Database migration plan
- API contract / route definitions
- Security requirements list

**Constraints:**
- Follow PSR-12 code style
- Use dependency injection (not service locator pattern)
- Design for testability (interfaces, contracts)
- Follow framework conventions (Laravel/Symfony/Magento)

---

## Phase 2: Implementation

**Tasks:**
1. Create module/component structure
2. Implement models, repositories, services
3. Configure DI / service container
4. Create database migrations
5. Implement controllers / API endpoints
6. Create views / templates (if applicable)

**Verification:**
- [ ] `php-cs-fixer fix` or `vendor/bin/phpcbf` passes
- [ ] `vendor/bin/phpstan analyse` passes (level 1+)
- [ ] Strict types declared in all files
- [ ] Unit/integration tests written
- [ ] All tests pass

---

## Phase 3: Security & Compliance Review

**Agent:** `code-reviewer`

**Security Checks:**
- [ ] SQL injection prevented (use parameterized queries / ORM)
- [ ] XSS prevented (output escaping in templates)
- [ ] CSRF protection enabled
- [ ] Authentication on protected routes
- [ ] Authorization / ACL checks
- [ ] Input validation on all user input
- [ ] No hardcoded secrets
- [ ] File uploads validated (if applicable)
- [ ] API endpoints secured

**Data Protection:**
- [ ] Sensitive data not logged
- [ ] Customer data properly protected
- [ ] Database connections secure
- [ ] Actions auditable

---

## Phase 4: Testing & Quality

**Testing Strategy:**
1. **Unit Tests** — business logic, services, models
2. **Integration Tests** — database operations, API endpoints
3. **Manual Testing** — UI flows, edge cases

**Quality Checks:**
- [ ] PHP CS Fixer / PHPCBF formatting
- [ ] PHPStan static analysis
- [ ] Strict types on all files
- [ ] DocBlocks for public methods
- [ ] No deprecated methods used
- [ ] Tests pass with coverage

---

## Phase 5: Summary & PR

**Output:**
1. **Files Changed** — modules/components created or modified
2. **Test Plan** — how to verify the feature
3. **Deployment Checklist:**
   - [ ] All tests passing
   - [ ] Security review addressed
   - [ ] Code style passing
   - [ ] Migrations tested (up/down)
   - [ ] Cache/config cleared
4. **PR with summary, testing steps, security notes**

---

## Magento 2 Specifics

When working in Magento 2 projects:
- Module structure: `app/code/Vendor/Module/`
- Use `registration.php`, `etc/module.xml`, `composer.json`
- Declarative schema: `etc/db_schema.xml`
- DI config: `etc/di.xml` (plugins, preferences, virtual types)
- ACL: `etc/acl.xml` + `_isAllowed()` in admin controllers
- Test: `bin/magento module:enable`, `setup:upgrade`, `setup:di:compile`
- Follow MEQP2 coding standards

## Laravel Specifics

When working in Laravel projects:
- Use Artisan generators: `php artisan make:model/controller/migration`
- Service providers for DI bindings
- Eloquent for models, migrations for schema
- Form requests for validation
- Middleware for auth/authorization
- Feature tests with `RefreshDatabase` trait

---

**Invocation:**
```
/ak:ship-feature Add user notification system with email and SMS
/ak:ship-feature Implement product search with Elasticsearch
```
