const db = require('../config/db');
const RoomFactory = require('../factories/roomFactory');
const { loggingDecorator } = require('../utils/roomDecorators');

class RoomService {

  static async createRoom(roomData, fileData) {
    const existingRoom = await db('rooms')
      .where('room_number', roomData.room_number)
      .first();

    if (existingRoom) {
      throw new Error("Room number already exists!");
    }

    let imageUrl = null;
    if (fileData) {
      imageUrl = '/uploads/' + fileData.filename;
    }

    const newRoom = RoomFactory.create(roomData, imageUrl);

    const [insertedRoom] = await db('rooms')
      .insert(newRoom.toPlainObject())
      .returning('*');

    return RoomFactory.fromDatabase(insertedRoom);
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
        throw new Error("Floor must be between 1 and 6!");
      }

      if (fileData) {
        updatedFields.image_url = '/uploads/' + fileData.filename;
      }

      const [updatedRoomData] = await db('rooms')
        .where('room_number', roomId)
        .update(updatedFields)
        .returning('*');

      return RoomFactory.fromDatabase(updatedRoomData);

      return updatedRoom;

    } catch (error) {
      throw new Error("Error updating room!");
    }
  }
    static async deleteRoom(roomId) {
    try {
      const roomData = await db('rooms')
        .where('room_number', roomId)
        .first();

      if (!roomData) {
        throw new Error("Room does not exist!");
      }

      const room = RoomFactory.fromDatabase(roomData);

      if (!room.canDelete()) {
        throw new Error("Cannot delete room in its current status!");
      }

      await db('rooms')
        .where('room_number', roomId)
        .del();

      return true;

    } catch (error) {
      throw new Error("Error deleting room!");
    }
  }

  static async rentRoom(roomId) {
    try {
      const roomData = await db('rooms')
        .where('room_number', roomId)
        .first();

      if (!roomData) {
        throw new Error("Room does not exist!");
      }

      const room = RoomFactory.fromDatabase(roomData);
      room.rent();

      const updatedData = room.toPlainObject();
      await db('rooms')
        .where('room_number', roomId)
        .update({ status: updatedData.status });

      return room;
    } catch (error) {
      throw new Error("Error renting room!");
    }
  }

  static async releaseRoom(roomId) {
    try {
      const roomData = await db('rooms')
        .where('room_number', roomId)
        .first();

      if (!roomData) {
        throw new Error("Room does not exist!");
      }

      const room = RoomFactory.fromDatabase(roomData);
      room.release();

      const updatedData = room.toPlainObject();
      await db('rooms')
        .where('room_number', roomId)
        .update({ status: updatedData.status });

      return room;
    } catch (error) {
      throw new Error("Error releasing room!");
    }
  }

  static async startMaintenance(roomId) {
    try {
      const roomData = await db('rooms')
        .where('room_number', roomId)
        .first();

      if (!roomData) {
        throw new Error("Room does not exist!");
      }

      const room = RoomFactory.fromDatabase(roomData);
      room.startMaintenance();

      const updatedData = room.toPlainObject();
      await db('rooms')
        .where('room_number', roomId)
        .update({ status: updatedData.status });

      return room;
    } catch (error) {
      throw new Error("Error starting maintenance!");
    }
  }

  static async endMaintenance(roomId) {
    try {
      const roomData = await db('rooms')
        .where('room_number', roomId)
        .first();

      if (!roomData) {
        throw new Error("Room does not exist!");
      }

      const room = RoomFactory.fromDatabase(roomData);
      room.endMaintenance();

      const updatedData = room.toPlainObject();
      await db('rooms')
        .where('room_number', roomId)
        .update({ status: updatedData.status });

      return room;
    } catch (error) {
      throw new Error("Error ending maintenance!");
    }
  }
}

const Decorated = {
  createRoom: loggingDecorator(RoomService.createRoom, 'roomService.createRoom'),
  updateRoom: loggingDecorator(RoomService.updateRoom, 'roomService.updateRoom'),
  deleteRoom: loggingDecorator(RoomService.deleteRoom, 'roomService.deleteRoom'),
  rentRoom: loggingDecorator(RoomService.rentRoom, 'roomService.rentRoom'),
  releaseRoom: loggingDecorator(RoomService.releaseRoom, 'roomService.releaseRoom'),
  startMaintenance: loggingDecorator(RoomService.startMaintenance, 'roomService.startMaintenance'),
  endMaintenance: loggingDecorator(RoomService.endMaintenance, 'roomService.endMaintenance'),
  
  Raw: RoomService
};

module.exports = Decorated;