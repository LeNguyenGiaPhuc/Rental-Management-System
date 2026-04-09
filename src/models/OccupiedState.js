const RoomState = require('./RoomState');

class OccupiedState extends RoomState {
  getStatus() {
    return 'Occupied';
  }

  canRent() {
    return false;
  }

  canMaintain() {
    return false;
  }

  canDelete() {
    return false;
  }

  rent() {
    throw new Error('Room is already occupied');
  }

  release() {
    this.room.setState(new (require('./AvailableState'))(this.room));
  }

  startMaintenance() {
    throw new Error('Cannot start maintenance on occupied room');
  }

  endMaintenance() {
  }
}

module.exports = OccupiedState;