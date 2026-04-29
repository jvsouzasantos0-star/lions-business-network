import { request } from '../api.js';
import { auth } from '../auth.js';
import { requireAuth } from '../guards.js';
import {
  emptyStateMarkup,
  escapeHtml,
  renderBottomNav,
  renderTopbar,
  setPageTitle
} from '../ui.js';

setPageTitle('Lions Business Network');

const heroContainer = document.querySelector('#dashboard-hero');

const whatsappIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" width="18" height="18">
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.6 2 2.17 6.42 2.17 11.86c0 1.74.46 3.43 1.33 4.92L2 22l5.37-1.41a9.83 9.83 0 0 0 4.67 1.19h.01c5.43 0 9.86-4.42 9.86-9.86a9.8 9.8 0 0 0-2.86-7.01Zm-7.02 15.2h-.01a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3.19.84.85-3.11-.2-.32a8.15 8.15 0 0 1-1.25-4.34c0-4.5 3.66-8.17 8.18-8.17 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.78c0 4.5-3.67 8.16-8.16 8.16Zm4.48-6.1c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.17-.71-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.74-1.79-.2-.48-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.68 2.56 4.06 3.59.57.24 1.01.39 1.36.5.57.18 1.08.16 1.49.1.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z"/>
  </svg>
`;

const renderHero = (dashboard, user) => {
  const company = dashboard.company_of_the_week;
  const firstName = user?.full_name?.split(' ')[0] || 'Associado';

  if (!company) {
    heroContainer.innerHTML = `
      <div class="home-hero">
        <div class="home-greeting">
          <p class="home-greeting__eyebrow">Bem-vindo de volta</p>
          <h1 class="home-greeting__name">Olá, ${escapeHtml(firstName)}</h1>
        </div>
        <div class="glass-card" style="padding:24px;">
          ${emptyStateMarkup('Nenhuma empresa em destaque', 'O administrador ainda não definiu a empresa da semana.')}
        </div>
        <div class="home-actions">
          <a class="button button--full" href="/empresas.html">Explorar empresas</a>
          <a class="button button--ghost button--full" href="/ofertas.html">Ver ofertas</a>
        </div>
      </div>
    `;
    return;
  }

  heroContainer.innerHTML = `
    <div class="home-hero">
      <div class="home-greeting">
        <p class="home-greeting__eyebrow">Bem-vindo de volta</p>
        <h1 class="home-greeting__name">Olá,<br>${escapeHtml(firstName)}</h1>
      </div>

      <article class="glass-card glass-card--glow featured-card">
        <div class="featured-card__header">
          <span class="eyebrow">Empresa da Semana</span>
          <span class="discount-tag">${escapeHtml(company.discount_percent)}% OFF</span>
        </div>
        <div class="logo-lockup">
          <div class="logo-shell">
            <img src="${escapeHtml(company.logo_url)}" alt="${escapeHtml(company.name)}">
          </div>
          <div>
            <p class="company-category">${escapeHtml(company.category?.name || '')}</p>
            <h2 class="company-name">${escapeHtml(company.name)}</h2>
          </div>
        </div>
        <p class="company-description">${escapeHtml(company.description || '')}</p>
        <div class="button-row">
          <a class="button" href="/empresa.html?id=${escapeHtml(company.id)}">Ver perfil</a>
          <a class="button button--whatsapp" href="${escapeHtml(company.whatsapp_url)}" target="_blank" rel="noreferrer" aria-label="WhatsApp ${escapeHtml(company.name)}">
            ${whatsappIcon} WhatsApp
          </a>
        </div>
      </article>

      <div class="home-actions">
        <a class="button button--ghost button--full" href="/empresas.html">Explorar empresas</a>
        <a class="button button--ghost button--full" href="/ofertas.html">Ver ofertas</a>
      </div>
    </div>
  `;
};

const init = async () => {
  if (!requireAuth()) {
    return;
  }

  heroContainer.innerHTML = '<div class="loading-state glass-card">Carregando...</div>';

  try {
    const [user, dashboard] = await Promise.all([
      auth.ensureCurrentUser(),
      request('/dashboard', { auth: true })
    ]);

    renderBottomNav(document.querySelector('#bottom-nav'), 'home', { isAdmin: user?.role === 'admin' });

    renderTopbar(document.querySelector('#topbar'), {
      user,
      pageLabel: 'Home'
    });

    renderHero(dashboard, user);
  } catch (error) {
    heroContainer.innerHTML = '<div class="loading-state glass-card">Erro ao carregar. Tente novamente.</div>';
  }
};

init();
