// Lógica das páginas de login e cadastro

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Validação no navegador (a API valida de novo — esta é só para resposta rápida)
function validateClient(values, { requireName = false } = {}) {
  const errors = {};
  if (requireName) {
    if (!values.name) errors.name = 'Nome é obrigatório.';
    else if (values.name.length < 3) errors.name = 'Nome deve ter pelo menos 3 caracteres.';
  }
  if (!values.email) errors.email = 'E-mail é obrigatório.';
  else if (!EMAIL_REGEX.test(values.email)) errors.email = 'Formato de e-mail inválido.';
  if (!values.password) errors.password = 'Senha é obrigatória.';
  else if (requireName && values.password.length < 6) errors.password = 'Senha deve ter pelo menos 6 caracteres.';
  return errors;
}

function initLoginPage() {
  redirectIfLogged();

  const form = document.getElementById('login-form');
  const alertEl = document.getElementById('alert');
  const button = form.querySelector('button[type="submit"]');

  const params = new URLSearchParams(window.location.search);
  if (params.get('expired')) showAlert(alertEl, 'Sua sessão expirou. Entre novamente.');
  const msg = consumeFlash();
  if (msg) showAlert(alertEl, msg.message, msg.type);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    const values = {
      email: form.email.value.trim(),
      password: form.password.value,
    };

    const errors = validateClient(values);
    showFieldErrors(form, errors);
    if (Object.keys(errors).length) return;

    setLoading(button, true, 'Entrando...');
    try {
      const { token, user } = await api.login(values);
      session.save(token, user);
      window.location.href = 'dashboard.html';
    } catch (err) {
      showFieldErrors(form, err.details);
      showAlert(alertEl, err.message);
      setLoading(button, false);
    }
  });
}

function initRegisterPage() {
  redirectIfLogged();

  const form = document.getElementById('register-form');
  const alertEl = document.getElementById('alert');
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    const values = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
    };

    const errors = validateClient(values, { requireName: true });
    showFieldErrors(form, errors);
    if (Object.keys(errors).length) return;

    setLoading(button, true, 'Cadastrando...');
    try {
      await api.register(values);
      flash('Cadastro realizado com sucesso! Faça login para continuar.');
      window.location.href = 'index.html';
    } catch (err) {
      showFieldErrors(form, err.details);
      if (err.status === 409) showFieldErrors(form, { email: err.message });
      showAlert(alertEl, err.message);
      setLoading(button, false);
    }
  });
}
