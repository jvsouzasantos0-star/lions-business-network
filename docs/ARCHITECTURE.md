# Lions Business Network Architecture

## 1. System Overview

Lions Business Network is a premium business networking PWA for entrepreneurs to discover partner companies, access member-only offers, and unlock premium benefits. The application uses a simple and fast architecture built with:

- **Backend:** Node.js + Express
- **Database:** SQLite
- **Frontend:** Vanilla HTML, CSS, and JavaScript
- **Authentication:** JWT access tokens
- **Distribution:** Installable PWA served from the same Express app

### Goals

- Keep the stack lightweight and easy to deploy
- Support mobile-first usage with installable PWA behavior
- Provide secure authentication and gated premium/member content
- Maintain a premium brand experience with a futuristic dark UI

### Visual/Brand Notes

- Primary accent: `#00FF66`
- Core palette: black, white, dark graphite, metallic silver
- Style: futuristic, premium, sharp contrasts, soft neon glow
- Brand asset reference: `C:\Users\jvsou\.verdent\artifacts\buckets\a7fdd551-9c65-4abb-96fa-3a3c545bf1a4\images\1777347234070_ab3550ac.png`
- Recommended use of lion artwork:
  - splash/login hero
  - dashboard featured banner
  - app icon adaptation for PWA assets

## 2. Text-Based System Diagram

```text
┌───────────────────────────────────────────────────────────┐
│                    User Device (Mobile/Web)              │
│  Vanilla HTML/CSS/JS UI + PWA Shell + Service Worker     │
└───────────────┬───────────────────────────────┬───────────┘
                │ HTTPS / JSON API              │ Static files
                ▼                               ▼
┌───────────────────────────────────────────────────────────┐
│                     Node.js + Express                    │
│                                                           │
│  Middlewares                                              │
│  - helmet                                                 │
│  - cors                                                   │
│  - express-rate-limit                                     │
│  - auth middleware (JWT)                                  │
│  - request validation                                     │
│                                                           │
│  Route Modules                                            │
│  - /api/auth                                              │
│  - /api/dashboard                                         │
│  - /api/companies                                         │
│  - /api/offers                                            │
│  - /api/member-content                                    │
│  - /api/plans                                             │
│                                                           │
│  Services                                                 │
│  - AuthService                                            │
│  - CompanyService                                         │
│  - OfferService                                           │
│  - MembershipService                                      │
│  - PwaAssetService                                        │
└───────────────────────────────┬───────────────────────────┘
                                │ SQL
                                ▼
┌───────────────────────────────────────────────────────────┐
│                         SQLite                            │
│  users, plans, categories, companies, offers,             │
│  member_contents, auth_sessions                           │
└───────────────────────────────────────────────────────────┘
```

## 3. Technical Stack

### Backend

- **Node.js 20+**
- **Express 5** for HTTP routing and static asset delivery
- **better-sqlite3** for predictable SQLite access and simple deployment
- **jsonwebtoken** for access tokens
- **bcryptjs** for password hashing
- **express-rate-limit** for auth and public endpoint protection
- **helmet** for baseline security headers
- **cors** if app and API are ever served from separate origins
- **zod** or **express-validator** for request validation

### Frontend

- **Vanilla HTML**
- **Vanilla CSS** with custom properties for theme tokens
- **Vanilla JS modules** for API access, auth state, rendering, and PWA install flow
- **No frontend framework**, preserving fast load and minimal complexity

### PWA

- `manifest.webmanifest`
- `service-worker.js`
- offline fallback page
- icons in multiple sizes
- theme color and background color aligned to dark neon design

## 4. Recommended Project Folder Structure

```text
lions-business-network/
├─ docs/
│  ├─ ARCHITECTURE.md
│  ├─ DATABASE.md
│  └─ API.md
├─ server/
│  ├─ src/
│  │  ├─ app.js
│  │  ├─ server.js
│  │  ├─ config/
│  │  │  ├─ env.js
│  │  │  └─ db.js
│  │  ├─ middlewares/
│  │  │  ├─ auth.js
│  │  │  ├─ error-handler.js
│  │  │  ├─ not-found.js
│  │  │  └─ rate-limit.js
│  │  ├─ routes/
│  │  │  ├─ auth.routes.js
│  │  │  ├─ dashboard.routes.js
│  │  │  ├─ companies.routes.js
│  │  │  ├─ offers.routes.js
│  │  │  ├─ member-content.routes.js
│  │  │  └─ plans.routes.js
│  │  ├─ controllers/
│  │  │  ├─ auth.controller.js
│  │  │  ├─ dashboard.controller.js
│  │  │  ├─ companies.controller.js
│  │  │  ├─ offers.controller.js
│  │  │  ├─ member-content.controller.js
│  │  │  └─ plans.controller.js
│  │  ├─ services/
│  │  │  ├─ auth.service.js
│  │  │  ├─ dashboard.service.js
│  │  │  ├─ companies.service.js
│  │  │  ├─ offers.service.js
│  │  │  └─ membership.service.js
│  │  ├─ repositories/
│  │  │  ├─ users.repository.js
│  │  │  ├─ plans.repository.js
│  │  │  ├─ companies.repository.js
│  │  │  ├─ offers.repository.js
│  │  │  ├─ member-content.repository.js
│  │  │  └─ auth-sessions.repository.js
│  │  ├─ utils/
│  │  │  ├─ jwt.js
│  │  │  ├─ password.js
│  │  │  ├─ slug.js
│  │  │  └─ errors.js
│  │  └─ db/
│  │     ├─ migrations/
│  │     └─ seeds/
│  ├─ package.json
│  └─ .env.example
├─ public/
│  ├─ index.html
│  ├─ empresas.html
│  ├─ empresa.html
│  ├─ ofertas.html
│  ├─ meu-plano.html
│  ├─ login.html
│  ├─ cadastro.html
│  ├─ offline.html
│  ├─ manifest.webmanifest
│  ├─ service-worker.js
│  ├─ assets/
│  │  ├─ icons/
│  │  ├─ images/
│  │  └─ logos/
│  ├─ css/
│  │  ├─ tokens.css
│  │  ├─ base.css
│  │  ├─ layout.css
│  │  ├─ components.css
│  │  └─ pages/
│  └─ js/
│     ├─ api.js
│     ├─ auth.js
│     ├─ storage.js
│     ├─ pwa.js
│     ├─ ui.js
│     ├─ guards.js
│     └─ pages/
│        ├─ home.js
│        ├─ companies.js
│        ├─ company-detail.js
│        ├─ offers.js
│        ├─ plan.js
│        ├─ login.js
│        └─ register.js
└─ data/
   └─ lions-business-network.sqlite
```

## 5. Core Domain Model

### Main Entities

- **users**: registered members
- **plans**: basic and premium membership definitions
- **categories**: business categories for company filtering
- **companies**: partner companies visible to members
- **offers**: active promotions and benefits
- **member_contents**: exclusive members-only or premium-only content blocks
- **auth_sessions**: JWT session tracking and refresh/revocation support

### Business Rules

1. A user must register with exactly one plan (`basic` or `premium`).
2. Only authenticated users can access dashboard, companies, offers, and member content.
3. Premium-only benefits must be hidden from basic members both in UI and API.
4. One or more companies may be featured, but only one should be marked as primary “company of the week” at a time.
5. Offers belong to one company.
6. Company category filters are driven by normalized category records.

## 6. Database Schema Summary

### plans

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | autoincrement |
| slug | TEXT | unique, `basic` / `premium` |
| name | TEXT | display name |
| price_cents | INTEGER | integer currency storage |
| billing_cycle | TEXT | e.g. `monthly`, `annual` |
| benefits_json | TEXT | JSON array of benefits |
| is_premium | INTEGER | 0 or 1 |
| created_at | TEXT | ISO datetime |
| updated_at | TEXT | ISO datetime |

### users

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | autoincrement |
| full_name | TEXT | required |
| email | TEXT | unique, lowercase |
| password_hash | TEXT | bcrypt hash |
| plan_id | INTEGER FK | references `plans.id` |
| role | TEXT | default `member` |
| status | TEXT | `active`, `inactive`, `suspended` |
| last_login_at | TEXT | nullable |
| created_at | TEXT | ISO datetime |
| updated_at | TEXT | ISO datetime |

### categories

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | autoincrement |
| name | TEXT | unique |
| slug | TEXT | unique |
| sort_order | INTEGER | UI ordering |
| created_at | TEXT | ISO datetime |

### companies

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | autoincrement |
| name | TEXT | required |
| slug | TEXT | unique |
| category_id | INTEGER FK | references `categories.id` |
| description | TEXT | required |
| phone | TEXT | required |
| whatsapp_number | TEXT | required, E.164-like format |
| discount_percent | INTEGER | 0-100 |
| logo_url | TEXT | asset path or URL |
| website_url | TEXT | optional |
| is_company_of_week | INTEGER | 0 or 1 |
| is_active | INTEGER | 0 or 1 |
| featured_order | INTEGER | optional ordering for highlights |
| created_at | TEXT | ISO datetime |
| updated_at | TEXT | ISO datetime |

### offers

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | autoincrement |
| company_id | INTEGER FK | references `companies.id` |
| title | TEXT | required |
| description | TEXT | required |
| discount_percent | INTEGER | nullable 0-100 |
| promo_code | TEXT | optional |
| starts_at | TEXT | offer start |
| expiry_date | TEXT | offer end |
| is_premium_only | INTEGER | 0 or 1 |
| is_active | INTEGER | 0 or 1 |
| created_at | TEXT | ISO datetime |
| updated_at | TEXT | ISO datetime |

### member_contents

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | autoincrement |
| title | TEXT | required |
| slug | TEXT | unique |
| summary | TEXT | card summary |
| body_html | TEXT | sanitized HTML |
| access_level | TEXT | `members` or `premium` |
| is_active | INTEGER | 0 or 1 |
| published_at | TEXT | publication datetime |
| created_at | TEXT | ISO datetime |
| updated_at | TEXT | ISO datetime |

### auth_sessions

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | autoincrement |
| user_id | INTEGER FK | references `users.id` |
| token_jti | TEXT | unique JWT identifier |
| refresh_token_hash | TEXT | nullable if refresh disabled |
| expires_at | TEXT | expiration datetime |
| revoked_at | TEXT | nullable |
| ip_address | TEXT | optional |
| user_agent | TEXT | optional |
| created_at | TEXT | ISO datetime |

## 7. Relationships

```text
plans 1 ──── * users
categories 1 ──── * companies
companies 1 ──── * offers
users 1 ──── * auth_sessions
member_contents visible by access_level, not direct FK
```

## 8. API Surface Summary

Base URL: `/api`

### Public

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new member | No |
| POST | `/auth/login` | Authenticate and receive tokens | No |
| POST | `/auth/refresh` | Refresh access token | No/Refresh |
| GET | `/health` | Health check | No |
| GET | `/meta/manifest` | App metadata/bootstrap info | No |

### Authenticated

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/auth/logout` | Revoke current session | Yes |
| GET | `/auth/me` | Current user profile and plan | Yes |
| GET | `/dashboard` | Dashboard payload with featured company and summaries | Yes |
| GET | `/companies` | List companies with category filters | Yes |
| GET | `/companies/:id` | Company detail by ID | Yes |
| GET | `/companies/slug/:slug` | Company detail by slug | Yes |
| GET | `/categories` | Available company categories | Yes |
| GET | `/offers` | List active offers | Yes |
| GET | `/offers/:id` | Offer detail | Yes |
| GET | `/member-content` | List member/premium content visible to user | Yes |
| GET | `/member-content/:slug` | Member content detail | Yes |
| GET | `/plans/me` | Active user plan and benefits | Yes |

### Optional Admin-Only Endpoints for Content Management

These are not required for the first release UI, but they make operations easier:

| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/admin/companies` | Create company | Admin |
| PUT | `/admin/companies/:id` | Update company | Admin |
| POST | `/admin/offers` | Create offer | Admin |
| PUT | `/admin/offers/:id` | Update offer | Admin |
| POST | `/admin/member-content` | Create content | Admin |

## 9. Frontend Pages and Components

### Pages

1. **`index.html` (Home/Dashboard)**
   - welcome header
   - company of the week card
   - quick stats
   - featured offers
   - premium spotlight cards

2. **`empresas.html`**
   - searchable company grid
   - category pills/filter bar
   - partner logo cards

3. **`empresa.html`**
   - single company profile
   - description
   - phone
   - WhatsApp CTA
   - discount badge
   - related offers

4. **`ofertas.html`**
   - active promotions list
   - expiry state
   - company name and logo
   - premium-only lock marker when applicable

5. **`meu-plano.html`**
   - current plan
   - included benefits
   - premium upsell for basic users
   - exclusive content cards

6. **`login.html`**
   - email/password login

7. **`cadastro.html`**
   - registration form
   - name, email, password, plan selection

8. **`offline.html`**
   - offline fallback with retry CTA

### Shared UI Components

- app shell/top header
- bottom navigation: Home, Empresas, Ofertas, Meu Plano
- company card
- offer card
- category chip
- premium badge
- WhatsApp CTA button
- loading skeletons
- toast/alert system
- auth guard/redirect helper

## 10. Authentication Flow

### Registration

1. User opens `cadastro.html`
2. Frontend submits `full_name`, `email`, `password`, `plan_slug`
3. Backend validates payload and email uniqueness
4. Password is hashed with bcrypt
5. User is inserted with selected plan
6. Backend issues JWT access token and optional refresh token
7. Frontend stores token securely in memory + localStorage/sessionStorage strategy
8. User is redirected to dashboard

### Login

1. User submits email and password
2. Backend validates credentials
3. Backend creates `auth_sessions` row with `token_jti`
4. Backend signs access token containing:
   - `sub` = user ID
   - `email`
   - `plan`
   - `role`
   - `jti`
5. Frontend stores auth state and fetches `/api/auth/me`

### Protected Request Flow

1. Frontend sends `Authorization: Bearer <token>`
2. Auth middleware verifies signature, expiry, and session status
3. Request proceeds if user is active and token is valid
4. Premium-only data is filtered using user plan

### Logout

1. Frontend calls `/api/auth/logout`
2. Session is revoked in `auth_sessions`
3. Frontend clears local auth state
4. User is redirected to login

## 11. Authorization Model

- **Guest**
  - login/register only
- **Basic Member**
  - dashboard access
  - company directory
  - standard offers
  - members-only content
- **Premium Member**
  - all basic access
  - premium offers
  - premium content
  - highlighted “exclusive benefits” blocks
- **Admin** (operational role)
  - content and partner management

## 12. Dashboard Composition

Recommended `/api/dashboard` response sections:

- authenticated user summary
- company of the week
- top categories
- featured companies
- latest active offers
- premium highlights
- membership summary

This reduces round-trips and improves mobile PWA performance.

## 13. Search, Filtering, and Highlighting

### Company Filters

- category slug
- text search by company name
- active-only results
- ordering:
  1. company of the week
  2. featured order
  3. alphabetical name

### Offer Filters

- active only
- expiry date not in the past
- optional `premium_only=true`
- optional category/company filters

## 14. WhatsApp Integration

Each company profile exposes a direct CTA using:

```text
https://wa.me/<whatsapp_number>?text=<encoded_message>
```

Recommendations:

- store `whatsapp_number` normalized without spaces/symbols
- prefill message:
  - “Olá! Encontrei sua empresa na Lions Business Network e gostaria de saber mais.”
- track outbound clicks in future analytics, if added later

## 15. Security Requirements

- bcrypt hash passwords with a strong cost factor
- never store plain text passwords
- JWT expiry kept short (e.g. 15 minutes access token)
- optional refresh token rotation using `auth_sessions`
- use `helmet`
- enforce input validation on all POST requests
- use generic auth errors to avoid account enumeration
- protect auth routes with rate limiting
- sanitize any rich HTML in member content before storage or rendering
- use parameterized SQL statements only

## 16. Error Handling Standard

Recommended JSON error shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid.",
    "details": [
      {
        "field": "email",
        "message": "Email must be valid."
      }
    ]
  }
}
```

Common codes:

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

## 17. Performance Notes

- serve frontend statically from Express
- aggregate dashboard data in one endpoint
- add SQLite indexes for `email`, `slug`, `category_id`, `expiry_date`, `is_active`
- cache immutable assets with hashed filenames
- service worker should precache shell assets and runtime-cache API GETs conservatively

## 18. PWA Configuration Notes

### Manifest

- `name`: Lions Business Network
- `short_name`: Lions Network
- `display`: `standalone`
- `theme_color`: `#000000`
- `background_color`: `#000000`
- `start_url`: `/index.html`
- icons: 192x192, 512x512, maskable variants

### Service Worker Strategy

- precache:
  - HTML shell
  - core CSS
  - core JS
  - icons
  - offline page
- network-first:
  - authenticated API requests
- stale-while-revalidate:
  - logos and non-sensitive static images
- offline fallback:
  - `offline.html`

### Mobile UX

- bottom navigation fixed within safe-area insets
- install prompt shown after engagement event
- touch-friendly buttons with strong visual contrast
- minimal payload for low-bandwidth usage

## 19. Environment Variables

Recommended `.env.example`:

```text
PORT=3000
NODE_ENV=development
JWT_SECRET=change-me
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
SQLITE_PATH=./data/lions-business-network.sqlite
APP_BASE_URL=http://localhost:3000
```

## 20. Implementation Phases

### Phase 1: Foundation

- initialize Express server
- configure SQLite connection and migrations
- create base schema and seed data
- add static frontend shell and design tokens

### Phase 2: Authentication

- register/login/logout/me
- auth middleware
- plan-aware JWT payload

### Phase 3: Member Experience

- dashboard endpoint
- companies list/detail
- offers list/detail
- member content gating

### Phase 4: PWA and Polish

- manifest and service worker
- offline page
- install flow
- performance tuning

### Phase 5: Operations

- admin content workflows
- observability/logging
- deployment hardening

## 21. Definition of Done

The architecture is considered complete when:

- all required features map to tables, endpoints, and pages
- basic and premium access rules are enforced on both client and server
- the app is installable as a PWA
- WhatsApp contact is available per company
- dashboard supports featured company and filtering journeys
- documentation is sufficient for implementation without architectural gaps