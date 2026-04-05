const db = require('../config/db'); 
const PaymentContext = require('../services/paymentService');

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
        res.status(500).send("Lỗi tải danh sách tài khoản");
    }
};

exports.rooms = async (req, res) => {
    try {
        const rooms = await db('rooms').select('*').orderBy('room_number', 'asc');
        res.render('admin/rooms', { 
            layout: 'admin',
            rooms 
        });
    } catch (err) {
        res.status(500).send("Lỗi tải danh sách phòng");
    }
};

exports.createInvoice = async (req, res) => {
  try {
    const { room, amount, dueDate, description } = req.body;

    const roomData = await db('rooms').where({ id: room }).first();
    if (!roomData) return res.status(404).send("Room not found");

    const invoiceCode = "INV-" + Date.now();

    await db('invoices').insert({
      invoice_code: invoiceCode,   
      room_id: room,
      tenant_id: roomData.tenant_id,
      amount: amount,
      due_date: dueDate,
      description: description,
      status: 'Pending',
      created_at: new Date()
    });

    res.redirect('/admin/payments?success=true');

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.redirect('/admin/payments?error=true');
  }
};