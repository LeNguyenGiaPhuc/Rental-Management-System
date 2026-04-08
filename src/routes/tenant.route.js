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
const RequestService = require('../services/requestService');

router.use(auth.ensureAuthenticated, auth.ensureRole('Tenant'));

router.get('/', (req, res) => {
  res.redirect('/tenant/requests');
});

router.get('/requests', async (req, res) => {
  try {
    const requests = await RequestService.getAllRequests();

    res.render('tenant/requests', {
      layout: 'tenant',
      requests,
      isRequests: true
    });
  } catch (error) {
    console.error('Error loading tenant requests:', error.message || error);
    res.status(500).send('Lỗi server!');
  }
});

router.post('/requests', async (req, res) => {
  const { type, priority, title, description, estimatedCost } = req.body;
  const tenantId = req.session?.user?.id || null;
  const tenantName = req.session?.user?.full_name || 'Tenant';

  try {
    await RequestService.createRequest({
      tenantId,
      tenant: tenantName,
      type,
      priority,
      title,
      description,
      estimatedCost: Number(estimatedCost) || 0,
      room: null
    });
  } catch (error) {
    console.error('Failed to create tenant request:', error.message || error);
  }

  res.redirect('/tenant/requests');
});

router.get('/rooms', async (req, res) => {
  try {
    const tenantId = req.session.user.id;

    // phòng hiện tại
    const currentRoom = await db('rooms')
      .where({ tenant_id: tenantId })
      .first();

    // phòng trống
    const availableRooms = await db('rooms')
      .where({ status: 'Available' });

    res.render('tenant/rooms', {
      layout: 'tenant',
      currentRoom,
      availableRooms,
      isRooms: true
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi server");
  }
});

router.get('/payments', async (req, res) => {
  try {
    const invoices = await db('invoices')
      .join('rooms', 'invoices.room_id', '=', 'rooms.id') // Nối bảng rooms
      .where({ 'invoices.tenant_id': req.session.user.id }) // Nhớ thêm prefix 'invoices.' để tránh lỗi trùng lặp cột
      .select('invoices.*', 'rooms.room_number') // Lấy toàn bộ invoice và thêm room_number
      .orderBy('invoices.created_at', 'desc');

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
router.post('/profile/update', upload.single('avatar'), homeController.updateProfile);

router.post('/payments/confirm', tenantController.confirmPayment);
module.exports = router;