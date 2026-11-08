const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate, schemas } = require('../middlewares/validate.middleware');

const router = Router();

router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
