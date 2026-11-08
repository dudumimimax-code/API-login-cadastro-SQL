const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  res.status(201).json({ message: 'Usuário cadastrado com sucesso.', user });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.status(200).json({ message: 'Login realizado com sucesso.', user, token });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.userId);
  res.status(200).json({ user });
});

module.exports = { register, login, me };
