const RoomState = require('./RoomState');

class MaintenanceState extends RoomState {
  getStatus() {
    return 'Maintenance';
  }

  canRent() {
    return false;
  }

  canMaintain() {
    return true;
  }

  canDelete() {
    return false;
  }

  rent() {
    throw new Error('Cannot rent room under maintenance');
  }

  release() {
  }

  startMaintenance() {
  }

  endMaintenance() {
    this.room.setState(new (require('./AvailableState'))(this.room));
  }
}

module.exports = MaintenanceState;