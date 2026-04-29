import { auth } from '../auth.js';
import { redirectIfAuthenticated } from '../guards.js';
import { setPageTitle, setStatus } from '../ui.js';

setPageTitle('Login | Lions Business Network');

const init = () => {
  if (redirectIfAuthenticated()) {
    return;
  }

  const form = document.querySelector('#login-form');
  const status = document.querySelector('#login-status');
  const toggleBtn = document.querySelector('#toggle-password');
  const passwordInput = document.querySelector('#login-password');

  // Toggle mostrar/ocultar senha
  toggleBtn?.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';

    const textEl = toggleBtn.querySelector('.toggle-eye-text');
    if (textEl) {
      textEl.textContent = isPassword ? 'Ocultar' : 'Mostrar';
    }
    toggleBtn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(status, 'Validando acesso...', '');

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    const formData = new FormData(form);

    try {
      await auth.login({
        email: formData.get('email'),
        password: formData.get('password')
      });

      setStatus(status, 'Acesso liberado. Redirecionando...', 'success');
      window.location.replace('/index.html');
    } catch (error) {
      setStatus(status, error.message || 'Não foi possível entrar.', 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
};

init();
