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

/*exports.createInvoice = async (req, res) => {
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
};*/

exports.createInvoice = async (req, res) => {
  try {
    const { roomId, oldIndex, newIndex, dueDate } = req.body;

    const room = await db('rooms').where({ id: roomId }).first();
    if (!room) return res.status(404).send("Room not found");

    // ✅ Ép kiểu Number cho tất cả
    const roomPrice = Number(room.price);
    const oldIdx = Number(oldIndex);
    const newIdx = Number(newIndex);

    const electricityPrice = 4000;
    const electricity = (newIdx - oldIdx) * electricityPrice;

    const requests = await db('requests')
      .where({ tenant_id: room.tenant_id, status: 'Completed' });

    let otherFee = 0;
    requests.forEach(r => {
      if (r.estimated_cost) {
        otherFee += Number(r.estimated_cost); // ✅
      }
    });

    const total = roomPrice + electricity + otherFee; // ✅ cộng số thực

    await db('invoices').insert({
      invoice_code: "INV-" + Date.now(),
      room_id: roomId,
      tenant_id: room.tenant_id,

      room_price: room.price,      // ✅
      electricity_old: oldIdx,    // ✅
      electricity_new: newIdx,    // ✅
      electricity_cost: electricity,
      other_cost: otherFee,
      amount: total,

      due_date: dueDate,
      status: 'Pending',
      created_at: new Date()
    });

    await db('requests')
      .where({ tenant_id: room.tenant_id, status: 'Completed' })
      .update({ is_billed: true });
    console.log("tenant_id:", room.tenant_id);
    console.log("requests found:", requests);
    console.log("otherFee:", otherFee);
    res.redirect('/admin/payments?success=true');

  } catch (err) {
    console.error(err);
    res.redirect('/admin/payments?error=true');
  }
};