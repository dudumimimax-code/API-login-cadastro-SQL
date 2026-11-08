const productService = require('../services/product.service');
const asyncHandler = require('../utils/asyncHandler');

// Em todos os handlers o dono vem de req.userId (JWT), nunca do body.

const create = asyncHandler(async (req, res) => {
  const product = await productService.create(req.userId, req.body);
  res.status(201).json({ message: 'Produto cadastrado com sucesso.', product });
});

const list = asyncHandler(async (req, res) => {
  const products = await productService.listByUser(req.userId);
  res.status(200).json({ total: products.length, products });
});

const show = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id, req.userId);
  res.status(200).json({ product });
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.userId, req.body);
  res.status(200).json({ message: 'Produto atualizado com sucesso.', product });
});

const remove = asyncHandler(async (req, res) => {
  await productService.remove(req.params.id, req.userId);
  res.status(200).json({ message: 'Produto excluído com sucesso.' });
});

module.exports = { create, list, show, update, remove };
