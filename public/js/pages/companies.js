import { request, toQueryString } from '../api.js';
import { auth } from '../auth.js';
import { requireAuth } from '../guards.js';
import {
  companyCardMarkup,
  emptyStateMarkup,
  renderBottomNav,
  renderTopbar,
  setPageTitle
} from '../ui.js';

setPageTitle('Empresas | Lions Business Network');

const listContainer = document.querySelector('#companies-list');
const categoryContainer = document.querySelector('#company-categories');
const searchInput = document.querySelector('#company-search');
const searchButton = document.querySelector('#company-search-button');
const resetButton = document.querySelector('#company-reset-button');

const state = {
  category: '',
  search: ''
};

const renderCompanies = (companies) => {
  listContainer.innerHTML = companies.length
    ? companies.map(companyCardMarkup).join('')
    : emptyStateMarkup('Nenhuma empresa localizada', 'Ajuste busca ou categoria para tentar novamente.');

  listContainer.querySelectorAll('[data-company-id]').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('[data-stop-card="true"]')) {
        return;
      }

      window.location.href = `/empresa.html?id=${card.dataset.companyId}`;
    });
  });
};

const renderCategoryFilters = (categories, onChange) => {
  categoryContainer.innerHTML = `
    <button class="chip ${state.category === '' ? 'is-active' : ''}" data-category="">Todas</button>
    ${categories.map((category) => `
      <button class="chip ${state.category === category.slug ? 'is-active' : ''}" data-category="${category.slug}">
        ${category.name}
      </button>
    `).join('')}
  `;

  categoryContainer.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderCategoryFilters(categories, onChange);
      onChange();
    });
  });
};

const loadCompanies = async () => {
  listContainer.innerHTML = '<div class="loading-state glass-card">Carregando empresas...</div>';
  const companies = await request(`/companies${toQueryString({
    category: state.category,
    search: state.search
  })}`, { auth: true });

  renderCompanies(companies);
};

const init = async () => {
  if (!requireAuth()) {
    return;
  }

  try {
    const [user, categories] = await Promise.all([
      auth.ensureCurrentUser(),
      request('/categories', { auth: true })
    ]);

    renderBottomNav(document.querySelector('#bottom-nav'), 'companies', { isAdmin: user?.role === 'admin' });

    renderTopbar(document.querySelector('#topbar'), {
      user,
      pageLabel: 'Diretório de empresas'
    });

    renderCategoryFilters(categories, loadCompanies);
    await loadCompanies();
  } catch (error) {
    listContainer.innerHTML = emptyStateMarkup('Erro ao carregar empresas', error.message || 'Tente novamente.');
  }

  searchButton.addEventListener('click', async () => {
    state.search = searchInput.value.trim();
    await loadCompanies();
  });

  resetButton.addEventListener('click', async () => {
    state.search = '';
    state.category = '';
    searchInput.value = '';
    const categories = await request('/categories', { auth: true });
    renderCategoryFilters(categories, loadCompanies);
    await loadCompanies();
  });

  searchInput.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    state.search = searchInput.value.trim();
    await loadCompanies();
  });
};

init();