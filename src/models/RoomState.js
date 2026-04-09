class RoomState {
  constructor(room) {
    this.room = room;
  }

  // Abstract methods
  canRent() {
    throw new Error('canRent method must be implemented');
  }

  canMaintain() {
    throw new Error('canMaintain method must be implemented');
  }

  canDelete() {
    throw new Error('canDelete method must be implemented');
  }

  getStatus() {
    throw new Error('getStatus method must be implemented');
  }

  // Transition methods
  rent() {
    throw new Error('rent method must be implemented');
  }

  release() {
    throw new Error('release method must be implemented');
  }

  startMaintenance() {
    throw new Error('startMaintenance method must be implemented');
  }

  endMaintenance() {
    throw new Error('endMaintenance method must be implemented');
  }
}

module.exports = RoomState;