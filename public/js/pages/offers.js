import { request, toQueryString } from '../api.js';
import { auth } from '../auth.js';
import { requireAuth } from '../guards.js';
import {
  emptyStateMarkup,
  offerCardMarkup,
  renderBottomNav,
  renderTopbar,
  setPageTitle
} from '../ui.js';

setPageTitle('Ofertas | Lions Business Network');

const offersContainer = document.querySelector('#offers-list');
const categoriesContainer = document.querySelector('#offers-categories');

const state = {
  category: ''
};

const renderOffers = (offers) => {
  offersContainer.innerHTML = offers.length
    ? offers.map(offerCardMarkup).join('')
    : emptyStateMarkup('Nenhuma oferta encontrada', 'Não há promoções ativas com esse filtro.');
};

const renderCategories = (categories, onChange) => {
  categoriesContainer.innerHTML = `
    <button class="chip ${state.category === '' ? 'is-active' : ''}" data-category="">Todas as categorias</button>
    ${categories.map((category) => `
      <button class="chip ${state.category === category.slug ? 'is-active' : ''}" data-category="${category.slug}">
        ${category.name}
      </button>
    `).join('')}
  `;

  categoriesContainer.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      renderCategories(categories, onChange);
      onChange();
    });
  });
};

const loadOffers = async () => {
  offersContainer.innerHTML = '<div class="loading-state glass-card">Carregando ofertas...</div>';
  const offers = await request(`/offers${toQueryString({
    category: state.category
  })}`, { auth: true });

  renderOffers(offers);
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

    renderBottomNav(document.querySelector('#bottom-nav'), 'offers', { isAdmin: user?.role === 'admin' });

    renderTopbar(document.querySelector('#topbar'), {
      user,
      pageLabel: 'Ofertas e benefícios'
    });

    renderCategories(categories, loadOffers);
    await loadOffers();
  } catch (error) {
    offersContainer.innerHTML = emptyStateMarkup('Erro ao carregar ofertas', error.message || 'Tente novamente.');
  }
};

init();
