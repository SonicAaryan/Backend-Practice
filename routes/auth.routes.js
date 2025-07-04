const express = require('express');
const router = express.Router()
const auth = require('../controllers/auth.controller');
const verfiyToken = require('../middlewares/auth');

router.post('/register', auth.register);
router.post('/login', auth.login);
router.get('/profile', verfiyToken, auth.getProfile);

module.exports = router;