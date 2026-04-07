const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');

//router.get('/', homeController.home);

router.get('/profile', homeController.getProfile);
router.post('/profile/update', homeController.updateProfile);
module.exports = router;
