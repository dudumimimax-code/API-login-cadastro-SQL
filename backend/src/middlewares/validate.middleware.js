const AppError = require('../utils/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Cada regra recebe o valor (já sem espaços nas pontas) e devolve
 * uma mensagem de erro ou null.
 */
const rules = {
  required: (label) => (v) => (v === undefined || v === null || v === '' ? `${label} é obrigatório.` : null),
  email: () => (v) => (v && !EMAIL_REGEX.test(v) ? 'Formato de e-mail inválido.' : null),
  minLength: (label, n) => (v) => (v && v.length < n ? `${label} deve ter pelo menos ${n} caracteres.` : null),
  maxLength: (label, n) => (v) => (v && v.length > n ? `${label} deve ter no máximo ${n} caracteres.` : null),
};

// Fábrica de middleware: recebe um schema { campo: [regras] }, valida req.body
// e mantém no body apenas os campos previstos (o que descarta, por ex., um user_id enviado pelo front).
function validate(schema) {
  return (req, res, next) => {
    const errors = {};
    const clean = {};

    for (const [field, fieldRules] of Object.entries(schema)) {
      let value = req.body ? req.body[field] : undefined;
      if (typeof value === 'string' && field !== 'password') value = value.trim();

      for (const rule of fieldRules) {
        const error = rule(value);
        if (error) {
          errors[field] = error;
          break;
        }
      }
      clean[field] = value;
    }

    if (Object.keys(errors).length > 0) {
      return next(new AppError('Dados inválidos.', 422, errors));
    }

    req.body = clean;
    return next();
  };
}

const schemas = {
  register: {
    name: [rules.required('Nome'), rules.minLength('Nome', 3), rules.maxLength('Nome', 120)],
    email: [rules.required('E-mail'), rules.email(), rules.maxLength('E-mail', 160)],
    password: [rules.required('Senha'), rules.minLength('Senha', 6), rules.maxLength('Senha', 72)],
  },
  login: {
    email: [rules.required('E-mail'), rules.email()],
    password: [rules.required('Senha')],
  },
  product: {
    name: [rules.required('Nome do produto'), rules.maxLength('Nome do produto', 120)],
    category: [rules.required('Categoria'), rules.maxLength('Categoria', 80)],
  },
};

// Garante que o :id da rota é um inteiro positivo.
function validateIdParam(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new AppError('ID inválido.', 400));
  }
  req.params.id = id;
  return next();
}

module.exports = { validate, schemas, validateIdParam };
