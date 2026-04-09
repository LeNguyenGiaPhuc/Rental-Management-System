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
  res.redirect('/tenant/rooms');
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
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const pageSize = 4;
    const defaultImage = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80';

    // phòng hiện tại dựa trên hợp đồng đang active
    const currentRoomRow = await db('contracts')
      .join('rooms', 'contracts.room_id', 'rooms.id')
      .where('contracts.tenant_id', tenantId)
      .andWhere('contracts.status', 'Active')
      .select(
        'rooms.*',
        'contracts.start_date',
        'contracts.end_date'
      )
      .first();

    const currentRoom = currentRoomRow ? {
      room_number: currentRoomRow.room_number,
      floor: currentRoomRow.floor,
      price: currentRoomRow.price,
      status: currentRoomRow.status,
      image: currentRoomRow.image_url || defaultImage,
      description: currentRoomRow.description,
      location: `Floor ${currentRoomRow.floor}`,
      leaseStart: currentRoomRow.start_date ? new Date(currentRoomRow.start_date).toLocaleDateString('en-CA') : null,
      leaseEnd: currentRoomRow.end_date ? new Date(currentRoomRow.end_date).toLocaleDateString('en-CA') : null,
      amenities: currentRoomRow.description ? currentRoomRow.description.split(',').map(item => item.trim()) : [],
      landlord: 'Landlord',
      contact: req.session.user.email || req.session.user.phone || 'No contact'
    } : null;

    const [{ count }] = await db('rooms')
      .where({ status: 'Available' })
      .count('id as count');

    const totalRooms = parseInt(count, 10) || 0;
    const totalPages = Math.max(Math.ceil(totalRooms / pageSize), 1);
    const currentPage = Math.min(page, totalPages);

    const availableRooms = (await db('rooms')
      .where({ status: 'Available' })
      .orderBy('room_number', 'asc')
      .limit(pageSize)
      .offset((currentPage - 1) * pageSize))
      .map(room => ({
        room_number: room.room_number,
        floor: room.floor,
        price: room.price,
        status: room.status,
        image: room.image_url || defaultImage,
        description: room.description,
        location: `Floor ${room.floor}`
      }));

    res.render('tenant/rooms', {
      layout: 'tenant',
      currentRoom,
      availableRooms,
      isRooms: true,
      pagination: {
        currentPage,
        totalPages,
        pageSize,
        totalRooms,
        hasPrev: currentPage > 1,
        hasNext: currentPage < totalPages,
        prevPage: Math.max(currentPage - 1, 1),
        nextPage: Math.min(currentPage + 1, totalPages)
      }
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