const express = require('express');
const router = express.Router();
const checkLogin = require('../middleware/checkLoginMiddleware');

const authController = require('../controllers/authController');
router.get('/', checkLogin, authController.getLogin);
router.get('/login', checkLogin, authController.getLogin);
router.post('/login', authController.postLogin);

module.exports = router;
