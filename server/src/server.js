const app = require('./app');
const env = require('./config/env');
const { initializeDatabase } = require('./config/db');

const start = async () => {
  await initializeDatabase();

  app.listen(env.port, () => {
    process.stdout.write(`Lions Business Network server running on port ${env.port}\n`);
  });
};

start().catch((error) => {
  process.stderr.write(`${error.stack}\n`);
  process.exit(1);
});