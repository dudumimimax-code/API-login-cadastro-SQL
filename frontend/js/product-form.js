// Formulário de produto: cria (sem ?id) ou edita (com ?id=N)

(async function initProductForm() {
  if (!requireAuth()) return;

  const form = document.getElementById('product-form');
  const alertEl = document.getElementById('alert');
  const button = form.querySelector('button[type="submit"]');
  const id = new URLSearchParams(window.location.search).get('id');
  const isEdit = Boolean(id);

  if (isEdit) {
    document.getElementById('form-title').textContent = 'Editar produto';
    document.getElementById('form-subtitle').textContent = 'Altere os dados e salve.';
    document.title = 'Editar produto | Gestão de Produtos';

    setLoading(button, true, 'Carregando...');
    try {
      const { product } = await api.getProduct(id);
      form.name.value = product.name;
      form.category.value = product.category;
      setLoading(button, false);
    } catch (err) {
      // 404 também cobre a tentativa de abrir produto de outro usuário
      showAlert(alertEl, err.message);
      form.querySelectorAll('input, button').forEach((el) => (el.disabled = true));
      return;
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert(alertEl);

    // Só nome e categoria são enviados: o dono do produto vem do token, no servidor.
    const values = {
      name: form.name.value.trim(),
      category: form.category.value.trim(),
    };

    const errors = {};
    if (!values.name) errors.name = 'Nome do produto é obrigatório.';
    if (!values.category) errors.category = 'Categoria é obrigatória.';
    showFieldErrors(form, errors);
    if (Object.keys(errors).length) return;

    setLoading(button, true, 'Salvando...');
    try {
      const { message } = isEdit
        ? await api.updateProduct(id, values)
        : await api.createProduct(values);
      flash(message);
      window.location.href = 'dashboard.html';
    } catch (err) {
      showFieldErrors(form, err.details);
      showAlert(alertEl, err.message);
      setLoading(button, false);
    }
  });
})();
