class RoomFactory {
  static create(roomData, imageUrl = null) {
    if (!roomData.room_number || !roomData.floor || !roomData.price) {
      throw new Error("Thiếu dữ liệu phòng!");
    }

    const floor = parseInt(roomData.floor);
    if (floor < 1 || floor > 6) {
      throw new Error("Số tầng không hợp lệ!");
    }

    return {
      room_number: roomData.room_number,
      floor: floor,
      price: parseFloat(roomData.price),
      status: roomData.status || 'Available',
      description: roomData.description || '',
      image_url: imageUrl
    };
  }
}

module.exports = RoomFactory;