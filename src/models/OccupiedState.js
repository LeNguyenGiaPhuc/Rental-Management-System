const RoomState = require('./RoomState');

class OccupiedState extends RoomState {
  getStatus() {
    return 'Occupied';
  }

  canRent() {
    return false;
  }

  canMaintain() {
    return false; // Maybe allow maintenance, but for now false
  }

  canDelete() {
    return false;
  }

  rent() {
    // Already occupied, do nothing or throw error
    throw new Error('Room is already occupied');
  }

  release() {
    this.room.setState(new (require('./AvailableState'))(this.room));
  }

  startMaintenance() {
    // Maybe allow after release, but for now throw error
    throw new Error('Cannot start maintenance on occupied room');
  }

  endMaintenance() {
    // Not in maintenance, do nothing
  }
}

module.exports = OccupiedState;