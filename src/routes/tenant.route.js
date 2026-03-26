const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

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

router.get('/payments', (req, res) => {
  const { tenantInvoices } = require('../data/mockData');
  
  res.render('tenant/payments', { 
    layout: 'tenant',
    invoices: tenantInvoices,
    isPayments: true 
  });
});

module.exports = router;