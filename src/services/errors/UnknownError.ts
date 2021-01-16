import BaseHttpError from './BaseHttpError';

class UnknownError extends BaseHttpError {
  constructor() {
    super(500, 'UNKNOWN_ERROR', 'An unknown error occured');
  }
}

export default UnknownError;
