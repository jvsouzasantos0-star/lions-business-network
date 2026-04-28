import { request } from '../api.js';
import { requireAdmin } from '../guards.js';
import { escapeHtml, formatDate, setPageTitle } from '../ui.js';
import { renderAdminNav, renderAdminTopbar, confirmDialog } from '../admin-ui.js';

setPageTitle('Ofertas | Admin Lions');

const listContainer = document.querySelector('#offers-list');
const confirmModal = document.querySelector('#confirm-modal');

const deleteIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
const editIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>`;

const handleDelete = async (id, title) => {
  const confirmed = await confirmDialog(confirmModal, {
    title: 'Excluir oferta',
    body: `Tem certeza que deseja excluir "${title}"? Esta ação não pode ser desfeita.`,
    confirmLabel: 'Excluir',
    cancelLabel: 'Cancelar'
  });

  if (!confirmed) return;

  try {
    await request(`/admin/offers/${id}`, { method: 'DELETE', auth: true });
    await loadOffers();
  } catch (error) {
    alert(`Erro ao excluir: ${error.message}`);
  }
};

const renderOffers = (offers) => {
  if (!offers.length) {
    listContainer.innerHTML = `
      <div class="empty-state glass-card">
        <div>
          <h3 class="section-title">Nenhuma oferta</h3>
          <p>Ainda não há ofertas cadastradas. <a class="inline-link" href="/admin-oferta-form.html">Adicionar oferta</a>.</p>
        </div>
      </div>`;
    return;
  }

  listContainer.innerHTML = offers.map((o) => `
    <article class="admin-card glass-card" data-id="${o.id}">
      <div class="admin-card__info">
        <h3 class="admin-card__name">${escapeHtml(o.title)}</h3>
        <p class="admin-card__meta">
          ${escapeHtml(o.company_name || 'Empresa')} · ${o.discount_percent ?? 0}% OFF
          ${o.expiry_date ? ` · Expira ${formatDate(o.expiry_date)}` : ''}
        </p>
      </div>
      <div class="admin-card__actions">
        <span class="badge badge--${o.status === 'active' ? 'active' : 'inactive'}">${o.status === 'active' ? 'Ativa' : 'Inativa'}</span>
        <button class="btn-icon btn-edit" title="Editar" data-id="${o.id}">${editIcon}</button>
        <button class="btn-icon btn-icon--danger btn-del" title="Excluir" data-id="${o.id}" data-title="${escapeHtml(o.title)}">${deleteIcon}</button>
      </div>
    </article>
  `).join('');

  listContainer.querySelectorAll('.admin-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-del') || e.target.closest('.btn-edit')) return;
      window.location.href = `/admin-oferta-form.html?id=${card.dataset.id}`;
    });
  });

  listContainer.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `/admin-oferta-form.html?id=${btn.dataset.id}`;
    });
  });

  listContainer.querySelectorAll('.btn-del').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDelete(btn.dataset.id, btn.dataset.title);
    });
  });
};

const loadOffers = async () => {
  listContainer.innerHTML = '<div class="loading-state glass-card">Carregando ofertas...</div>';
  const offers = await request('/admin/offers', { auth: true });
  renderOffers(Array.isArray(offers) ? offers : []);
};

const init = async () => {
  const ok = await requireAdmin();
  if (!ok) return;

  renderAdminTopbar(document.querySelector('#admin-topbar'), 'Ofertas');
  renderAdminNav(document.querySelector('#admin-nav'), 'offers');

  try {
    await loadOffers();
  } catch (error) {
    listContainer.innerHTML = `<div class="empty-state glass-card"><div><h3 class="section-title">Erro</h3><p>${escapeHtml(error.message)}</p></div></div>`;
  }
};

init();
