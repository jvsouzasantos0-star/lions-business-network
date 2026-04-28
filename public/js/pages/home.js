import { request } from '../api.js';
import { auth } from '../auth.js';
import { requireAuth } from '../guards.js';
import {
  companyCardMarkup,
  contentCardMarkup,
  emptyStateMarkup,
  offerCardMarkup,
  renderBottomNav,
  renderTopbar,
  setPageTitle
} from '../ui.js';

setPageTitle('Lions Business Network');

const heroContainer = document.querySelector('#dashboard-hero');
const categoriesContainer = document.querySelector('#dashboard-categories');
const companiesContainer = document.querySelector('#dashboard-companies');
const offersContainer = document.querySelector('#dashboard-offers');
const contentContainer = document.querySelector('#dashboard-content');

const renderHero = (dashboard) => {
  const company = dashboard.company_of_the_week;

  if (!company) {
    heroContainer.className = 'glass-card hero-card';
    heroContainer.innerHTML = emptyStateMarkup('Dashboard indisponível', 'Nenhuma empresa destaque foi definida ainda.');
    return;
  }

  heroContainer.className = 'glass-card hero-card';
  heroContainer.innerHTML = `
    <div class="hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Rede Lions Business Network</p>
        <h2 class="hero-title">Rede ativa para conexões de alto valor.</h2>
        <p class="hero-caption">Seu hub para descobrir empresas, ofertas relevantes e benefícios de networking com estética premium e foco comercial.</p>
        <div class="stats-grid">
          <article class="stat-card">
            <p class="stat-label">Plano atual</p>
            <p class="stat-value">${dashboard.membership_summary.plan_name}</p>
          </article>
          <article class="stat-card">
            <p class="stat-label">Benefícios liberados</p>
            <p class="stat-value">${dashboard.membership_summary.benefits_count}</p>
          </article>
        </div>
      </div>
      <div class="hero-side">
        <article class="highlight-card glass-card--glow">
          <div class="highlight-card__header">
            <span class="tag">Empresa da Semana</span>
            <span class="company-discount">${company.discount_percent}% OFF</span>
          </div>
          <div class="logo-lockup">
            <div class="logo-shell">
              <img src="${company.logo_url}" alt="${company.name}">
            </div>
            <div>
              <p class="company-category">${company.category.name}</p>
              <h3 class="company-name">${company.name}</h3>
            </div>
          </div>
          <p class="company-description">${company.description}</p>
          <div class="button-row">
            <a class="button" href="/empresa.html?id=${company.id}">Ver perfil</a>
            <a class="button button--whatsapp" href="${company.whatsapp_url}" target="_blank" rel="noreferrer" aria-label="Falar com ${company.name} no WhatsApp">WhatsApp</a>
          </div>
        </article>
      </div>
    </div>
  `;
};

const renderCategories = (categories, companies) => {
  let activeCategory = '';

  const paint = () => {
    categoriesContainer.innerHTML = `
      <button class="chip ${activeCategory === '' ? 'is-active' : ''}" data-category="">Todas</button>
      ${categories.map((category) => `
        <button class="chip ${activeCategory === category.slug ? 'is-active' : ''}" data-category="${category.slug}">
          ${category.name}
        </button>
      `).join('')}
    `;

    const visibleCompanies = activeCategory
      ? companies.filter((company) => company.category.slug === activeCategory)
      : companies;

    companiesContainer.innerHTML = visibleCompanies.length
      ? visibleCompanies.map(companyCardMarkup).join('')
      : emptyStateMarkup('Nenhuma empresa encontrada', 'Escolha outra categoria para ver mais parceiros.');

    companiesContainer.querySelectorAll('[data-company-id]').forEach((card) => {
      card.addEventListener('click', (event) => {
        if (event.target.closest('[data-stop-card="true"]')) {
          return;
        }

        window.location.href = `/empresa.html?id=${card.dataset.companyId}`;
      });
    });
  };

  categoriesContainer.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-category]');
    if (!chip) {
      return;
    }

    activeCategory = chip.dataset.category;
    paint();
  });

  paint();
};

const init = async () => {
  if (!requireAuth()) {
    return;
  }

  renderBottomNav(document.querySelector('#bottom-nav'), 'home');

  try {
    const [user, dashboard] = await Promise.all([
      auth.ensureCurrentUser(),
      request('/dashboard', { auth: true })
    ]);

    renderTopbar(document.querySelector('#topbar'), {
      user,
      pageLabel: 'Dashboard'
    });

    renderHero(dashboard);
    renderCategories(dashboard.categories, dashboard.featured_companies);

    offersContainer.innerHTML = dashboard.latest_offers.length
      ? dashboard.latest_offers.map(offerCardMarkup).join('')
      : emptyStateMarkup('Sem ofertas no momento', 'Novas promoções aparecerão aqui quando estiverem ativas.');

    contentContainer.innerHTML = dashboard.member_highlights.length
      ? dashboard.member_highlights.map(contentCardMarkup).join('')
      : emptyStateMarkup('Sem conteúdos disponíveis', 'Novos conteúdos para membros aparecerão aqui em breve.');
  } catch (error) {
    heroContainer.className = 'glass-card hero-card';
    heroContainer.innerHTML = emptyStateMarkup('Erro ao carregar dashboard', error.message || 'Tente novamente em instantes.');
    companiesContainer.innerHTML = '';
    offersContainer.innerHTML = '';
    contentContainer.innerHTML = '';
  }
};

init();