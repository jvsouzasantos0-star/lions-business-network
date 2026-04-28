import { request } from '../api.js';
import { auth } from '../auth.js';
import { requireAuth } from '../guards.js';
import {
  emptyStateMarkup,
  offerCardMarkup,
  renderBottomNav,
  renderTopbar,
  setPageTitle
} from '../ui.js';

setPageTitle('Empresa | Lions Business Network');

const detailContainer = document.querySelector('#company-detail');
const offersContainer = document.querySelector('#company-offers');

const renderDetail = (company) => {
  detailContainer.className = 'glass-card detail-card';
  detailContainer.innerHTML = `
    <div class="detail-hero">
      <div class="detail-logo">
        <img src="${company.logo_url}" alt="${company.name}">
      </div>
      <div class="detail-copy">
        <div class="company-meta">
          <span class="tag">${company.category.name}</span>
          ${company.is_company_of_week ? '<span class="premium-badge">Empresa da semana</span>' : ''}
          <span class="company-discount">${company.discount_percent}% OFF</span>
        </div>
        <h1>${company.name}</h1>
        <p>${company.description}</p>
        <div class="contact-row">
          <span class="tag">${company.phone}</span>
          ${company.website_url ? `<a class="tag" href="${company.website_url}" target="_blank" rel="noreferrer">Site oficial</a>` : ''}
        </div>
        <div class="button-row">
          <a class="button" href="${company.whatsapp_url}" target="_blank" rel="noreferrer">Falar no WhatsApp</a>
          <a class="button button--ghost" href="/empresas.html">Voltar ao diretório</a>
        </div>
      </div>
    </div>
  `;
};

const init = async () => {
  if (!requireAuth()) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const companyId = params.get('id');

  if (!companyId) {
    detailContainer.className = 'glass-card detail-card';
    detailContainer.innerHTML = emptyStateMarkup('Empresa não informada', 'Volte ao diretório e selecione uma empresa.');
    return;
  }

  try {
    const [user, company, offers] = await Promise.all([
      auth.ensureCurrentUser(),
      request(`/companies/${companyId}`, { auth: true }),
      request(`/offers?company_id=${companyId}`, { auth: true })
    ]);

    renderBottomNav(document.querySelector('#bottom-nav'), 'companies', { isAdmin: user?.role === 'admin' });

    renderTopbar(document.querySelector('#topbar'), {
      user,
      pageLabel: 'Perfil empresarial'
    });

    renderDetail(company);

    offersContainer.innerHTML = offers.length
      ? offers.map(offerCardMarkup).join('')
      : emptyStateMarkup('Sem ofertas ativas', 'Esta empresa não possui promoções ativas agora.');
  } catch (error) {
    detailContainer.className = 'glass-card detail-card';
    detailContainer.innerHTML = emptyStateMarkup('Erro ao carregar empresa', error.message || 'Tente novamente mais tarde.');
    offersContainer.innerHTML = '';
  }
};

init();