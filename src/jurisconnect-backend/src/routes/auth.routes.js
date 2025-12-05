const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema, refreshSchema } = require('../validators/auth.validator');

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', validate(refreshSchema), authController.refresh);

// POST /api/v1/auth/logout (requer autenticação)
router.post('/logout', verificarToken, authController.logout);

// GET /api/v1/auth/me (requer autenticação)
router.get('/me', verificarToken, authController.me);

module.exports = router;
