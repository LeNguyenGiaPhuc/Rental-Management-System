const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.use('/auth', require('./auth.route'));
router.use('/admin', require('./admin.route'));
router.use('/tenant', require('./tenant.route'));
router.use('/', require('./home.route'));



module.exports = router;