const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const homeController = require('../controllers/home.controller');
const tenantController = require('../controllers/tenant.controller');
const db = require("../config/db");

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, "avatar-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.use(auth.ensureAuthenticated, auth.ensureRole('Tenant'));

router.get('/', (req, res) => {
  res.redirect('/tenant/requests');
});

router.get('/requests', (req, res) => {
  const { tenantRequests } = require('../data/mockData');

  res.render('tenant/requests', { 
    layout: 'tenant', 
    requests: tenantRequests,
    isRequests: true
  });
});

router.get('/rooms', (req, res) => {
  const { currentRoom, adminRooms } = require('../data/mockData');
  
  const availableRooms = adminRooms.filter(room => room.status === 'Available');

  res.render('tenant/rooms', { 
    layout: 'tenant',
    currentRoom,
    availableRooms,
    isRooms: true 
  });
});

router.get('/payments', async (req, res) => {
  try {
        const invoices = await db('invoices')
            .where({ tenant_id: req.session.user.id }) // nếu có
            .orderBy('created_at', 'desc');

        res.render('tenant/payments', {
            layout: 'tenant',
            invoices: invoices,
            isPayments: true
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Lỗi server");
    }
});

// PROFILE
router.get('/profile', homeController.getProfile);
router.post('/profile/update',upload.single('avatar'), homeController.updateProfile);

router.post('/payments/confirm', tenantController.confirmPayment);
module.exports = router;