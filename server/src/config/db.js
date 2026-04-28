const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');
const env = require('./env');
const { seedDatabase } = require('../db/seeds/seed-data');

let dbInstance = null;
let sqlModulePromise = null;

const ensureDatabaseDirectory = () => {
  const directory = path.dirname(env.sqlitePath);
  fs.mkdirSync(directory, { recursive: true });
};

const loadSqlModule = async () => {
  if (!sqlModulePromise) {
    sqlModulePromise = initSqlJs({
      locateFile: (file) => path.resolve(__dirname, '../../node_modules/sql.js/dist', file)
    });
  }

  return sqlModulePromise;
};

const normalizeParams = (params) => {
  if (params === undefined) {
    return undefined;
  }

  if (Array.isArray(params)) {
    return params;
  }

  if (params !== null && typeof params === 'object') {
    return Object.fromEntries(
      Object.entries(params).map(([key, value]) => [
        key.startsWith(':') || key.startsWith('@') || key.startsWith('$') ? key : `@${key}`,
        value
      ])
    );
  }

  return [params];
};

const readRows = (statement) => {
  const rows = [];

  while (statement.step()) {
    rows.push(statement.getAsObject());
  }

  return rows;
};

const createStatement = (database, sql) => ({
  get(params) {
    const statement = database.prepare(sql);

    try {
      const normalizedParams = normalizeParams(params);
      if (normalizedParams !== undefined) {
        statement.bind(normalizedParams);
      }

      const rows = readRows(statement);
      return rows[0];
    } finally {
      statement.free();
    }
  },
  all(params) {
    const statement = database.prepare(sql);

    try {
      const normalizedParams = normalizeParams(params);
      if (normalizedParams !== undefined) {
        statement.bind(normalizedParams);
      }

      return readRows(statement);
    } finally {
      statement.free();
    }
  },
  run(params) {
    const statement = database.prepare(sql);

    try {
      const normalizedParams = normalizeParams(params);
      if (normalizedParams !== undefined) {
        statement.bind(normalizedParams);
      }

      statement.step();
      const lastInsertRowidResult = database.exec('SELECT last_insert_rowid() AS id');
      database.persist();

      return {
        lastInsertRowid: lastInsertRowidResult?.[0]?.values?.[0]?.[0] ?? 0
      };
    } finally {
      statement.free();
    }
  }
});

const createDatabaseAdapter = (database) => ({
  exec(sql) {
    database.exec(sql);
    database.persist();
  },
  pragma(sql) {
    try {
      database.exec(`PRAGMA ${sql}`);
    } catch (error) {
      if (!String(error.message || error).includes('Safety level may not be changed')) {
        throw error;
      }
    }
  },
  prepare(sql) {
    return createStatement(database, sql);
  },
  transaction(callback) {
    return (...args) => {
      try {
        const result = callback(...args);
        database.persist();
        return result;
      } catch (error) {
        throw error;
      }
    };
  }
});

const runMigrations = (db) => {
  const migrationsDir = path.resolve(__dirname, '../db/migrations');
  const files = fs.readdirSync(migrationsDir).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec(sql);
  }
};

const initializeDatabase = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  ensureDatabaseDirectory();
  const SQL = await loadSqlModule();
  const databaseBuffer = fs.existsSync(env.sqlitePath) ? fs.readFileSync(env.sqlitePath) : undefined;
  const sqliteDatabase = new SQL.Database(databaseBuffer);
  sqliteDatabase.persist = () => {
    const data = sqliteDatabase.export();
    fs.writeFileSync(env.sqlitePath, Buffer.from(data));
  };
  dbInstance = createDatabaseAdapter(sqliteDatabase);
  dbInstance.pragma('foreign_keys = ON');
  runMigrations(dbInstance);
  seedDatabase(dbInstance);
  sqliteDatabase.persist();

  return dbInstance;
};

const getDb = () => {
  if (!dbInstance) {
    throw new Error('Database has not been initialized. Call initializeDatabase() first.');
  }

  return dbInstance;
};

module.exports = {
  initializeDatabase,
  getDb
};