const { hashPasswordSync } = require('../../utils/password');

const categories = [
  { name: 'Marketing', slug: 'marketing', sort_order: 1 },
  { name: 'Tecnologia', slug: 'tecnologia', sort_order: 2 },
  { name: 'Saúde', slug: 'saude', sort_order: 3 },
  { name: 'Finanças', slug: 'financas', sort_order: 4 },
  { name: 'Educação', slug: 'educacao', sort_order: 5 }
];

const planBenefits = JSON.stringify([
  'Acesso à rede de parceiros',
  'Visualização de empresas',
  'Todas as ofertas da rede',
  'Área exclusiva para membros',
  'Conteúdos de networking e vendas'
]);

const seedDatabase = async (db) => {
  const result = await db.queryOne('SELECT COUNT(*) AS count FROM plans');
  if (Number(result.count) > 0) {
    return;
  }

  const adminPasswordHash = hashPasswordSync('Admin123456');

  const plan = await db.queryOne(
    `INSERT INTO plans (slug, name, price_cents, billing_cycle, benefits_json, is_premium)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    ['member', 'Membro Lions', 0, 'monthly', planBenefits, false]
  );

  for (const cat of categories) {
    await db.run(
      'INSERT INTO categories (name, slug, sort_order) VALUES ($1, $2, $3)',
      [cat.name, cat.slug, cat.sort_order]
    );
  }

  await db.run(
    `INSERT INTO users (full_name, email, password_hash, plan_id, role, status, last_login_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    ['Administrador Lions', 'admin@lionsbusiness.com', adminPasswordHash, plan.id, 'admin', 'active']
  );
};

module.exports = {
  seedDatabase
};
