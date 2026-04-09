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
    return false; // Maybe allow, but for now false
  }

  rent() {
    throw new Error('Cannot rent room under maintenance');
  }

  release() {
    // Not applicable
  }

  startMaintenance() {
    // Already in maintenance, do nothing
  }

  endMaintenance() {
    this.room.setState(new (require('./AvailableState'))(this.room));
  }
}

module.exports = MaintenanceState;