const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

function generateToken(user) {
  return jwt.sign({ sub: user.id, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

async function register({ name, email, password }) {
  const normalizedEmail = email.toLowerCase();

  const exists = await User.findOne({ where: { email: normalizedEmail } });
  if (exists) {
    throw new AppError('E-mail já cadastrado.', 409);
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email: normalizedEmail, password: hash });

  return user.toJSON(); // toJSON remove a senha
}

async function login({ email, password }) {
  const user = await User.scope('withPassword').findOne({ where: { email: email.toLowerCase() } });

  // Mesma mensagem para e-mail inexistente e senha errada (não revela quais e-mails existem)
  const valid = user ? await bcrypt.compare(password, user.password) : false;
  if (!valid) {
    throw new AppError('E-mail ou senha inválidos.', 401);
  }

  return { user: user.toJSON(), token: generateToken(user) };
}

async function getProfile(userId) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('Usuário não encontrado.', 404);
  }
  return user.toJSON();
}

module.exports = { register, login, getProfile };
