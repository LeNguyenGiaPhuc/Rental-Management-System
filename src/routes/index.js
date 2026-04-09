const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.use('/auth', require('./auth.route'));
router.use('/admin', require('./admin.route'));
router.use('/tenant', require('./tenant.route'));
router.use('/', require('./home.route'));

router.get('/', async (req, res) => {
  try {
    const floorQuery = req.query.floor || 'all';
    const statusQuery = req.query.status || 'all';
    const sortPrice = req.query.sortPrice || 'default';
    
    let query = db('rooms').select('*');

    if (floorQuery !== 'all') {
      query = query.where('floor', floorQuery);
    }

    if (statusQuery !== 'all') {
      query = query.where('status', statusQuery);
    }

    if (sortPrice === 'asc') {
      query = query.orderBy('price', 'asc');
    } else if (sortPrice === 'desc') {
      query = query.orderBy('price', 'desc');
    } else {
      query = query.orderBy('room_number', 'asc');
    }

    const rooms = await query;

    const formattedRooms = rooms.map(room => ({
      id: room.room_number,
      floor: room.floor,
      price: room.price,
      status: room.status,
      image: room.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      description: room.description
    }));

    res.render('home/index', { 
      layout: 'main', 
      rooms: formattedRooms,
      currentFloor: floorQuery,
      currentStatus: statusQuery,
      currentSort: sortPrice
    });

  } catch (err) {
    console.error("Error fetching room data:", err);
    res.status(500).send("Server error!");
  }
});

router.get('/room/:id', async (req, res) => {
  try {
    const roomId = req.params.id; 

    const room = await db('rooms').where('room_number', roomId).first();

    if (!room) {
      return res.status(404).send('This room could not be found!');
    }

    let tenantName = null;
    if (room.status === 'Occupied') {
      const contract = await db('contracts')
        .join('users', 'contracts.tenant_id', '=', 'users.id')
        .where('contracts.room_id', room.id)
        .andWhere('contracts.status', 'Active')
        .select('users.full_name')
        .first();
      
      if (contract) {
        tenantName = contract.full_name;
      }
    }

    const formattedRoom = {
      id: room.room_number,
      floor: room.floor,
      price: room.price,
      status: room.status,
      image: room.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
      description: room.description,
      tenantName: tenantName
    };

    res.render('home/room-detail', { 
      layout: 'main', 
      room: formattedRoom 
    });

  } catch (err) {
    console.error("Error fetching room details:", err);
    res.status(500).send("Server error!");
  }
});

router.post('/contact-landlord', async (req, res) => {
  try {
    const { guest_name, guest_phone, room_number } = req.body;
    const room = await db('rooms').where('room_number', room_number).first();
    if (room) {
      await db('guest_contacts').insert({
        guest_name,
        guest_phone,
        room_id: room.id
      });
    }
res.send(`<script>alert('Request sent successfully! Our admin will contact you shortly.'); window.location.href='/room/${room_number}';</script>`);  } catch (err) {
    console.error("Error sending contact request:", err);
    res.status(500).send("Server error!");
  }
});

module.exports = router;