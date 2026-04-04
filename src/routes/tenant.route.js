const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
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

router.get('/payments', (req, res) => {
  const { tenantInvoices } = require('../data/mockData');
  
  res.render('tenant/payments', { 
    layout: 'tenant',
    invoices: tenantInvoices,
    isPayments: true 
  });
});

module.exports = router;