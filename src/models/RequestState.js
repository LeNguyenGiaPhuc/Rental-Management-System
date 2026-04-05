class RequestState {
  startProcessing(request) {
    throw new Error(`Cannot start processing request when status is ${this.getStatus()}`);
  }

  complete(request) {
    throw new Error(`Cannot complete request when status is ${this.getStatus()}`);
  }

  getStatus() {
    throw new Error('getStatus() must be implemented by concrete state');
  }
}

module.exports = RequestState;
