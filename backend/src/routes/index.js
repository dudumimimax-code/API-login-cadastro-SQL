const { Router } = require('express');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/products', productRoutes);

module.exports = router;
