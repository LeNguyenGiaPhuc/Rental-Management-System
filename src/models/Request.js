const { PendingState, InProgressState, CompletedState } = require('./RequestStates');

class Request {
  constructor({
    id,
    tenantId,
    tenant,
    type,
    priority,
    title,
    description,
    estimatedCost,
    status,
    createdAt,
    date,
    room
  } = {}) {
    this.id = id;
    this.tenantId = tenantId;
    this.tenant = tenant;
    this.type = type;
    this.priority = priority;
    this.title = title;
    this.description = description;
    this.estimatedCost = estimatedCost || 0;
    this.createdAt = createdAt || new Date().toISOString();
    this.date = date || this.createdAt.split('T')[0];
    this.room = room;
    this.status = status || 'Pending';
    this.state = Request.getState(this.status);
  }

  static getState(status) {
    if (status === 'In Progress') {
      return new InProgressState();
    }
    if (status === 'Completed') {
      return new CompletedState();
    }
    return new PendingState();
  }

  setState(state) {
    this.state = state;
    this.status = state.getStatus();
  }

  startProcessing() {
    this.state.startProcessing(this);
  }

  complete() {
    this.state.complete(this);
  }

  getStatus() {
    return this.state.getStatus();
  }

  toRaw() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      tenant: this.tenant,
      type: this.type,
      priority: this.priority,
      title: this.title,
      description: this.description,
      estimatedCost: this.estimatedCost,
      status: this.status,
      createdAt: this.createdAt,
      date: this.date,
      room: this.room
    };
  }

  static createNew({ id, tenantId, tenant, type, priority, title, description, estimatedCost, room }) {
    return new Request({
      id,
      tenantId,
      tenant,
      type,
      priority,
      title,
      description,
      estimatedCost: estimatedCost || 0,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      room,
      date: new Date().toISOString().split('T')[0]
    });
  }
}

module.exports = Request;
