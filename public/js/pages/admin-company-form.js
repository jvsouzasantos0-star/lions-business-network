import { request } from '../api.js';
import { requireAdmin } from '../guards.js';
import { escapeHtml, setStatus, setPageTitle } from '../ui.js';
import { renderAdminNav, renderAdminTopbar, confirmDialog } from '../admin-ui.js';

setPageTitle('Empresa | Admin Lions');

const params = new URLSearchParams(window.location.search);
const editId = params.get('id');
const isEdit = Boolean(editId);

const formTitle = document.querySelector('#form-title');
const form = document.querySelector('#company-form');
const statusMsg = document.querySelector('#status-msg');
const btnSave = document.querySelector('#btn-save');
const btnDelete = document.querySelector('#btn-delete');
const confirmModal = document.querySelector('#confirm-modal');

const fields = {
  name: document.querySelector('#f-name'),
  category: document.querySelector('#f-category'),
  description: document.querySelector('#f-description'),
  discount: document.querySelector('#f-discount'),
  phone: document.querySelector('#f-phone'),
  whatsapp: document.querySelector('#f-whatsapp'),
  instagram: document.querySelector('#f-instagram'),
  address: document.querySelector('#f-address'),
  logo: document.querySelector('#f-logo'),
  status: document.querySelector('#f-status')
};

const loadCategories = async (selectedId) => {
  const categories = await request('/admin/categories', { auth: true });
  const cats = Array.isArray(categories) ? categories : [];
  fields.category.innerHTML = `<option value="">Selecione uma categoria</option>` +
    cats.map((c) => `<option value="${c.id}" ${String(c.id) === String(selectedId) ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
};

const fillForm = (company) => {
  formTitle.textContent = 'Editar Empresa';
  fields.name.value = company.name || '';
  fields.description.value = company.description || '';
  fields.discount.value = company.discount_percent ?? '';
  fields.phone.value = company.phone || '';
  fields.whatsapp.value = company.whatsapp_number || '';
  fields.instagram.value = company.instagram || '';
  fields.address.value = company.address || '';
  fields.logo.value = company.logo_url || '';
  fields.status.checked = company.status === 'active';
  btnDelete.classList.remove('hidden');
};

const getFormData = () => ({
  name: fields.name.value.trim(),
  category_id: fields.category.value,
  description: fields.description.value.trim(),
  discount_percent: Number(fields.discount.value) || 0,
  phone: fields.phone.value.trim(),
  whatsapp_number: fields.whatsapp.value.trim(),
  instagram: fields.instagram.value.trim(),
  address: fields.address.value.trim(),
  logo_url: fields.logo.value.trim(),
  status: fields.status.checked ? 'active' : 'inactive'
});

const validate = (data) => {
  if (!data.name) return 'Nome é obrigatório.';
  if (!data.category_id) return 'Categoria é obrigatória.';
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
      await request(`/admin/companies/${editId}`, { method: 'PUT', auth: true, body: data });
    } else {
      await request('/admin/companies', { method: 'POST', auth: true, body: data });
    }
    window.location.href = '/admin-empresas.html';
  } catch (err) {
    setStatus(statusMsg, err.message || 'Erro ao salvar.', 'error');
    btnSave.textContent = isEdit ? 'Salvar alterações' : 'Salvar empresa';
    btnSave.disabled = false;
  }
});

btnDelete.addEventListener('click', async () => {
  const confirmed = await confirmDialog(confirmModal, {
    title: 'Excluir empresa',
    body: `Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.`,
    confirmLabel: 'Excluir',
    cancelLabel: 'Cancelar'
  });
  if (!confirmed) return;

  btnDelete.textContent = 'Excluindo...';
  btnDelete.disabled = true;

  try {
    await request(`/admin/companies/${editId}`, { method: 'DELETE', auth: true });
    window.location.href = '/admin-empresas.html';
  } catch (err) {
    setStatus(statusMsg, err.message || 'Erro ao excluir.', 'error');
    btnDelete.textContent = 'Excluir empresa';
    btnDelete.disabled = false;
  }
});

const init = async () => {
  const ok = await requireAdmin();
  if (!ok) return;

  renderAdminTopbar(document.querySelector('#admin-topbar'), isEdit ? 'Editar Empresa' : 'Nova Empresa');
  renderAdminNav(document.querySelector('#admin-nav'), 'companies');

  try {
    if (isEdit) {
      const company = await request(`/admin/companies/${editId}`, { auth: true });
      const c = company?.data ?? company;
      await loadCategories(c.category_id);
      fillForm(c);
      btnSave.textContent = 'Salvar alterações';
    } else {
      await loadCategories();
    }
  } catch (error) {
    setStatus(statusMsg, `Erro ao carregar dados: ${error.message}`, 'error');
  }
};

init();
