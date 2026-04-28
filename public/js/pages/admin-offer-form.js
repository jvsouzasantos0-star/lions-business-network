import { request } from '../api.js';
import { requireAdmin } from '../guards.js';
import { escapeHtml, setStatus, setPageTitle } from '../ui.js';
import { renderAdminNav, renderAdminTopbar, confirmDialog } from '../admin-ui.js';

setPageTitle('Oferta | Admin Lions');

const params = new URLSearchParams(window.location.search);
const editId = params.get('id');
const isEdit = Boolean(editId);

const formTitle = document.querySelector('#form-title');
const form = document.querySelector('#offer-form');
const statusMsg = document.querySelector('#status-msg');
const btnSave = document.querySelector('#btn-save');
const btnDelete = document.querySelector('#btn-delete');
const confirmModal = document.querySelector('#confirm-modal');

const fields = {
  title: document.querySelector('#f-title'),
  company: document.querySelector('#f-company'),
  description: document.querySelector('#f-description'),
  discount: document.querySelector('#f-discount'),
  starts: document.querySelector('#f-starts'),
  expires: document.querySelector('#f-expires'),
  status: document.querySelector('#f-status')
};

const toDateInput = (value) => {
  if (!value) return '';
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const loadCompanies = async (selectedId) => {
  const companies = await request('/admin/companies', { auth: true });
  const list = Array.isArray(companies) ? companies : [];
  fields.company.innerHTML = `<option value="">Selecione uma empresa</option>` +
    list.map((c) => `<option value="${c.id}" ${String(c.id) === String(selectedId) ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
};

const fillForm = (offer) => {
  formTitle.textContent = 'Editar Oferta';
  fields.title.value = offer.title || '';
  fields.description.value = offer.description || '';
  fields.discount.value = offer.discount_percent ?? '';
  fields.starts.value = toDateInput(offer.starts_at);
  fields.expires.value = toDateInput(offer.expiry_date);
  fields.status.checked = offer.status === 'active';
  btnDelete.classList.remove('hidden');
};

const getFormData = () => ({
  title: fields.title.value.trim(),
  company_id: fields.company.value,
  description: fields.description.value.trim(),
  discount_percent: Number(fields.discount.value) || 0,
  starts_at: fields.starts.value || null,
  expires_at: fields.expires.value || null,
  status: fields.status.checked ? 'active' : 'inactive'
});

const validate = (data) => {
  if (!data.title) return 'Título é obrigatório.';
  if (!data.company_id) return 'Empresa vinculada é obrigatória.';
  return null;
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = getFormData();
  const error = validate(data);
  if (error) {
    setStatus(statusMsg, error, 'error');
    return;
  }

  btnSave.textContent = 'Salvando...';
  btnSave.disabled = true;
  setStatus(statusMsg, '');

  try {
    if (isEdit) {
      await request(`/admin/offers/${editId}`, { method: 'PUT', auth: true, body: data });
    } else {
      await request('/admin/offers', { method: 'POST', auth: true, body: data });
    }
    window.location.href = '/admin-ofertas.html';
  } catch (err) {
    setStatus(statusMsg, err.message || 'Erro ao salvar.', 'error');
    btnSave.textContent = isEdit ? 'Salvar alterações' : 'Salvar oferta';
    btnSave.disabled = false;
  }
});

btnDelete.addEventListener('click', async () => {
  const confirmed = await confirmDialog(confirmModal, {
    title: 'Excluir oferta',
    body: 'Tem certeza que deseja excluir esta oferta? Esta ação não pode ser desfeita.',
    confirmLabel: 'Excluir',
    cancelLabel: 'Cancelar'
  });
  if (!confirmed) return;

  btnDelete.textContent = 'Excluindo...';
  btnDelete.disabled = true;

  try {
    await request(`/admin/offers/${editId}`, { method: 'DELETE', auth: true });
    window.location.href = '/admin-ofertas.html';
  } catch (err) {
    setStatus(statusMsg, err.message || 'Erro ao excluir.', 'error');
    btnDelete.textContent = 'Excluir oferta';
    btnDelete.disabled = false;
  }
});

const init = async () => {
  const ok = await requireAdmin();
  if (!ok) return;

  renderAdminTopbar(document.querySelector('#admin-topbar'), isEdit ? 'Editar Oferta' : 'Nova Oferta');
  renderAdminNav(document.querySelector('#admin-nav'), 'offers');

  try {
    if (isEdit) {
      const offer = await request(`/admin/offers/${editId}`, { auth: true });
      const o = offer?.data ?? offer;
      fillForm(o);
      await loadCompanies(o.company_id);
      btnSave.textContent = 'Salvar alterações';
    } else {
      await loadCompanies();
    }
  } catch (error) {
    setStatus(statusMsg, `Erro ao carregar dados: ${error.message}`, 'error');
  }
};

init();
