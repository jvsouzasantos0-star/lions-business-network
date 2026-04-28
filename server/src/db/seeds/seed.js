const { initializeDatabase } = require('../../config/db');

const run = async () => {
  await initializeDatabase();
  process.stdout.write('Database initialized and seeded.\n');
};

run().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exit(1);
});