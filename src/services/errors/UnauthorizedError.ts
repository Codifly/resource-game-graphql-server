import BaseHttpError from './BaseHttpError';

class UnauthorizedError extends BaseHttpError {
  constructor() {
    super(401, 'UNAUTHORIZED', 'Unauthorized');
  }
}

export default UnauthorizedError;
