const db = require('../config/db');
const RoomFactory = require('../factories/roomFactory');

class RoomService {

  static async createRoom(roomData, fileData) {
    const existingRoom = await db('rooms')
      .where('room_number', roomData.room_number)
      .first();

    if (existingRoom) {
      throw new Error("Số phòng đã tồn tại!");
    }

    let imageUrl = null;
    if (fileData) {
      imageUrl = '/uploads/' + fileData.filename;
    }

    const newRoom = RoomFactory.create(roomData, imageUrl);

    const [insertedRoom] = await db('rooms')
      .insert(newRoom)
      .returning('*');

    return insertedRoom;
  }

  static async updateRoom(roomId, updateData, fileData) {
    try {
      const updatedFields = {
        floor: parseInt(updateData.floor),
        price: parseFloat(updateData.price),
        status: updateData.status,
        description: updateData.description || ''
      };

      if (updatedFields.floor < 1 || updatedFields.floor > 6) {
        throw new Error("Số tầng phải từ 1 đến 6!");
      }

      if (fileData) {
        updatedFields.image_url = '/uploads/' + fileData.filename;
      }

      const [updatedRoom] = await db('rooms')
        .where('room_number', roomId)
        .update(updatedFields)
        .returning('*');

      return updatedRoom;

    } catch (error) {
      throw new Error("Lỗi khi cập nhật phòng!");
    }
  }
    static async deleteRoom(roomId) {
    try {
      const room = await db('rooms')
        .where('room_number', roomId)
        .first();

      if (!room) {
        throw new Error("Phòng không tồn tại!");
      }

      if (room.status === 'Occupied') {
        throw new Error("Không thể xóa phòng đang có người thuê!");
      }

      await db('rooms')
        .where('room_number', roomId)
        .del();

      return true;

    } catch (error) {
      throw new Error("Lỗi khi xóa phòng!");
    }
  }
}

module.exports = RoomService;