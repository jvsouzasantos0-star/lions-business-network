# Lions Business Network API Specification

Base path: `/api`

## 1. API Conventions

### Content Type

- Requests: `application/json`
- Responses: `application/json`

### Authentication

- Protected endpoints require `Authorization: Bearer <jwt>`
- JWT payload should include:
  - `sub`
  - `email`
  - `plan`
  - `role`
  - `jti`

### Standard Success Envelope

```json
{
  "data": {}
}
```

### Standard Error Envelope

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message.",
    "details": []
  }
}
```

## 2. Auth Endpoints

### POST `/auth/register`

Registers a new user and returns the initial authenticated session.

**Auth required:** No

#### Request Body

```json
{
  "full_name": "Marina Costa",
  "email": "marina@lionsnetwork.com",
  "password": "StrongPass123!",
  "plan_slug": "basic"
}
```

#### Validation Rules

- `full_name`: required, 2-120 chars
- `email`: required, valid email format
- `password`: required, minimum 8 chars
- `plan_slug`: required, `basic` or `premium`

#### Success Response `201`

```json
{
  "data": {
    "user": {
      "id": 1,
      "full_name": "Marina Costa",
      "email": "marina@lionsnetwork.com",
      "plan": {
        "slug": "basic",
        "name": "Plano Basic",
        "is_premium": false
      }
    },
    "tokens": {
      "access_token": "jwt-access-token",
      "expires_in": 900,
      "refresh_token": "opaque-or-jwt-refresh-token"
    }
  }
}
```

#### Errors

- `400 VALIDATION_ERROR`
- `409 CONFLICT` if email already exists

---

### POST `/auth/login`

Authenticates a member with email and password.

**Auth required:** No

#### Request Body

```json
{
  "email": "marina@lionsnetwork.com",
  "password": "StrongPass123!"
}
```

#### Success Response `200`

```json
{
  "data": {
    "user": {
      "id": 1,
      "full_name": "Marina Costa",
      "email": "marina@lionsnetwork.com",
      "plan": {
        "slug": "basic",
        "name": "Plano Basic",
        "is_premium": false
      },
      "role": "member"
    },
    "tokens": {
      "access_token": "jwt-access-token",
      "expires_in": 900,
      "refresh_token": "opaque-or-jwt-refresh-token"
    }
  }
}
```

#### Errors

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED` for invalid credentials
- `403 FORBIDDEN` if user status is inactive/suspended

---

### POST `/auth/refresh`

Rotates a refresh token and returns a new access token.

**Auth required:** Refresh token only

#### Request Body

```json
{
  "refresh_token": "opaque-or-jwt-refresh-token"
}
```

#### Success Response `200`

```json
{
  "data": {
    "access_token": "new-jwt-access-token",
    "expires_in": 900,
    "refresh_token": "rotated-refresh-token"
  }
}
```

#### Errors

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED` if refresh token is invalid, expired, or revoked

---

### POST `/auth/logout`

Revokes the current session or refresh token.

**Auth required:** Yes

#### Request Headers

```text
Authorization: Bearer <jwt>
```

#### Request Body

```json
{
  "refresh_token": "optional-refresh-token"
}
```

#### Success Response `200`

```json
{
  "data": {
    "message": "Logout successful."
  }
}
```

#### Errors

- `401 UNAUTHORIZED`

---

### GET `/auth/me`

Returns the authenticated user profile and plan.

**Auth required:** Yes

#### Success Response `200`

```json
{
  "data": {
    "id": 1,
    "full_name": "Marina Costa",
    "email": "marina@lionsnetwork.com",
    "role": "member",
    "status": "active",
    "plan": {
      "id": 1,
      "slug": "basic",
      "name": "Plano Basic",
      "is_premium": false,
      "benefits": [
        "Acesso à rede de parceiros",
        "Visualização de empresas",
        "Ofertas padrão"
      ]
    }
  }
}
```

#### Errors

- `401 UNAUTHORIZED`

## 3. Utility Endpoints

### GET `/health`

Basic application health endpoint.

**Auth required:** No

#### Success Response `200`

```json
{
  "data": {
    "status": "ok"
  }
}
```

---

### GET `/meta/manifest`

Returns app bootstrap metadata useful for frontend initialization.

**Auth required:** No

#### Success Response `200`

```json
{
  "data": {
    "app_name": "Lions Business Network",
    "theme_color": "#000000",
    "accent_color": "#00FF66",
    "support_whatsapp": true,
    "plans": [
      {
        "slug": "basic",
        "name": "Plano Basic"
      },
      {
        "slug": "premium",
        "name": "Plano Premium"
      }
    ]
  }
}
```

## 4. Dashboard Endpoints

### GET `/dashboard`

Returns the main dashboard payload for authenticated users.

**Auth required:** Yes

#### Query Params

None required.

#### Success Response `200`

```json
{
  "data": {
    "user": {
      "first_name": "Marina",
      "plan_slug": "basic",
      "is_premium": false
    },
    "company_of_the_week": {
      "id": 1,
      "name": "Neon Growth Studio",
      "slug": "neon-growth-studio",
      "category": "Marketing",
      "description": "Agência focada em crescimento digital, branding premium e performance comercial.",
      "phone": "+55 11 4000-1001",
      "whatsapp_url": "https://wa.me/5511991001001?text=Ol%C3%A1...",
      "discount_percent": 15,
      "logo_url": "/assets/logos/neon-growth-studio.png"
    },
    "featured_companies": [],
    "latest_offers": [],
    "premium_highlights": [],
    "categories": []
  }
}
```

#### Notes

- `premium_highlights` should only include accessible items for the current plan
- keep payload compact for mobile performance

#### Errors

- `401 UNAUTHORIZED`

## 5. Category Endpoints

### GET `/categories`

Lists categories used for company filtering.

**Auth required:** Yes

#### Success Response `200`

```json
{
  "data": [
    {
      "id": 1,
      "name": "Marketing",
      "slug": "marketing",
      "sort_order": 1
    }
  ]
}
```

#### Errors

- `401 UNAUTHORIZED`

## 6. Company Endpoints

### GET `/companies`

Returns active partner companies visible to authenticated users.

**Auth required:** Yes

#### Query Params

- `category` (optional): category slug
- `search` (optional): text match against company name
- `featured` (optional): `true` to prioritize featured only

#### Example

```text
GET /api/companies?category=marketing&search=studio
```

#### Success Response `200`

```json
{
  "data": [
    {
      "id": 1,
      "name": "Neon Growth Studio",
      "slug": "neon-growth-studio",
      "category": {
        "id": 1,
        "name": "Marketing",
        "slug": "marketing"
      },
      "description": "Agência focada em crescimento digital, branding premium e performance comercial.",
      "phone": "+55 11 4000-1001",
      "whatsapp_number": "5511991001001",
      "whatsapp_url": "https://wa.me/5511991001001?text=Ol%C3%A1...",
      "discount_percent": 15,
      "logo_url": "/assets/logos/neon-growth-studio.png",
      "website_url": "https://neongrowth.example.com",
      "is_company_of_week": true
    }
  ]
}
```

#### Errors

- `401 UNAUTHORIZED`

---

### GET `/companies/:id`

Returns a company by numeric ID.

**Auth required:** Yes

#### Success Response `200`

```json
{
  "data": {
    "id": 2,
    "name": "LionTech Systems",
    "slug": "liontech-systems",
    "category": {
      "id": 2,
      "name": "Tecnologia",
      "slug": "tecnologia"
    },
    "description": "Soluções em automação, sites institucionais e integrações sob medida.",
    "phone": "+55 11 4000-1002",
    "whatsapp_number": "5511991001002",
    "whatsapp_url": "https://wa.me/5511991001002?text=Ol%C3%A1...",
    "discount_percent": 12,
    "logo_url": "/assets/logos/liontech-systems.png",
    "website_url": "https://liontech.example.com",
    "is_company_of_week": false,
    "offers": [
      {
        "id": 2,
        "title": "Landing Page Premium",
        "expiry_date": "2026-07-15 23:59:59",
        "is_premium_only": false
      }
    ]
  }
}
```

#### Errors

- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

---

### GET `/companies/slug/:slug`

Returns a company by SEO-friendly slug.

**Auth required:** Yes

#### Success Response

Same structure as `GET /companies/:id`.

#### Errors

- `401 UNAUTHORIZED`
- `404 NOT_FOUND`

## 7. Offer Endpoints

### GET `/offers`

Returns active offers visible to the current member.

**Auth required:** Yes

#### Query Params

- `company_id` (optional)
- `category` (optional)
- `premium_only` (optional)
- `expires_before` (optional, ISO date)

#### Behavior

- basic users should not receive offers where `is_premium_only = true`
- expired or inactive offers should not be returned

#### Success Response `200`

```json
{
  "data": [
    {
      "id": 1,
      "title": "Pacote Branding Executivo",
      "description": "15% off em pacote de branding com diagnóstico comercial.",
      "discount_percent": 15,
      "promo_code": "LIONS15",
      "starts_at": "2026-05-01 00:00:00",
      "expiry_date": "2026-06-30 23:59:59",
      "is_premium_only": false,
      "company": {
        "id": 1,
        "name": "Neon Growth Studio",
        "slug": "neon-growth-studio",
        "logo_url": "/assets/logos/neon-growth-studio.png"
      }
    }
  ]
}
```

#### Errors

- `401 UNAUTHORIZED`

---

### GET `/offers/:id`

Returns one offer if visible to the current user.

**Auth required:** Yes

#### Success Response `200`

```json
{
  "data": {
    "id": 3,
    "title": "Check-up Empresarial VIP",
    "description": "20% de desconto em programa de saúde corporativa para equipes.",
    "discount_percent": 20,
    "promo_code": "VIPCARE20",
    "starts_at": "2026-05-01 00:00:00",
    "expiry_date": "2026-08-01 23:59:59",
    "is_premium_only": true,
    "company": {
      "id": 3,
      "name": "Prime Health Club",
      "slug": "prime-health-club"
    }
  }
}
```

#### Errors

- `401 UNAUTHORIZED`
- `403 FORBIDDEN` if basic user requests a premium-only offer
- `404 NOT_FOUND`

## 8. Member Content Endpoints

### GET `/member-content`

Returns members-only and premium-only content depending on the user plan.

**Auth required:** Yes

#### Success Response `200`

```json
{
  "data": [
    {
      "id": 1,
      "title": "Guia de Parcerias Estratégicas",
      "slug": "guia-parcerias-estrategicas",
      "summary": "Passos práticos para criar parcerias lucrativas dentro da rede.",
      "access_level": "members",
      "published_at": "2026-05-01 10:00:00"
    }
  ]
}
```

#### Errors

- `401 UNAUTHORIZED`

---

### GET `/member-content/:slug`

Returns a single piece of exclusive content if the member has access.

**Auth required:** Yes

#### Success Response `200`

```json
{
  "data": {
    "id": 2,
    "title": "Playbook Premium de Vendas B2B",
    "slug": "playbook-premium-vendas-b2b",
    "summary": "Framework exclusivo para premium acelerar receita com parceiros.",
    "body_html": "<h2>Playbook</h2><p>Conteúdo premium com estratégias avançadas de vendas.</p>",
    "access_level": "premium",
    "published_at": "2026-05-01 11:00:00"
  }
}
```

#### Errors

- `401 UNAUTHORIZED`
- `403 FORBIDDEN` when a basic member requests premium content
- `404 NOT_FOUND`

## 9. Plan Endpoints

### GET `/plans/me`

Returns the current user's plan, access level, and available benefits.

**Auth required:** Yes

#### Success Response `200`

```json
{
  "data": {
    "plan": {
      "id": 2,
      "slug": "premium",
      "name": "Plano Premium",
      "price_cents": 19900,
      "billing_cycle": "monthly",
      "is_premium": true,
      "benefits": [
        "Todos os benefícios do Basic",
        "Ofertas premium",
        "Benefícios exclusivos",
        "Maior destaque no ecossistema"
      ]
    },
    "available_sections": {
      "standard_offers": true,
      "premium_offers": true,
      "member_content": true,
      "premium_content": true
    }
  }
}
```

#### Errors

- `401 UNAUTHORIZED`

## 10. Optional Admin Endpoints

These are not required for the first user-facing release but are strongly recommended for operational management.

### POST `/admin/companies`

Creates a partner company.

**Auth required:** Admin JWT

#### Request Body

```json
{
  "name": "Nova Empresa",
  "category_id": 2,
  "description": "Descrição da empresa",
  "phone": "+55 11 4000-1111",
  "whatsapp_number": "5511991111111",
  "discount_percent": 10,
  "logo_url": "/assets/logos/nova-empresa.png",
  "website_url": "https://novaempresa.example.com",
  "is_company_of_week": false
}
```

### PUT `/admin/companies/:id`

Updates company details and highlight status.

### POST `/admin/offers`

Creates a new offer.

### PUT `/admin/offers/:id`

Updates an offer or disables it.

### POST `/admin/member-content`

Publishes exclusive content.

## 11. Error Handling Patterns

### Validation Error `400`

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

### Unauthorized `401`

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required.",
    "details": []
  }
}
```

### Forbidden `403`

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Your plan does not allow access to this resource.",
    "details": []
  }
}
```

### Conflict `409`

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "A user with this email already exists.",
    "details": []
  }
}
```

### Not Found `404`

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found.",
    "details": []
  }
}
```

### Rate Limited `429`

```json
{
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Please try again later.",
    "details": []
  }
}
```

### Server Error `500`

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Unexpected server error.",
    "details": []
  }
}
```

## 12. Rate Limiting Notes

Recommended limits with `express-rate-limit`:

- `/api/auth/register`: 5 requests / 15 minutes / IP
- `/api/auth/login`: 10 requests / 15 minutes / IP
- `/api/auth/refresh`: 20 requests / 15 minutes / IP
- public metadata endpoints: 60 requests / minute / IP
- authenticated read endpoints: 120 requests / minute / user or IP

Additional notes:

- use a stricter limiter on failed login bursts
- return consistent `429 RATE_LIMITED` payloads
- log rate-limit events for abuse visibility

## 13. Response Design Recommendations

- include `whatsapp_url` in company responses to reduce frontend logic duplication
- include normalized plan flags like `is_premium`
- keep dashboard endpoint aggregated for speed
- never leak hidden premium resources to basic users, even partially
- return server-generated slugs and IDs so the frontend never guesses identifiers