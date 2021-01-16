import BaseHttpError from './BaseHttpError';

class LevelTooHighError extends BaseHttpError {
  constructor() {
    super(403, 'LEVEL_TOO_HIGH', `Your level in this resource is already 5`);
  }
}

export default LevelTooHighError;
