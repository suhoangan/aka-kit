---
paths:
  - 'apps/web/**'
description: Next.js 15 App Router rules for the monorepo web app
---

# Next.js Rules

- Next.js 15, App Router, strict TypeScript
- Server components are the default — add `"use client"` only when necessary
- Fetch Strapi data via `packages/cms-client` or direct server-side fetch
- CMS base URL from env: `NEXT_PUBLIC_CMS_URL` (public) or `CMS_URL` (server-only)
- Run dev: `yarn dev:web`

## Project Structure

- Use the App Router directory structure
- Place components in `app` directory for route-specific components
- Place shared components in `components` directory
- Place utilities and helpers in `lib` directory
- Use lowercase with dashes for directories (e.g., `components/auth-wizard`)

## Components

- Use Server Components by default; mark client components with `'use client'`
- Wrap client components in Suspense with fallback
- Use dynamic loading for non-critical components
- Implement proper error boundaries
- Place static content and interfaces at file end

### Component File Structure

All UI components live in `apps/web/src/components/ui/<component-name>/`:

```
apps/web/src/components/ui/my-component/
  index.tsx
  styles.module.scss
  strapi.register.ts   ← only if Strapi-registered
```

- Use kebab-case for directory names
- Export a named component and its props interface from `index.tsx`
- Use `clsx` for conditional class merging with CSS Modules

### Styling Conventions

- Use the `Typography` component for all text — not raw `<p>`, `<h1>`–`<h6>`, `<span>`
- Use the `Button` component for all buttons/links — not raw `<button>` or `<a>`
- Class names use **camelCase** (e.g., `.container`, `.cardTitle`)
- Add media queries by importing breakpoints: `@use '@/styles/breakpoints' as *`
- Use mixins like `@include media-breakpoint-down(lg)`
- Design tokens (colors, spacing, typography) are CSS custom properties in `apps/web/src/styles/global.css`
- Always use variables: `var(--color-text-primary)`, `var(--spacing-md)`, `var(--font-size-base)`, etc.
- Before writing any styles, read `global.css` and `breakpoints` to check available vars

### Strapi Component Registration

Always ask the user before registering a component with Strapi. If confirmed:

1. Create `strapi.register.ts` in the component directory
2. Register in `apps/web/src/components/ui/component-register.ts`
3. Create CMS component JSON schema at `apps/cms/src/components/components/<component-name>.json`
4. Generate TypeScript types: `yarn workspace cms strapi ts:generate-types`

## API Routes

- Use `NextRequest` / `NextResponse` for route handlers
- Validate all input with Zod before processing
- Clients never call Strapi directly — always go through a Next.js API route
- Use `revalidateTag()` or `revalidatePath()` for on-demand revalidation

## Performance

- Minimize use of `useEffect` and `setState`
- Favor Server Components (RSC) where possible
- Optimize images: use WebP format, size data, lazy loading
- Implement proper caching strategies

## Data Fetching

- Use Server Components for data fetching when possible
- Implement proper error handling
- Handle loading and error states appropriately

## Forms and Validation

- Use Zod for form validation
- Implement proper server-side validation
- Handle form errors and show loading states during submission

## State Management

- Minimize client-side state
- Use React Context sparingly
- Prefer server state when possible
