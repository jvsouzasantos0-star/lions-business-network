import { request } from '../api.js';
import { requireAdmin } from '../guards.js';
import { escapeHtml, formatDate, setPageTitle } from '../ui.js';
import { renderAdminNav, renderAdminTopbar } from '../admin-ui.js';

setPageTitle('Admin | Lions Business Network');

const statsGrid = document.querySelector('#stats-grid');
const recentCompanies = document.querySelector('#recent-companies');
const recentOffers = document.querySelector('#recent-offers');

const renderStats = (stats) => {
  statsGrid.innerHTML = `
    <div class="admin-stat-card">
      <p class="admin-stat-label">Total empresas</p>
      <p class="admin-stat-value">${stats.totalCompanies ?? 0}</p>
    </div>
    <div class="admin-stat-card">
      <p class="admin-stat-label">Empresas ativas</p>
      <p class="admin-stat-value">${stats.activeCompanies ?? 0}</p>
    </div>
    <div class="admin-stat-card">
      <p class="admin-stat-label">Total ofertas</p>
      <p class="admin-stat-value">${stats.totalOffers ?? 0}</p>
    </div>
    <div class="admin-stat-card">
      <p class="admin-stat-label">Ofertas ativas</p>
      <p class="admin-stat-value">${stats.activeOffers ?? 0}</p>
    </div>
    <div class="admin-stat-card">
      <p class="admin-stat-label">Total membros</p>
      <p class="admin-stat-value">${stats.totalMembers ?? 0}</p>
    </div>
  `;
};

const renderRecentCompanies = (companies) => {
  const recent = companies.slice(0, 5);
  if (!recent.length) {
    recentCompanies.innerHTML = '<p class="muted" style="padding:12px">Nenhuma empresa cadastrada.</p>';
    return;
  }

  recentCompanies.innerHTML = recent.map((c) => `
    <a class="admin-recent-item" href="/admin-empresa-form.html?id=${c.id}">
      <span class="admin-recent-item__name">${escapeHtml(c.name)}</span>
      <span class="badge badge--${c.status === 'active' ? 'active' : 'inactive'}">${c.status === 'active' ? 'Ativa' : 'Inativa'}</span>
    </a>
  `).join('');
};

const renderRecentOffers = (offers) => {
  const recent = offers.slice(0, 5);
  if (!recent.length) {
    recentOffers.innerHTML = '<p class="muted" style="padding:12px">Nenhuma oferta cadastrada.</p>';
    return;
  }

  recentOffers.innerHTML = recent.map((o) => `
    <a class="admin-recent-item" href="/admin-oferta-form.html?id=${o.id}">
      <span class="admin-recent-item__name">${escapeHtml(o.title)}</span>
      <span class="admin-recent-item__meta">${o.expiry_date ? formatDate(o.expiry_date) : 'Sem validade'}</span>
    </a>
  `).join('');
};

const init = async () => {
  const ok = await requireAdmin();
  if (!ok) return;

  renderAdminTopbar(document.querySelector('#admin-topbar'), 'Dashboard Admin');
  renderAdminNav(document.querySelector('#admin-nav'), 'dashboard');

  try {
    const [stats, companies, offers] = await Promise.all([
      request('/admin/stats', { auth: true }),
      request('/admin/companies', { auth: true }),
      request('/admin/offers', { auth: true })
    ]);

    renderStats(stats);
    renderRecentCompanies(Array.isArray(companies) ? companies : []);
    renderRecentOffers(Array.isArray(offers) ? offers : []);
  } catch (error) {
    statsGrid.innerHTML = `<div class="loading-state glass-card" style="grid-column:1/-1">Erro ao carregar dados: ${escapeHtml(error.message)}</div>`;
  }
};

init();
