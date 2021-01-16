import BaseHttpError from './BaseHttpError';

class NotFoundError extends BaseHttpError {
  constructor(message: string) {
    super(404, 'NOT_FOUND', message);
  }
}

export default NotFoundError;
