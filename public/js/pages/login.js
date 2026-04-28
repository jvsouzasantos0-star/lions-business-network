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