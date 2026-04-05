const data = require('../data/mockData');
const PaymentContext = require('../services/paymentService');
const db = require('../config/db');


exports.requestPage = (req, res) => {
    res.render('tenant/request', {
        requests: data.requests
    });
};

exports.createRequest = (req, res) => {
    const { type, priority, title, description } = req.body;

    const newRequest = {
        id: data.requests.length + 1,
        type,
        title,
        description,
        priority,
        status: "In Progress",
        created_at: new Date().toISOString().split('T')[0]
    };

    data.requests.push(newRequest);

    res.redirect('/tenant/request');
};


exports.processPayment = async (req, res) => {
    try {
        const { roomId, oldIndex, newIndex, paymentMethod } = req.body;

        const room = await db('rooms').where({ id: roomId }).first();
        if (!room) return res.status(404).send("Không tìm thấy phòng");

        const payment = new PaymentContext(paymentMethod);
        const result = payment.execute(room.price, oldIndex, newIndex);

        res.render('tenant/payment-result', { 
            layout: 'tenant',
            result: result 
        });
    } catch (err) {
        console.error(err);
        res.redirect('/tenant/payments?error=true');
    }
};

exports.confirmPayment = async (req, res) => {
    try {
        const { invoiceId, paymentMethod } = req.body;

        // 1. Lấy thông tin hóa đơn từ DB
        const invoice = await db('invoices').where({ id: invoiceId }).first();
        if (!invoice) return res.status(404).send("Không thấy hóa đơn");

        // 2. Sử dụng Strategy Pattern xử lý thông báo/giao dịch
        const paymentContext = new PaymentContext(paymentMethod);
        const result = paymentContext.execute(invoice.amount);

        console.log(result);

        // 3. Cập nhật trạng thái thành 'Paid' 
        await db('invoices')
            .where({ id: invoiceId })
            .update({ 
                status: 'Paid',
                payment_method: paymentMethod,
            });

        // 4. Redirect lại trang payments
        res.redirect('/tenant/payments?success=true');

    } catch (err) {
        console.error("Lỗi thanh toán:", err);
        res.redirect('/tenant/payments?error=true');
    }
};