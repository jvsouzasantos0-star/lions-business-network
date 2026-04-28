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

const seedDatabase = (db) => {
  const planCount = db.prepare('SELECT COUNT(*) AS count FROM plans').get().count;
  if (planCount > 0) {
    return;
  }

  const adminPasswordHash = hashPasswordSync('Admin2026!');

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

  const insertAll = db.transaction(() => {
    plans.forEach((plan) => insertPlan.run(plan));
    categories.forEach((category) => insertCategory.run(category));
    insertUser.run({
      id: 1,
      full_name: 'Administrador Lions',
      email: 'admin@lionsbusiness.com',
      password_hash: adminPasswordHash,
      plan_id: 1,
      role: 'admin',
      status: 'active'
    });
  });

  insertAll();
};

module.exports = {
  seedDatabase
};
