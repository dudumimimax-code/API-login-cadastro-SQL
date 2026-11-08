const { Product } = require('../models');
const AppError = require('../utils/AppError');

// Busca sempre filtrando por id E user_id. Se o produto existir mas for de
// outro usuário, a resposta é 404 — assim não revelamos a existência dele.
async function findOwnedOrFail(id, userId) {
  const product = await Product.findOne({ where: { id, user_id: userId } });
  if (!product) {
    throw new AppError('Produto não encontrado.', 404);
  }
  return product;
}

async function create(userId, { name, category }) {
  return Product.create({ name, category, user_id: userId });
}

async function listByUser(userId) {
  return Product.findAll({
    where: { user_id: userId },
    order: [['created_at', 'DESC']],
  });
}

async function getById(id, userId) {
  return findOwnedOrFail(id, userId);
}

async function update(id, userId, { name, category }) {
  const product = await findOwnedOrFail(id, userId);
  await product.update({ name, category }); // user_id nunca é alterado
  return product;
}

async function remove(id, userId) {
  const product = await findOwnedOrFail(id, userId);
  await product.destroy();
}

module.exports = { create, listByUser, getById, update, remove };
