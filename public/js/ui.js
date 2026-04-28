const navItems = [
  {
    key: 'home',
    href: '/index.html',
    label: 'Home',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>'
  },
  {
    key: 'companies',
    href: '/empresas.html',
    label: 'Empresas',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21V6.5A1.5 1.5 0 0 1 5.5 5H14v16"/><path d="M14 9h4.5A1.5 1.5 0 0 1 20 10.5V21"/><path d="M8 9h2"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>'
  },
  {
    key: 'offers',
    href: '/ofertas.html',
    label: 'Ofertas',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 3H6.5A2.5 2.5 0 0 0 4 5.5V10l10 10 6-6L10 4Z"/><path d="M7.5 7.5h.01"/></svg>'
  },
  {
    key: 'plan',
    href: '/plano.html',
    label: 'Meu Plano',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>'
  }
];

const whatsappIcon = `
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.6 2 2.17 6.42 2.17 11.86c0 1.74.46 3.43 1.33 4.92L2 22l5.37-1.41a9.83 9.83 0 0 0 4.67 1.19h.01c5.43 0 9.86-4.42 9.86-9.86a9.8 9.8 0 0 0-2.86-7.01Zm-7.02 15.2h-.01a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-3.19.84.85-3.11-.2-.32a8.15 8.15 0 0 1-1.25-4.34c0-4.5 3.66-8.17 8.18-8.17 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.78c0 4.5-3.67 8.16-8.18 8.16Zm4.48-6.1c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.17-.71-.64-1.2-1.43-1.34-1.67-.14-.24-.01-.37.1-.49.1-.1.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.31-.74-1.79-.2-.48-.4-.41-.54-.42h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2 0 1.18.86 2.32.98 2.48.12.16 1.68 2.56 4.06 3.59.57.24 1.01.39 1.36.5.57.18 1.08.16 1.49.1.46-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z"/>
  </svg>
`;

export const setPageTitle = (value) => {
  document.title = value;
};

export const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

export const formatDate = (value) => {
  if (!value) {
    return 'Data não informada';
  }

  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

export const formatCurrency = (cents = 0) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format((cents || 0) / 100);
};

export const setStatus = (element, message = '', type = '') => {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = 'status';

  if (type) {
    element.classList.add(`status--${type}`);
  }
};

const adminNavItem = {
  key: 'admin',
  href: '/admin.html',
  label: 'Admin',
  icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
};

export const renderBottomNav = (container, activeKey, { isAdmin = false } = {}) => {
  if (!container) {
    return;
  }

  const items = isAdmin ? [...navItems, adminNavItem] : navItems;

  container.innerHTML = `
    <div class="bottom-nav__grid" style="${isAdmin ? 'grid-template-columns: repeat(5, minmax(0, 1fr));' : ''}">
      ${items.map((item) => `
        <a class="bottom-nav__link ${item.key === activeKey ? 'is-active' : ''}" href="${item.href}">
          ${item.icon}
          <span>${item.label}</span>
        </a>
      `).join('')}
    </div>
  `;
};

export const renderTopbar = (container, { user, pageLabel = 'Área do associado' }) => {
  if (!container) {
    return;
  }

  const firstName = user?.full_name?.split(' ')[0] || 'Associado';
  const planName = user?.plan?.name || 'Plano';

  container.innerHTML = `
    <section class="glass-card topbar-panel">
      <div class="brand-row">
        <div class="brand-badge">
          <img src="/img/hero-lion.png" alt="Lions Business Network">
        </div>
        <div class="brand-copy">
          <p class="eyebrow">${escapeHtml(pageLabel)}</p>
          <h1>Lions Business Network</h1>
          <p>Conectando empresarios. Gerando negocios.</p>
        </div>
      </div>
      <div class="header-actions">
        <div>
          <div class="tag">Olá, ${escapeHtml(firstName)}</div>
        </div>
        <div class="plan-pill">${escapeHtml(planName)}</div>
      </div>
    </section>
  `;
};

export const emptyStateMarkup = (title, message) => `
  <article class="empty-state glass-card">
    <div>
      <h3 class="section-title">${escapeHtml(title)}</h3>
      <p>${escapeHtml(message)}</p>
    </div>
  </article>
`;

export const companyCardMarkup = (company) => `
  <article class="glass-card company-card" data-company-id="${company.id}">
    <div class="company-card__top">
      <div class="logo-lockup">
        <div class="logo-shell">
          <img src="${escapeHtml(company.logo_url)}" alt="${escapeHtml(company.name)}">
        </div>
        <div>
          <p class="company-category">${escapeHtml(company.category?.name || 'Categoria')}</p>
          <h3 class="company-name">${escapeHtml(company.name)}</h3>
        </div>
      </div>
      <div class="company-discount">${escapeHtml(company.discount_percent)}% OFF</div>
    </div>
    <p class="company-description">${escapeHtml(company.description || 'Sem descrição disponível.')}</p>
    <div class="company-card__footer">
      <div class="company-meta">
        ${company.is_company_of_week ? '<span class="premium-badge">Empresa da semana</span>' : ''}
        <span class="tag">${escapeHtml(company.category?.slug || 'network')}</span>
      </div>
      <a class="whatsapp-button" href="${escapeHtml(company.whatsapp_url)}" target="_blank" rel="noreferrer" data-stop-card="true" aria-label="Falar com ${escapeHtml(company.name)} no WhatsApp">
        ${whatsappIcon}
        <span>WhatsApp</span>
      </a>
    </div>
  </article>
`;

export const offerCardMarkup = (offer) => `
  <article class="glass-card offer-card">
    <div class="offer-card__top">
      <div>
        <p class="offer-company">${escapeHtml(offer.company?.name || 'Lions Business Network')}</p>
        <h3 class="offer-title">${escapeHtml(offer.title)}</h3>
      </div>
      <div class="offer-discount">${escapeHtml(offer.discount_percent)}%</div>
    </div>
    <p class="offer-description">${escapeHtml(offer.description || 'Oferta ativa para membros da rede.')}</p>
    <div class="offer-card__footer">
      <div class="offer-meta">
        <span class="tag">Expira em ${escapeHtml(formatDate(offer.expiry_date))}</span>
      </div>
      ${offer.promo_code ? `<span class="tag">Código ${escapeHtml(offer.promo_code)}</span>` : ''}
    </div>
  </article>
`;

export const contentCardMarkup = (content) => `
  <article class="content-card">
    <div>
      <p class="eyebrow">Conteúdo para membros</p>
      <h3 class="content-title">${escapeHtml(content.title)}</h3>
    </div>
    <p class="content-summary">${escapeHtml(content.summary || 'Resumo não disponível.')}</p>
    <div class="company-card__footer">
      <span class="tag">${escapeHtml(formatDate(content.published_at || new Date().toISOString()))}</span>
      <span class="tag">Members</span>
    </div>
  </article>
`;

export const benefitMarkup = (benefit) => `
  <div class="benefit-item">
    <span class="benefit-dot"></span>
    <span>${escapeHtml(benefit)}</span>
  </div>
`;

export const sectionCardMarkup = (label, active) => `
  <article class="content-card">
    <h3 class="content-title">${escapeHtml(label)}</h3>
    <p class="content-summary">${active ? 'Disponível para o seu acesso atual.' : 'Indisponível no plano atual.'}</p>
    <div class="company-card__footer">
      <span class="${active ? 'premium-badge' : 'tag'}">${active ? 'Ativo' : 'Bloqueado'}</span>
    </div>
  </article>
`;