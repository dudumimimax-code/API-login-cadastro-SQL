// Painel principal: exibe o usuário e lista/exclui os produtos dele

(async function initDashboard() {
  if (!requireAuth()) return;

  const alertEl = document.getElementById('alert');
  const userNameEl = document.getElementById('user-name');
  const countEl = document.getElementById('count');
  const loadingEl = document.getElementById('loading');
  const emptyEl = document.getElementById('empty');
  const tableEl = document.getElementById('products-table');
  const bodyEl = document.getElementById('products-body');

  const cached = session.getUser();
  if (cached) userNameEl.textContent = cached.name;

  const msg = consumeFlash();
  if (msg) showAlert(alertEl, msg.message, msg.type);

  document.getElementById('logout-btn').addEventListener('click', () => {
    session.clear();
    flash('Você saiu da sua conta.');
    window.location.href = 'index.html';
  });

  const formatDate = (iso) => new Date(iso).toLocaleDateString('pt-BR');

  function render(products) {
    loadingEl.hidden = true;
    countEl.textContent = products.length === 1 ? '1 produto' : `${products.length} produtos`;

    if (products.length === 0) {
      tableEl.hidden = true;
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;
    tableEl.hidden = false;
    bodyEl.innerHTML = products.map((p) => `
      <tr data-id="${p.id}">
        <td data-label="Nome">${escapeHtml(p.name)}</td>
        <td data-label="Categoria"><span class="badge">${escapeHtml(p.category)}</span></td>
        <td data-label="Cadastrado em">${formatDate(p.created_at)}</td>
        <td class="actions">
          <a href="product-form.html?id=${p.id}" class="btn btn-outline btn-sm">Editar</a>
          <button class="btn btn-danger btn-sm" data-action="delete" data-id="${p.id}" data-name="${escapeHtml(p.name)}">Excluir</button>
        </td>
      </tr>
    `).join('');
  }

  async function load() {
    try {
      // Confirma o nome no servidor (e valida o token) e busca os produtos
      const [{ user }, { products }] = await Promise.all([api.me(), api.listProducts()]);
      userNameEl.textContent = user.name;
      render(products);
    } catch (err) {
      loadingEl.textContent = 'Não foi possível carregar os produtos.';
      showAlert(alertEl, err.message);
    }
  }

  bodyEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action="delete"]');
    if (!btn) return;

    if (!confirm(`Excluir o produto "${btn.dataset.name}"? Esta ação não pode ser desfeita.`)) return;

    setLoading(btn, true, 'Excluindo...');
    try {
      const { message } = await api.deleteProduct(btn.dataset.id);
      showAlert(alertEl, message, 'success');
      const { products } = await api.listProducts();
      render(products);
    } catch (err) {
      showAlert(alertEl, err.message);
      setLoading(btn, false);
    }
  });

  load();
})();
