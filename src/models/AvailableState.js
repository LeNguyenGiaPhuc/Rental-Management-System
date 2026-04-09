const RoomState = require('./RoomState');

class AvailableState extends RoomState {
  getStatus() {
    return 'Available';
  }

  canRent() {
    return true;
  }

  canMaintain() {
    return true;
  }

  canDelete() {
    return true;
  }

  rent() {
    this.room.setState(new (require('./OccupiedState'))(this.room));
  }

  release() {
    // Already available, do nothing
  }

  startMaintenance() {
    this.room.setState(new (require('./MaintenanceState'))(this.room));
  }

  endMaintenance() {
    // Not in maintenance, do nothing
  }
}

module.exports = AvailableState;