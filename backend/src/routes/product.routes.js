const { Router } = require('express');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate, schemas, validateIdParam } = require('../middlewares/validate.middleware');

const router = Router();

// Todas as rotas de produto exigem autenticação
router.use(authMiddleware);

router.post('/', validate(schemas.product), productController.create);
router.get('/', productController.list);
router.get('/:id', validateIdParam, productController.show);
router.put('/:id', validateIdParam, validate(schemas.product), productController.update);
router.delete('/:id', validateIdParam, productController.remove);

module.exports = router;
