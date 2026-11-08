const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

// Valida o header "Authorization: Bearer <token>" e injeta req.userId.
// É daqui — e só daqui — que sai o user_id usado nas regras de produto.
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return next(new AppError('Token não fornecido.', 401));
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Formato de token inválido. Use: Bearer <token>.', 401));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Token expirado.' : 'Token inválido.';
    return next(new AppError(message, 401));
  }
}

module.exports = authMiddleware;
