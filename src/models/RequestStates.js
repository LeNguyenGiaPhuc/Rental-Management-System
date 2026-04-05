const RequestState = require('./RequestState');

class PendingState extends RequestState {
  startProcessing(request) {
    request.setState(new InProgressState());
  }

  complete(request) {
    throw new Error('Cannot complete request directly from Pending. Start processing first.');
  }

  getStatus() {
    return 'Pending';
  }
}

class InProgressState extends RequestState {
  startProcessing(request) {
    throw new Error('Request is already in progress.');
  }

  complete(request) {
    request.setState(new CompletedState());
  }

  getStatus() {
    return 'In Progress';
  }
}

class CompletedState extends RequestState {
  startProcessing(request) {
    throw new Error('Request is already completed.');
  }

  complete(request) {
    throw new Error('Request is already completed.');
  }

  getStatus() {
    return 'Completed';
  }
}

module.exports = {
  PendingState,
  InProgressState,
  CompletedState
};
