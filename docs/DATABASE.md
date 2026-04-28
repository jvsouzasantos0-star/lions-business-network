# Lions Business Network Database Design

## 1. SQLite Schema

The schema below supports registration, authentication, companies, offers, members-only content, premium gating, and session tracking for JWT-based login flows.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    price_cents INTEGER NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
    billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
    benefits_json TEXT NOT NULL DEFAULT '[]',
    is_premium INTEGER NOT NULL DEFAULT 0 CHECK (is_premium IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    plan_id INTEGER NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    last_login_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES plans(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    category_id INTEGER NOT NULL,
    description TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
    logo_url TEXT,
    website_url TEXT,
    is_company_of_week INTEGER NOT NULL DEFAULT 0 CHECK (is_company_of_week IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    featured_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS offers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    discount_percent INTEGER CHECK (discount_percent BETWEEN 0 AND 100),
    promo_code TEXT,
    starts_at TEXT NOT NULL,
    expiry_date TEXT NOT NULL,
    is_premium_only INTEGER NOT NULL DEFAULT 0 CHECK (is_premium_only IN (0, 1)),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member_contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    body_html TEXT NOT NULL,
    access_level TEXT NOT NULL CHECK (access_level IN ('members', 'premium')),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
    published_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_jti TEXT NOT NULL UNIQUE,
    refresh_token_hash TEXT,
    expires_at TEXT NOT NULL,
    revoked_at TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
```

## 2. Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan_id ON users(plan_id);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

CREATE INDEX IF NOT EXISTS idx_companies_category_id ON companies(category_id);
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);
CREATE INDEX IF NOT EXISTS idx_companies_company_of_week ON companies(is_company_of_week);
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

CREATE INDEX IF NOT EXISTS idx_offers_company_id ON offers(company_id);
CREATE INDEX IF NOT EXISTS idx_offers_expiry_date ON offers(expiry_date);
CREATE INDEX IF NOT EXISTS idx_offers_is_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_premium_only ON offers(is_premium_only);

CREATE INDEX IF NOT EXISTS idx_member_contents_access_level ON member_contents(access_level);
CREATE INDEX IF NOT EXISTS idx_member_contents_is_active ON member_contents(is_active);
CREATE INDEX IF NOT EXISTS idx_member_contents_slug ON member_contents(slug);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_revoked_at ON auth_sessions(revoked_at);
```

## 3. Constraints and Integrity Notes

- `users.email` must be unique
- `plans.slug` must be unique and maps directly to registration selection
- `categories.slug`, `companies.slug`, and `member_contents.slug` are unique for stable frontend routing
- `discount_percent` fields are constrained between 0 and 100
- `role`, `status`, `billing_cycle`, and `access_level` are restricted with `CHECK` constraints
- company deletion cascades to offers
- plan deletion is restricted while users are assigned to it
- session deletion cascades from user deletion

## 4. Seed Data

### Plans

```sql
INSERT INTO plans (id, slug, name, price_cents, billing_cycle, benefits_json, is_premium)
VALUES
    (1, 'basic', 'Plano Basic', 9900, 'monthly', '["Acesso à rede de parceiros","Visualização de empresas","Ofertas padrão","Área exclusiva para membros"]', 0),
    (2, 'premium', 'Plano Premium', 19900, 'monthly', '["Todos os benefícios do Basic","Ofertas premium","Benefícios exclusivos","Maior destaque no ecossistema"]', 1);
```

### Categories

```sql
INSERT INTO categories (id, name, slug, sort_order)
VALUES
    (1, 'Marketing', 'marketing', 1),
    (2, 'Tecnologia', 'tecnologia', 2),
    (3, 'Saúde', 'saude', 3),
    (4, 'Finanças', 'financas', 4),
    (5, 'Educação', 'educacao', 5);
```

### Users

The password hashes below are placeholders and should be replaced during real seeding with bcrypt-generated values.

```sql
INSERT INTO users (id, full_name, email, password_hash, plan_id, role, status, last_login_at)
VALUES
    (1, 'Marina Costa', 'marina@lionsnetwork.com', '$2b$10$replace_with_bcrypt_hash_basic', 1, 'member', 'active', CURRENT_TIMESTAMP),
    (2, 'Rafael Mendes', 'rafael@lionsnetwork.com', '$2b$10$replace_with_bcrypt_hash_premium', 2, 'member', 'active', CURRENT_TIMESTAMP);
```

### Companies

```sql
INSERT INTO companies (
    id, name, slug, category_id, description, phone, whatsapp_number, discount_percent,
    logo_url, website_url, is_company_of_week, is_active, featured_order
)
VALUES
    (1, 'Neon Growth Studio', 'neon-growth-studio', 1, 'Agência focada em crescimento digital, branding premium e performance comercial.', '+55 11 4000-1001', '5511991001001', 15, '/assets/logos/neon-growth-studio.png', 'https://neongrowth.example.com', 1, 1, 1),
    (2, 'LionTech Systems', 'liontech-systems', 2, 'Soluções em automação, sites institucionais e integrações sob medida.', '+55 11 4000-1002', '5511991001002', 12, '/assets/logos/liontech-systems.png', 'https://liontech.example.com', 0, 1, 2),
    (3, 'Prime Health Club', 'prime-health-club', 3, 'Rede de benefícios corporativos em saúde, bem-estar e atendimento premium.', '+55 11 4000-1003', '5511991001003', 20, '/assets/logos/prime-health-club.png', 'https://primehealth.example.com', 0, 1, 3),
    (4, 'Atlas Capital Advisory', 'atlas-capital-advisory', 4, 'Consultoria financeira para expansão, crédito empresarial e gestão de caixa.', '+55 11 4000-1004', '5511991001004', 10, '/assets/logos/atlas-capital-advisory.png', 'https://atlascapital.example.com', 0, 1, 4),
    (5, 'Future Leaders Academy', 'future-leaders-academy', 5, 'Treinamentos em liderança comercial, networking e aceleração empresarial.', '+55 11 4000-1005', '5511991001005', 18, '/assets/logos/future-leaders-academy.png', 'https://futureleaders.example.com', 0, 1, 5);
```

### Offers

```sql
INSERT INTO offers (
    id, company_id, title, description, discount_percent, promo_code, starts_at, expiry_date, is_premium_only, is_active
)
VALUES
    (1, 1, 'Pacote Branding Executivo', '15% off em pacote de branding com diagnóstico comercial.', 15, 'LIONS15', '2026-05-01 00:00:00', '2026-06-30 23:59:59', 0, 1),
    (2, 2, 'Landing Page Premium', 'Condição especial para criação de landing page com integração de leads.', 12, 'PARTNER12', '2026-05-01 00:00:00', '2026-07-15 23:59:59', 0, 1),
    (3, 3, 'Check-up Empresarial VIP', '20% de desconto em programa de saúde corporativa para equipes.', 20, 'VIPCARE20', '2026-05-01 00:00:00', '2026-08-01 23:59:59', 1, 1),
    (4, 4, 'Diagnóstico Financeiro Estratégico', 'Primeira sessão com condições exclusivas para membros da rede.', 10, 'ATLAS10', '2026-05-01 00:00:00', '2026-07-01 23:59:59', 0, 1),
    (5, 5, 'Mentoria de Networking e Vendas', 'Turma especial com 18% de desconto para associados.', 18, 'LEAD18', '2026-05-01 00:00:00', '2026-09-30 23:59:59', 1, 1);
```

### Member Contents

```sql
INSERT INTO member_contents (
    id, title, slug, summary, body_html, access_level, is_active, published_at
)
VALUES
    (1, 'Guia de Parcerias Estratégicas', 'guia-parcerias-estrategicas', 'Passos práticos para criar parcerias lucrativas dentro da rede.', '<h2>Guia</h2><p>Conteúdo exclusivo para membros sobre construção de parcerias.</p>', 'members', 1, CURRENT_TIMESTAMP),
    (2, 'Playbook Premium de Vendas B2B', 'playbook-premium-vendas-b2b', 'Framework exclusivo para premium acelerar receita com parceiros.', '<h2>Playbook</h2><p>Conteúdo premium com estratégias avançadas de vendas.</p>', 'premium', 1, CURRENT_TIMESTAMP);
```

### Auth Sessions

Seed sessions are optional in development and usually should not be preloaded. Example structure:

```sql
INSERT INTO auth_sessions (
    user_id, token_jti, refresh_token_hash, expires_at, revoked_at, ip_address, user_agent
)
VALUES
    (1, 'seed-jti-basic-001', 'seed-refresh-hash-basic', '2026-06-01 00:00:00', NULL, '127.0.0.1', 'Seed Script'),
    (2, 'seed-jti-premium-001', 'seed-refresh-hash-premium', '2026-06-01 00:00:00', NULL, '127.0.0.1', 'Seed Script');
```

## 5. Suggested Query Patterns

### Dashboard Featured Company

```sql
SELECT c.*, cat.name AS category_name, cat.slug AS category_slug
FROM companies c
JOIN categories cat ON cat.id = c.category_id
WHERE c.is_active = 1
ORDER BY c.is_company_of_week DESC, c.featured_order ASC, c.name ASC
LIMIT 1;
```

### Companies by Category

```sql
SELECT c.*, cat.name AS category_name, cat.slug AS category_slug
FROM companies c
JOIN categories cat ON cat.id = c.category_id
WHERE c.is_active = 1
  AND (? IS NULL OR cat.slug = ?)
ORDER BY c.is_company_of_week DESC, c.featured_order ASC, c.name ASC;
```

### Visible Offers by User Plan

```sql
SELECT o.*, c.name AS company_name, c.logo_url, c.whatsapp_number
FROM offers o
JOIN companies c ON c.id = o.company_id
WHERE o.is_active = 1
  AND c.is_active = 1
  AND datetime(o.expiry_date) >= datetime('now')
  AND (? = 1 OR o.is_premium_only = 0)
ORDER BY datetime(o.expiry_date) ASC, o.title ASC;
```

### Visible Member Content by Access Level

```sql
SELECT *
FROM member_contents
WHERE is_active = 1
  AND (
    access_level = 'members'
    OR (? = 1 AND access_level = 'premium')
  )
ORDER BY datetime(published_at) DESC;
```

## 6. Migration Notes

- keep DDL in versioned SQL files under `server/src/db/migrations/`
- run migrations at app startup in development, or through a dedicated script in production
- keep seed SQL separate from schema DDL
- use UTC timestamps consistently