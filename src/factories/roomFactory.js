const Room = require('../models/Room');

class RoomFactory {
  static create(roomData, imageUrl = null) {
    if (!roomData.room_number || !roomData.floor || !roomData.price) {
      throw new Error("Missing room data!");
    }

    const floor = parseInt(roomData.floor);
    if (floor < 1 || floor > 6) {
      throw new Error("Invalid floor number!");
    }

    const roomObj = {
      room_number: roomData.room_number,
      floor: floor,
      price: parseFloat(roomData.price),
      status: roomData.status || 'Available',
      description: roomData.description || '',
      image_url: imageUrl
    };

    return new Room(roomObj);
  }

  static fromDatabase(data) {
    return new Room(data);
  }
}

module.exports = RoomFactory;