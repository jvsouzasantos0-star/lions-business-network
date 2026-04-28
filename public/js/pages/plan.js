import { request } from '../api.js';
import { auth } from '../auth.js';
import { requireAuth } from '../guards.js';
import {
  benefitMarkup,
  emptyStateMarkup,
  renderBottomNav,
  renderTopbar,
  setPageTitle,
  setStatus
} from '../ui.js';

setPageTitle('Meu Plano | Lions Business Network');

const profileCard = document.querySelector('#profile-card');
const planCard = document.querySelector('#plan-card');
const benefitsContainer = document.querySelector('#plan-benefits');
const availableSections = document.querySelector('#available-sections');
const logoutButton = document.querySelector('#logout-button');
const statusNode = document.querySelector('#plan-status');

const renderProfile = (user) => {
  profileCard.className = 'glass-card profile-card';
  profileCard.innerHTML = `
    <div>
      <p class="eyebrow">Perfil do associado</p>
      <h2 class="section-title">${user.full_name}</h2>
    </div>
    <div class="profile-list">
      <div class="profile-item">
        <div>
          <div class="profile-item__label">Email</div>
          <div class="profile-item__value">${user.email}</div>
        </div>
        <span class="tag">${user.role}</span>
      </div>
      <div class="profile-item">
        <div>
          <div class="profile-item__label">Status</div>
          <div class="profile-item__value">${user.status}</div>
        </div>
        <span class="tag">${user.plan.name}</span>
      </div>
    </div>
  `;
};

const renderPlan = (payload) => {
  const plan = payload.plan;

  planCard.className = 'glass-card plan-card';
  planCard.innerHTML = `
    <div>
      <p class="eyebrow">Plano atual</p>
      <h2 class="section-title">${plan.name}</h2>
    </div>
    <div class="profile-item">
      <div>
        <div class="profile-item__label">Acesso</div>
        <div class="profile-item__value">Completo — todas as áreas liberadas</div>
      </div>
      <span class="tag">Ativo</span>
    </div>
  `;

  benefitsContainer.innerHTML = plan.benefits.map(benefitMarkup).join('');

  availableSections.innerHTML = '';
};

const init = async () => {
  if (!requireAuth()) {
    return;
  }

  try {
    const [user, planData] = await Promise.all([
      auth.ensureCurrentUser(),
      request('/plans/me', { auth: true })
    ]);

    renderBottomNav(document.querySelector('#bottom-nav'), 'plan', { isAdmin: user?.role === 'admin' });

    renderTopbar(document.querySelector('#topbar'), {
      user,
      pageLabel: 'Meu plano'
    });

    renderProfile(user);
    renderPlan(planData);
  } catch (error) {
    profileCard.className = 'glass-card profile-card';
    planCard.className = 'glass-card plan-card';
    profileCard.innerHTML = emptyStateMarkup('Erro ao carregar perfil', error.message || 'Tente novamente.');
    planCard.innerHTML = '';
  }

  logoutButton?.addEventListener('click', async () => {
    logoutButton.disabled = true;
    setStatus(statusNode, 'Encerrando sessão...', '');

    try {
      await auth.logout();
      window.location.replace('/login.html');
    } catch (error) {
      setStatus(statusNode, error.message || 'Não foi possível sair.', 'error');
      logoutButton.disabled = false;
    }
  });
};

init();
