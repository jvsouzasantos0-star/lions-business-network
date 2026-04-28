import { auth } from '../auth.js';
import { redirectIfAuthenticated } from '../guards.js';
import { setPageTitle, setStatus } from '../ui.js';

setPageTitle('Cadastro | Lions Business Network');

const init = () => {
  if (redirectIfAuthenticated()) {
    return;
  }

  const form = document.querySelector('#register-form');
  const status = document.querySelector('#register-status');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setStatus(status, 'Criando conta...', '');

    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    const formData = new FormData(form);

    try {
      await auth.register({
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        password: formData.get('password')
      });

      setStatus(status, 'Conta criada com sucesso. Entrando...', 'success');
      window.location.replace('/index.html');
    } catch (error) {
      setStatus(status, error.message || 'Não foi possível criar a conta.', 'error');
    } finally {
      submitButton.disabled = false;
    }
  });
};

init();