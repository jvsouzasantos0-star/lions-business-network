const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const env = require('./env');
const { seedDatabase } = require('../db/seeds/seed-data');

let pool = null;

const runMigrations = async () => {
  const migrationsDir = path.resolve(__dirname, '../db/migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    await pool.query(sql);
  }
};

const initializeDatabase = async () => {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: env.databaseUrl,
    ssl: env.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
  });

  await pool.query('SELECT 1');
  await runMigrations();
  await seedDatabase(getDb());

  return pool;
};

const getDb = () => {
  if (!pool) {
    throw new Error('Database has not been initialized. Call initializeDatabase() first.');
  }

  return {
    async query(sql, params = []) {
      const result = await pool.query(sql, params);
      return result.rows;
    },

    async queryOne(sql, params = []) {
      const result = await pool.query(sql, params);
      return result.rows[0] || null;
    },

    async run(sql, params = []) {
      let finalSql = sql.trim().replace(/;\s*$/, '');
      const isInsert = /^INSERT\s/i.test(finalSql);
      if (isInsert && !/RETURNING/i.test(finalSql)) {
        finalSql += ' RETURNING id';
      }
      const result = await pool.query(finalSql, params);
      return {
        lastInsertRowid: result.rows[0]?.id ?? null,
        changes: result.rowCount
      };
    },

    async exec(sql) {
      await pool.query(sql);
    }
  };
};

module.exports = {
  initializeDatabase,
  getDb
};
