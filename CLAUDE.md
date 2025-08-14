# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Major League UC is a Next.js 15 web application for students of Pontificia Universidad Católica de Chile to engage with football initiatives. The site features team information, match brackets, player profiles, and tournament management.

## Development Commands

```bash
# Development server (with Turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting and formatting
npm run lint
npm run lint:fix

# Cloudflare Pages deployment
npm run pages:build    # Build for Cloudflare Pages
npm run preview        # Local preview with Wrangler
npm run deploy         # Deploy to Cloudflare Pages
npm run cf-typegen     # Generate Cloudflare types
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS v4
- **Deployment**: Cloudflare Pages with Cloudflare D1 database
- **Database**: SQLite (D1) with custom migration system
- **Authentication**: Custom auth system using osuc.dev API with token-based authentication
- **Styling**: Tailwind CSS v4 with custom CSS variables in `app/styles/variables.css`

### Authentication & Authorization
- Authentication handled by `app/lib/services/auth.ts` using osuc.dev API
- Token stored in `osucookie` cookie or `USER_TOKEN` environment variable
- Route protection via folder structure:
  - `(auth-users)/` - requires authentication
  - `(admin)/` - requires admin permissions
- Permission checking functions in `app/actions/auth.ts`:
  - `isAdmin()` - checks for root permissions
  - `getProfile()` - retrieves user profile data

### Server Components & Actions
- Heavy use of Next.js Server Components for data fetching
- Server Actions located in `app/actions/` with `"use server"` directive
- Server Actions use `useActionState` hook pattern for form handling
- Database operations directly in Server Components using Cloudflare D1

### Database & Migrations
- Custom migration system in `/migrations/` directory
- Key scripts:
  - `./setup.sh` - Initial database setup
  - `./migrate_safe.sh` - Safe migrations with automatic rollback
  - `./backup_daily.sh` - Automated backups
  - `./verify_integrity.sh` - Data integrity checks
- Database binding: `context.env.DB` (Cloudflare D1)

### Route Structure
- `(home)/` - Public pages (home, teams, positions, participation)
- `(auth)/login/` - Authentication pages
- `(admin)/dashboard/` - Admin management pages
- `perfil/` - User profile page
- Dynamic routes: `posiciones/[year]/[semester]/`

### Component Organization
- `components/ui/` - Reusable UI components (Button, Form, Input, Navbar, Footer)
- `components/home/` - Home page specific components
- `components/forms/` - Form components with Server Actions
- `components/data/` - Data display components
- `components/admin/` - Admin dashboard components
- `components/youtube/` - YouTube integration components

### Styling System
- Tailwind CSS v4 with CSS-in-JS configuration
- Custom CSS variables defined in `app/styles/variables.css`
- Design tokens for colors, spacing, and breakpoints
- Mobile-first responsive design approach
- Custom animations in `app/styles/animations/`

### TypeScript Configuration
- Path aliases: `@/*` maps to `./app/*`
- Strict TypeScript settings enabled
- Custom types in `app/lib/types/` for database models and API responses

### Code Quality
- ESLint with Next.js, Prettier, and custom rules
- Automatic import organization and unused import removal
- React component naming conventions enforced
- Prettier formatting with Tailwind CSS plugin

### Performance Optimizations
- Next.js Partial Prerendering (PPR) enabled
- Image optimization with WebP/AVIF formats
- Compression and caching enabled
- Suspense boundaries for loading states

### Key Libraries
- `@heroicons/react` - Icons
- `@radix-ui` - UI primitives (checkbox, navigation)
- `framer-motion` - Animations
- `class-variance-authority` & `clsx` - Styling utilities
- `zod` - Schema validation
- `lucide-react` - Additional icons

## Development Patterns

### Server Actions Pattern
```typescript
"use server";
export async function ActionName(prevState, formData) {
  // Server-side logic with database operations
  // Return state object for useActionState
}
```

### Authentication Check Pattern
```typescript
const { isAuthenticated, isAdmin, userData, userProfile } = await getAuthStatus();
```

### Database Query Pattern
```typescript
const context = getRequestContext();
const result = await context.env.DB.prepare("SELECT * FROM table WHERE id = ?")
  .bind(id)
  .first();
```

### Component Export Pattern
Use function declarations for named components as enforced by ESLint rules.