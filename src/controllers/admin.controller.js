const InvoiceFactory = require('../factories/invoiceFactory'); 
const db = require('../config/db'); 
const PaymentContext = require('../services/paymentService');
const RoomFactory = require('../factories/roomFactory');

exports.accounts = async (req, res) => {
    try {
        const accounts = await db('users').select('*').orderBy('created_at', 'desc');
        res.render('admin/accounts', {
            layout: 'admin',
            accounts,
            isAccounts: true
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading account list");
    }
};

exports.rooms = async (req, res) => {
    try {
        const roomsData = await db('rooms').select('*').orderBy('room_number', 'asc');
        const rooms = roomsData.map(roomData => RoomFactory.fromDatabase(roomData));
        res.render('admin/rooms', { 
            layout: 'admin',
            rooms: rooms.map(room => room.toPlainObject())
        });
    } catch (err) {
        res.status(500).send("Error loading room list");
    }
};

exports.createInvoice = async (req, res) => {
  try {
    const { roomId, oldIndex, newIndex, dueDate } = req.body;
    const newInvoice = await InvoiceFactory.create(roomId, oldIndex, newIndex, dueDate);
    await db('invoices').insert(newInvoice);
    await db('requests')
      .where({ tenant_id: newInvoice.tenant_id, status: 'Completed' })
      .update({ is_billed: true });

    console.log("Invoice created successfully for tenant:", newInvoice.tenant_id);
    res.redirect('/admin/payments?success=true');

  } catch (err) {
    console.error("Error creating invoice:", err.message);
    res.redirect('/admin/payments?error=true');
  }
};