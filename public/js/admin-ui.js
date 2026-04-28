import { escapeHtml } from './ui.js';

const adminNavItems = [
  {
    key: 'dashboard',
    href: '/admin.html',
    label: 'Dashboard',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>'
  },
  {
    key: 'companies',
    href: '/admin-empresas.html',
    label: 'Empresas',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 21V6.5A1.5 1.5 0 0 1 5.5 5H14v16"/><path d="M14 9h4.5A1.5 1.5 0 0 1 20 10.5V21"/><path d="M8 9h2"/><path d="M8 13h2"/><path d="M8 17h2"/><path d="M14 13h2"/><path d="M14 17h2"/></svg>'
  },
  {
    key: 'offers',
    href: '/admin-ofertas.html',
    label: 'Ofertas',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 3H6.5A2.5 2.5 0 0 0 4 5.5V10l10 10 6-6L10 4Z"/><path d="M7.5 7.5h.01"/></svg>'
  },
  {
    key: 'back',
    href: '/index.html',
    label: 'Voltar',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>'
  }
];

export const renderAdminNav = (container, activeKey) => {
  if (!container) return;

  container.innerHTML = `
    <div class="bottom-nav__grid admin-bottom-nav__grid">
      ${adminNavItems.map((item) => `
        <a class="bottom-nav__link ${item.key === activeKey ? 'is-active' : ''}" href="${item.href}">
          ${item.icon}
          <span>${item.label}</span>
        </a>
      `).join('')}
    </div>
  `;
};

export const renderAdminTopbar = (container, pageLabel = 'Admin') => {
  if (!container) return;

  container.innerHTML = `
    <section class="glass-card admin-topbar">
      <div class="admin-topbar__brand">
        <img class="admin-topbar__brand-img" src="/img/hero-lion.png" alt="Lions Business Network">
        <div>
          <p class="admin-topbar__sub">Painel Administrativo</p>
          <h1 class="admin-topbar__title">${escapeHtml(pageLabel)}</h1>
        </div>
      </div>
      <a class="button button--ghost" href="/index.html" style="min-height:40px;padding:0 16px;font-size:0.85rem">Voltar ao app</a>
    </section>
  `;
};

/**
 * Shows a confirmation dialog and returns a Promise<boolean>.
 * @param {HTMLElement} container - The overlay element
 * @param {{ title: string, body: string, confirmLabel: string, cancelLabel: string }} opts
 */
export const confirmDialog = (container, { title, body, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar' }) => {
  return new Promise((resolve) => {
    container.classList.remove('hidden');
    container.innerHTML = `
      <div class="confirm-dialog glass-card">
        <h2 class="confirm-dialog__title">${escapeHtml(title)}</h2>
        <p class="confirm-dialog__body">${escapeHtml(body)}</p>
        <div class="confirm-dialog__actions">
          <button class="button button--ghost" id="confirm-cancel">${escapeHtml(cancelLabel)}</button>
          <button class="button button--danger" id="confirm-ok">${escapeHtml(confirmLabel)}</button>
        </div>
      </div>
    `;

    const close = (result) => {
      container.classList.add('hidden');
      container.innerHTML = '';
      resolve(result);
    };

    container.querySelector('#confirm-ok').addEventListener('click', () => close(true));
    container.querySelector('#confirm-cancel').addEventListener('click', () => close(false));
    container.addEventListener('click', (e) => {
      if (e.target === container) close(false);
    });
  });
};
