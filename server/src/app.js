const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const companiesRoutes = require('./routes/companies.routes');
const categoriesRoutes = require('./routes/categories.routes');
const offersRoutes = require('./routes/offers.routes');
const memberContentRoutes = require('./routes/member-content.routes');
const plansRoutes = require('./routes/plans.routes');
const metaRoutes = require('./routes/meta.routes');
const { publicLimiter, authReadLimiter } = require('./middlewares/rate-limit');
const { notFound } = require('./middlewares/not-found');
const { errorHandler } = require('./middlewares/error-handler');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/api/health', publicLimiter, (req, res) => {
  res.status(200).json({
    data: {
      status: 'ok'
    }
  });
});

app.use('/api/meta', publicLimiter, metaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authReadLimiter, dashboardRoutes);
app.use('/api/companies', authReadLimiter, companiesRoutes);
app.use('/api/categories', authReadLimiter, categoriesRoutes);
app.use('/api/offers', authReadLimiter, offersRoutes);
app.use('/api/member-content', authReadLimiter, memberContentRoutes);
app.use('/api/plans', plansRoutes);

app.use(express.static(env.publicDir, { extensions: ['html'] }));
app.get('/', (req, res) => {
  res.sendFile(path.join(env.publicDir, 'index.html'));
});

app.use('/api', notFound);
app.use(notFound);
app.use(errorHandler);

module.exports = app;