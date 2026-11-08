// Encaminha erros de funções async para o middleware de erros (Express 4 não faz isso sozinho).
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
