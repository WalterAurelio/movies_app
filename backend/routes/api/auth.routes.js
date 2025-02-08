const express = require('express');
const router = express.Router();
const { registerUser, login, logout, refresh } = require('../../controllers/auth.controller');

router.post('/register', registerUser);
router.post('/login', login);
router.get('/logout', logout);
router.get('/refresh-token', refresh);

module.exports = router;