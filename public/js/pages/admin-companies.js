import { request } from '../api.js';
import { requireAdmin } from '../guards.js';
import { escapeHtml, setPageTitle } from '../ui.js';
import { renderAdminNav, renderAdminTopbar, confirmDialog } from '../admin-ui.js';

setPageTitle('Empresas | Admin Lions');

const listContainer = document.querySelector('#companies-list');
const confirmModal = document.querySelector('#confirm-modal');

const deleteIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
const editIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"/></svg>`;

const handleDelete = async (id, name) => {
  const confirmed = await confirmDialog(confirmModal, {
    title: 'Excluir empresa',
    body: `Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`,
    confirmLabel: 'Excluir',
    cancelLabel: 'Cancelar'
  });

  if (!confirmed) return;

  try {
    await request(`/admin/companies/${id}`, { method: 'DELETE', auth: true });
    await loadCompanies();
  } catch (error) {
    alert(`Erro ao excluir: ${error.message}`);
  }
};

const renderCompanies = (companies) => {
  if (!companies.length) {
    listContainer.innerHTML = `
      <div class="empty-state glass-card">
        <div>
          <h3 class="section-title">Nenhuma empresa</h3>
          <p>Ainda não há empresas cadastradas. <a class="inline-link" href="/admin-empresa-form.html">Adicionar empresa</a>.</p>
        </div>
      </div>`;
    return;
  }

  listContainer.innerHTML = companies.map((c) => `
    <article class="admin-card glass-card" data-id="${c.id}">
      <div class="admin-card__info">
        <h3 class="admin-card__name">${escapeHtml(c.name)}</h3>
        <p class="admin-card__meta">${escapeHtml(c.category_name || 'Sem categoria')} · ${c.discount_percent ?? 0}% OFF</p>
      </div>
      <div class="admin-card__actions">
        <span class="badge badge--${c.status === 'active' ? 'active' : 'inactive'}">${c.status === 'active' ? 'Ativa' : 'Inativa'}</span>
        <button class="btn-icon btn-edit" title="Editar" data-id="${c.id}">${editIcon}</button>
        <button class="btn-icon btn-icon--danger btn-del" title="Excluir" data-id="${c.id}" data-name="${escapeHtml(c.name)}">${deleteIcon}</button>
      </div>
    </article>
  `).join('');

  listContainer.querySelectorAll('.admin-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-del') || e.target.closest('.btn-edit')) return;
      window.location.href = `/admin-empresa-form.html?id=${card.dataset.id}`;
    });
  });

  listContainer.querySelectorAll('.btn-edit').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.location.href = `/admin-empresa-form.html?id=${btn.dataset.id}`;
    });
  });

  listContainer.querySelectorAll('.btn-del').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleDelete(btn.dataset.id, btn.dataset.name);
    });
  });
};

const loadCompanies = async () => {
  listContainer.innerHTML = '<div class="loading-state glass-card">Carregando empresas...</div>';
  const companies = await request('/admin/companies', { auth: true });
  renderCompanies(Array.isArray(companies) ? companies : []);
};

const init = async () => {
  const ok = await requireAdmin();
  if (!ok) return;

  renderAdminTopbar(document.querySelector('#admin-topbar'), 'Empresas');
  renderAdminNav(document.querySelector('#admin-nav'), 'companies');

  try {
    await loadCompanies();
  } catch (error) {
    listContainer.innerHTML = `<div class="empty-state glass-card"><div><h3 class="section-title">Erro</h3><p>${escapeHtml(error.message)}</p></div></div>`;
  }
};

init();
