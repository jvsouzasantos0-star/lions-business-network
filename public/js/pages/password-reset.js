import { request } from '../api.js';
import { setStatus } from '../ui.js';

const API_BASE = '/auth';

// State
let currentEmail = '';
let currentCode = '';
let resendTimer = null;

// DOM refs
const steps = {
  1: document.getElementById('reset-step-1'),
  2: document.getElementById('reset-step-2'),
  3: document.getElementById('reset-step-3'),
  4: document.getElementById('reset-step-4')
};
const titleEl = document.getElementById('reset-title');
const emailDisplay = document.getElementById('reset-email-display');

const STEP_TITLES = {
  1: 'Recuperar senha',
  2: 'Verificar código',
  3: 'Nova senha',
  4: 'Tudo certo!'
};

// ----------------------------------------------------------------
// Navigation
// ----------------------------------------------------------------
const showStep = (n) => {
  Object.entries(steps).forEach(([key, el]) => {
    if (!el) return;
    if (Number(key) === n) {
      el.classList.remove('reset-step--hidden');
      el.removeAttribute('aria-hidden');
    } else {
      el.classList.add('reset-step--hidden');
      el.setAttribute('aria-hidden', 'true');
    }
  });

  if (titleEl) titleEl.textContent = STEP_TITLES[n] || '';
};

// ----------------------------------------------------------------
// Step 1 – Request code
// ----------------------------------------------------------------
const formEmail = document.getElementById('reset-form-email');
const statusEl1 = document.getElementById('reset-status-1');
const btnSend = document.getElementById('reset-btn-send');

formEmail?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('reset-email')?.value?.trim();
  if (!email) return;

  btnSend.disabled = true;
  setStatus(statusEl1, 'Enviando código...', '');

  try {
    await request(`${API_BASE}/forgot-password`, {
      method: 'POST',
      body: { email }
    });
    currentEmail = email;
    if (emailDisplay) emailDisplay.textContent = email;
    setStatus(statusEl1, '', '');
    showStep(2);
    focusFirstCodeInput();
    startResendTimer();
  } catch (err) {
    setStatus(statusEl1, err.message || 'Não foi possível enviar o código.', 'error');
  } finally {
    btnSend.disabled = false;
  }
});

// ----------------------------------------------------------------
// Step 2 – Verify code
// ----------------------------------------------------------------
const codeInputs = Array.from(document.querySelectorAll('.reset-code-input'));
const formCode = document.getElementById('reset-form-code');
const statusEl2 = document.getElementById('reset-status-2');
const btnVerify = document.getElementById('reset-btn-verify');
const resendBtn = document.getElementById('reset-resend-btn');
const resendTimerEl = document.getElementById('reset-resend-timer');
const timerCountEl = document.getElementById('reset-timer-count');

const focusFirstCodeInput = () => {
  codeInputs[0]?.focus();
};

const getCode = () => codeInputs.map((i) => i.value).join('');

const clearCodeInputs = () => {
  codeInputs.forEach((i) => { i.value = ''; });
  codeInputs[0]?.focus();
};

// Auto-advance and backspace logic
codeInputs.forEach((input, idx) => {
  input.addEventListener('input', (e) => {
    const val = e.target.value.replace(/\D/g, '');
    e.target.value = val.slice(-1);
    if (val && idx < codeInputs.length - 1) {
      codeInputs[idx + 1].focus();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace' && !input.value && idx > 0) {
      codeInputs[idx - 1].focus();
    }
    if (e.key === 'ArrowLeft' && idx > 0) {
      codeInputs[idx - 1].focus();
    }
    if (e.key === 'ArrowRight' && idx < codeInputs.length - 1) {
      codeInputs[idx + 1].focus();
    }
  });

  // Handle paste on any input
  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
    pasted.split('').slice(0, 6).forEach((char, i) => {
      if (codeInputs[i]) codeInputs[i].value = char;
    });
    const nextEmpty = codeInputs.findIndex((inp) => !inp.value);
    if (nextEmpty >= 0) codeInputs[nextEmpty].focus();
    else codeInputs[codeInputs.length - 1].focus();
  });
});

formCode?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = getCode();
  if (code.length !== 6) {
    setStatus(statusEl2, 'Digite todos os 6 dígitos do código.', 'error');
    return;
  }

  btnVerify.disabled = true;
  setStatus(statusEl2, 'Verificando...', '');

  try {
    await request(`${API_BASE}/verify-reset-code`, {
      method: 'POST',
      body: { email: currentEmail, code }
    });
    currentCode = code;
    setStatus(statusEl2, '', '');
    showStep(3);
    document.getElementById('reset-new-password')?.focus();
  } catch (err) {
    setStatus(statusEl2, err.message || 'Código inválido ou expirado.', 'error');
    clearCodeInputs();
  } finally {
    btnVerify.disabled = false;
  }
});

// Resend timer
const startResendTimer = () => {
  if (resendTimer) clearInterval(resendTimer);
  let seconds = 60;
  if (resendBtn) resendBtn.disabled = true;
  if (resendTimerEl) resendTimerEl.style.display = '';
  if (timerCountEl) timerCountEl.textContent = String(seconds);

  resendTimer = setInterval(() => {
    seconds -= 1;
    if (timerCountEl) timerCountEl.textContent = String(seconds);
    if (seconds <= 0) {
      clearInterval(resendTimer);
      resendTimer = null;
      if (resendBtn) resendBtn.disabled = false;
      if (resendTimerEl) resendTimerEl.style.display = 'none';
    }
  }, 1000);
};

resendBtn?.addEventListener('click', async () => {
  resendBtn.disabled = true;
  setStatus(statusEl2, 'Reenviando código...', '');
  try {
    await request(`${API_BASE}/forgot-password`, {
      method: 'POST',
      body: { email: currentEmail }
    });
    setStatus(statusEl2, 'Novo código enviado!', 'success');
    clearCodeInputs();
    startResendTimer();
  } catch (err) {
    setStatus(statusEl2, err.message || 'Não foi possível reenviar.', 'error');
    resendBtn.disabled = false;
  }
});

// ----------------------------------------------------------------
// Step 3 – New password
// ----------------------------------------------------------------
const formPassword = document.getElementById('reset-form-password');
const statusEl3 = document.getElementById('reset-status-3');
const btnSave = document.getElementById('reset-btn-save');
const pwInput = document.getElementById('reset-new-password');
const confirmInput = document.getElementById('reset-confirm-password');

const setupToggle = (btnId, inputEl) => {
  const btn = document.getElementById(btnId);
  if (!btn || !inputEl) return;
  btn.addEventListener('click', () => {
    const isPassword = inputEl.type === 'password';
    inputEl.type = isPassword ? 'text' : 'password';
    const textEl = btn.querySelector('.toggle-eye-text');
    if (textEl) textEl.textContent = isPassword ? 'Ocultar' : 'Mostrar';
    btn.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');
  });
};

setupToggle('reset-toggle-pw1', pwInput);
setupToggle('reset-toggle-pw2', confirmInput);

formPassword?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const pw = pwInput?.value || '';
  const confirm = confirmInput?.value || '';

  if (pw.length < 6) {
    setStatus(statusEl3, 'A senha deve ter pelo menos 6 caracteres.', 'error');
    return;
  }
  if (pw !== confirm) {
    setStatus(statusEl3, 'As senhas não coincidem.', 'error');
    return;
  }

  btnSave.disabled = true;
  setStatus(statusEl3, 'Salvando nova senha...', '');

  try {
    await request(`${API_BASE}/reset-password`, {
      method: 'POST',
      body: { email: currentEmail, code: currentCode, new_password: pw }
    });
    setStatus(statusEl3, '', '');
    showStep(4);
  } catch (err) {
    setStatus(statusEl3, err.message || 'Não foi possível redefinir a senha.', 'error');
  } finally {
    btnSave.disabled = false;
  }
});

// ----------------------------------------------------------------
// Init
// ----------------------------------------------------------------
showStep(1);
