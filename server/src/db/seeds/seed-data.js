const { hashPasswordSync } = require('../../utils/password');

const plans = [
  {
    id: 1,
    slug: 'member',
    name: 'Membro Lions',
    price_cents: 0,
    billing_cycle: 'monthly',
    benefits_json: JSON.stringify([
      'Acesso à rede de parceiros',
      'Visualização de empresas',
      'Todas as ofertas da rede',
      'Área exclusiva para membros',
      'Conteúdos de networking e vendas'
    ]),
    is_premium: 0
  }
];

const categories = [
  { id: 1, name: 'Marketing', slug: 'marketing', sort_order: 1 },
  { id: 2, name: 'Tecnologia', slug: 'tecnologia', sort_order: 2 },
  { id: 3, name: 'Saúde', slug: 'saude', sort_order: 3 },
  { id: 4, name: 'Finanças', slug: 'financas', sort_order: 4 },
  { id: 5, name: 'Educação', slug: 'educacao', sort_order: 5 }
];

const companies = [
  {
    id: 1,
    name: 'Neon Growth Studio',
    slug: 'neon-growth-studio',
    category_id: 1,
    description: 'Agência focada em crescimento digital, branding premium e performance comercial.',
    phone: '+55 11 4000-1001',
    whatsapp_number: '5511991001001',
    discount_percent: 15,
    logo_url: '/assets/logos/neon-growth-studio.svg',
    website_url: 'https://neongrowth.example.com',
    is_company_of_week: 1,
    is_active: 1,
    featured_order: 1
  },
  {
    id: 2,
    name: 'LionTech Systems',
    slug: 'liontech-systems',
    category_id: 2,
    description: 'Soluções em automação, sites institucionais e integrações sob medida.',
    phone: '+55 11 4000-1002',
    whatsapp_number: '5511991001002',
    discount_percent: 12,
    logo_url: '/assets/logos/liontech-systems.svg',
    website_url: 'https://liontech.example.com',
    is_company_of_week: 0,
    is_active: 1,
    featured_order: 2
  },
  {
    id: 3,
    name: 'Prime Health Club',
    slug: 'prime-health-club',
    category_id: 3,
    description: 'Rede de benefícios corporativos em saúde, bem-estar e atendimento premium.',
    phone: '+55 11 4000-1003',
    whatsapp_number: '5511991001003',
    discount_percent: 20,
    logo_url: '/assets/logos/prime-health-club.svg',
    website_url: 'https://primehealth.example.com',
    is_company_of_week: 0,
    is_active: 1,
    featured_order: 3
  },
  {
    id: 4,
    name: 'Atlas Capital Advisory',
    slug: 'atlas-capital-advisory',
    category_id: 4,
    description: 'Consultoria financeira para expansão, crédito empresarial e gestão de caixa.',
    phone: '+55 11 4000-1004',
    whatsapp_number: '5511991001004',
    discount_percent: 10,
    logo_url: '/assets/logos/atlas-capital-advisory.svg',
    website_url: 'https://atlascapital.example.com',
    is_company_of_week: 0,
    is_active: 1,
    featured_order: 4
  },
  {
    id: 5,
    name: 'Future Leaders Academy',
    slug: 'future-leaders-academy',
    category_id: 5,
    description: 'Treinamentos em liderança comercial, networking e aceleração empresarial.',
    phone: '+55 11 4000-1005',
    whatsapp_number: '5511991001005',
    discount_percent: 18,
    logo_url: '/assets/logos/future-leaders-academy.svg',
    website_url: 'https://futureleaders.example.com',
    is_company_of_week: 0,
    is_active: 1,
    featured_order: 5
  }
];

const offers = [
  {
    id: 1,
    company_id: 1,
    title: 'Pacote Branding Executivo',
    description: '15% off em pacote de branding com diagnóstico comercial.',
    discount_percent: 15,
    promo_code: 'LIONS15',
    starts_at: '2026-04-01 00:00:00',
    expiry_date: '2026-06-30 23:59:59',
    is_premium_only: 0,
    is_active: 1
  },
  {
    id: 2,
    company_id: 2,
    title: 'Landing Page Premium',
    description: 'Condição especial para criação de landing page com integração de leads.',
    discount_percent: 12,
    promo_code: 'PARTNER12',
    starts_at: '2026-04-01 00:00:00',
    expiry_date: '2026-07-15 23:59:59',
    is_premium_only: 0,
    is_active: 1
  },
  {
    id: 3,
    company_id: 3,
    title: 'Check-up Empresarial VIP',
    description: '20% de desconto em programa de saúde corporativa para equipes.',
    discount_percent: 20,
    promo_code: 'VIPCARE20',
    starts_at: '2026-04-01 00:00:00',
    expiry_date: '2026-08-01 23:59:59',
    is_premium_only: 0,
    is_active: 1
  },
  {
    id: 4,
    company_id: 4,
    title: 'Diagnóstico Financeiro Estratégico',
    description: 'Primeira sessão com condições exclusivas para membros da rede.',
    discount_percent: 10,
    promo_code: 'ATLAS10',
    starts_at: '2026-04-01 00:00:00',
    expiry_date: '2026-07-01 23:59:59',
    is_premium_only: 0,
    is_active: 1
  },
  {
    id: 5,
    company_id: 5,
    title: 'Mentoria de Networking e Vendas',
    description: 'Turma especial com 18% de desconto para associados.',
    discount_percent: 18,
    promo_code: 'LEAD18',
    starts_at: '2026-04-01 00:00:00',
    expiry_date: '2026-09-30 23:59:59',
    is_premium_only: 0,
    is_active: 1
  }
];

const memberContents = [
  {
    id: 1,
    title: 'Guia de Parcerias Estratégicas',
    slug: 'guia-parcerias-estrategicas',
    summary: 'Passos práticos para criar parcerias lucrativas dentro da rede.',
    body_html: '<h2>Guia</h2><p>Conteúdo exclusivo para membros sobre construção de parcerias.</p>',
    access_level: 'members',
    is_active: 1
  },
  {
    id: 2,
    title: 'Playbook de Vendas B2B',
    slug: 'playbook-vendas-b2b',
    summary: 'Framework para acelerar receita com parceiros da rede.',
    body_html: '<h2>Playbook</h2><p>Estratégias avançadas de vendas para membros da rede Lions.</p>',
    access_level: 'members',
    is_active: 1
  }
];

const seedDatabase = (db) => {
  const planCount = db.prepare('SELECT COUNT(*) AS count FROM plans').get().count;
  if (planCount > 0) {
    return;
  }

  const memberPasswordHash = hashPasswordSync('StrongPass123!');

  const insertPlan = db.prepare(`
    INSERT INTO plans (id, slug, name, price_cents, billing_cycle, benefits_json, is_premium)
    VALUES (@id, @slug, @name, @price_cents, @billing_cycle, @benefits_json, @is_premium)
  `);
  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, slug, sort_order)
    VALUES (@id, @name, @slug, @sort_order)
  `);
  const insertUser = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, plan_id, role, status, last_login_at)
    VALUES (@id, @full_name, @email, @password_hash, @plan_id, @role, @status, CURRENT_TIMESTAMP)
  `);
  const insertCompany = db.prepare(`
    INSERT INTO companies (
      id, name, slug, category_id, description, phone, whatsapp_number, discount_percent,
      logo_url, website_url, is_company_of_week, is_active, featured_order
    ) VALUES (
      @id, @name, @slug, @category_id, @description, @phone, @whatsapp_number, @discount_percent,
      @logo_url, @website_url, @is_company_of_week, @is_active, @featured_order
    )
  `);
  const insertOffer = db.prepare(`
    INSERT INTO offers (
      id, company_id, title, description, discount_percent, promo_code, starts_at, expiry_date, is_premium_only, is_active
    ) VALUES (
      @id, @company_id, @title, @description, @discount_percent, @promo_code, @starts_at, @expiry_date, @is_premium_only, @is_active
    )
  `);
  const insertContent = db.prepare(`
    INSERT INTO member_contents (
      id, title, slug, summary, body_html, access_level, is_active, published_at
    ) VALUES (
      @id, @title, @slug, @summary, @body_html, @access_level, @is_active, CURRENT_TIMESTAMP
    )
  `);

  const insertAll = db.transaction(() => {
    plans.forEach((plan) => insertPlan.run(plan));
    categories.forEach((category) => insertCategory.run(category));
    insertUser.run({
      id: 1,
      full_name: 'Marina Costa',
      email: 'marina@lionsnetwork.com',
      password_hash: memberPasswordHash,
      plan_id: 1,
      role: 'member',
      status: 'active'
    });
    insertUser.run({
      id: 2,
      full_name: 'Rafael Mendes',
      email: 'rafael@lionsnetwork.com',
      password_hash: memberPasswordHash,
      plan_id: 1,
      role: 'admin',
      status: 'active'
    });
    companies.forEach((company) => insertCompany.run(company));
    offers.forEach((offer) => insertOffer.run(offer));
    memberContents.forEach((content) => insertContent.run(content));
  });

  insertAll();
};

module.exports = {
  seedDatabase
};