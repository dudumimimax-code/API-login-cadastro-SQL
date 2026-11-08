const AppError = require('../utils/AppError');

// 404 para rotas da API que não existem
function notFound(req, res, next) {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}

// Tratamento centralizado de erros: toda resposta de erro tem o mesmo formato.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    const body = { error: err.message };
    if (err.details) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  // JSON malformado no corpo da requisição
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido no corpo da requisição.' });
  }

  // Violação de unique no banco (proteção extra contra corrida no cadastro)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Registro duplicado.' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

module.exports = { notFound, errorHandler };
