const AvailableState = require('./AvailableState');
const OccupiedState = require('./OccupiedState');
const MaintenanceState = require('./MaintenanceState');

class Room {
  constructor(data) {
    this.id = data.id;
    this.room_number = data.room_number;
    this.floor = data.floor;
    this.price = data.price;
    this.description = data.description || '';
    this.image_url = data.image_url;
    this.created_at = data.created_at;

    // Set initial state based on status
    this.setStateFromStatus(data.status || 'Available');
  }

  setStateFromStatus(status) {
    switch (status) {
      case 'Available':
        this.state = new AvailableState(this);
        break;
      case 'Occupied':
        this.state = new OccupiedState(this);
        break;
      case 'Maintenance':
        this.state = new MaintenanceState(this);
        break;
      default:
        this.state = new AvailableState(this);
    }
  }

  setState(state) {
    this.state = state;
  }

  getStatus() {
    return this.state.getStatus();
  }

  canRent() {
    return this.state.canRent();
  }

  canMaintain() {
    return this.state.canMaintain();
  }

  canDelete() {
    return this.state.canDelete();
  }

  rent() {
    this.state.rent();
  }

  release() {
    this.state.release();
  }

  startMaintenance() {
    this.state.startMaintenance();
  }

  endMaintenance() {
    this.state.endMaintenance();
  }

  // Convert to plain object for database/storage
  toPlainObject() {
    return {
      id: this.id,
      room_number: this.room_number,
      floor: this.floor,
      price: this.price,
      status: this.getStatus(),
      description: this.description,
      image_url: this.image_url,
      created_at: this.created_at
    };
  }
}

module.exports = Room;