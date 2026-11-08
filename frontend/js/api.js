// Cliente HTTP central: todas as páginas falam com a API por aqui.

// Por padrão o frontend é servido pelo próprio Express, então a API fica na mesma origem.
// Se abrir os HTML direto do disco (file://) ou por outro servidor (ex.: Live Server),
// a URL completa da API é usada — ajuste a porta se mudar o PORT do .env.
const API_URL = window.location.protocol === 'file:' || ['5500', '5501'].includes(window.location.port)
  ? 'http://localhost:3000/api'
  : '/api';

const TOKEN_KEY = 'app_token';
const USER_KEY = 'app_user';

const session = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  },
  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = session.getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor.', 0);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Token inválido/expirado em rota protegida: encerra a sessão
    if (response.status === 401 && auth) {
      session.clear();
      window.location.href = 'index.html?expired=1';
    }
    throw new ApiError(data.error || 'Erro inesperado.', response.status, data.details);
  }

  return data;
}

const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),
  me: () => request('/auth/me'),

  listProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (payload) => request('/products', { method: 'POST', body: payload }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: 'PUT', body: payload }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
};

// ---------- Helpers de interface compartilhados ----------

function showAlert(el, message, type = 'error') {
  el.textContent = message;
  el.className = `alert ${type} show`;
}

function hideAlert(el) {
  el.className = 'alert';
  el.textContent = '';
}

// Mostra erros de validação vindos da API ({ details: { campo: msg } }) embaixo de cada campo
function showFieldErrors(form, details = {}) {
  form.querySelectorAll('.field-error').forEach((e) => (e.textContent = ''));
  form.querySelectorAll('input').forEach((i) => i.classList.remove('invalid'));
  Object.entries(details).forEach(([field, msg]) => {
    const input = form.querySelector(`[name="${field}"]`);
    const slot = form.querySelector(`[data-error-for="${field}"]`);
    if (input) input.classList.add('invalid');
    if (slot) slot.textContent = msg;
  });
}

function setLoading(button, loading, text) {
  if (loading) {
    button.dataset.label = button.textContent;
    button.textContent = text || 'Aguarde...';
    button.disabled = true;
  } else {
    button.textContent = button.dataset.label || button.textContent;
    button.disabled = false;
  }
}

// Evita XSS ao inserir dados do usuário no HTML (inclusive dentro de atributos)
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function requireAuth() {
  if (!session.getToken()) {
    window.location.replace('index.html');
    return false;
  }
  return true;
}

function redirectIfLogged() {
  if (session.getToken()) window.location.replace('dashboard.html');
}

// Mensagem passada entre páginas (ex.: "Produto salvo") via sessionStorage
function flash(message, type = 'success') {
  sessionStorage.setItem('flash', JSON.stringify({ message, type }));
}
function consumeFlash() {
  const raw = sessionStorage.getItem('flash');
  sessionStorage.removeItem('flash');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
