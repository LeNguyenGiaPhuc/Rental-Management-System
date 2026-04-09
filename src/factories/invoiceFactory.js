const db = require('../config/db');

class InvoiceFactory {
  static async create(roomId, oldIndex, newIndex, dueDate) {
    const room = await db('rooms').where({ id: roomId }).first();
    if (!room) {
        throw new Error("Room not found");
    }
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
        otherFee += Number(r.estimated_cost);
      }
    });
    const total = roomPrice + electricity + otherFee;
    return {
      invoice_code: "INV-" + Date.now(),
      room_id: roomId,
      tenant_id: room.tenant_id,
      room_price: roomPrice,      
      electricity_old: oldIdx,    
      electricity_new: newIdx,    
      electricity_cost: electricity,
      other_cost: otherFee,
      amount: total,
      due_date: dueDate,
      status: 'Pending',
      created_at: new Date()
    };
  }
}

module.exports = InvoiceFactory;