// Redirect if already logged in
if (localStorage.getItem(CONFIG.TOKEN_KEY)) {
  window.location.href = 'dashboard.html';
}

// ——— Tab Switching ———
const tabs = document.querySelectorAll('.tab');
const forms = document.querySelectorAll('.auth-form');
const tabSwitcher = document.querySelector('.tab-switcher');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(target + 'Form').classList.add('active');
    tabSwitcher.dataset.active = target;
  });
});

// ——— Toggle Password ———
function togglePW(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// ——— Login Form ———
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors('login');

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  let valid = true;

  if (!email) { showFieldError('loginEmailErr', 'Email is required'); valid = false; }
  if (!password) { showFieldError('loginPasswordErr', 'Password is required'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('loginBtn');
  setLoading(btn, true);

  try {
    const data = await api.post('/auth/login', { email, password });
    localStorage.setItem(CONFIG.TOKEN_KEY, data.token);
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } catch (err) {
    showFormError('loginError', err.message);
  } finally {
    setLoading(btn, false);
  }
});

// ——— Register Form ———
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors('reg');

  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  let valid = true;

  if (!name || name.length < 2) { showFieldError('regNameErr', 'Name must be at least 2 characters'); valid = false; }
  if (!email || !email.includes('@')) { showFieldError('regEmailErr', 'Valid email required'); valid = false; }
  if (!password || password.length < 6) { showFieldError('regPasswordErr', 'Password must be at least 6 characters'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('registerBtn');
  setLoading(btn, true);

  try {
    const data = await api.post('/auth/register', { name, email, password });
    localStorage.setItem(CONFIG.TOKEN_KEY, data.token);
    localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(data.user));
    window.location.href = 'dashboard.html';
  } catch (err) {
    showFormError('registerError', err.message);
  } finally {
    setLoading(btn, false);
  }
});

// ——— Helpers ———
function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function showFormError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}
function clearErrors(prefix) {
  document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  const formErr = document.getElementById(prefix + 'Error') || document.getElementById(prefix + 'FormError');
  if (formErr) formErr.classList.add('hidden');
}
function setLoading(btn, loading) {
  btn.querySelector('span').style.opacity = loading ? '0.5' : '1';
  btn.querySelector('.btn-loader').classList.toggle('hidden', !loading);
  btn.disabled = loading;
}
