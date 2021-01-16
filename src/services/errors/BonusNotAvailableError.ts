import BaseHttpError from './BaseHttpError';

class BonusNotAvailableError extends BaseHttpError {
  constructor(id: string) {
    super(
      403,
      'BONUS_NOT_AVAILABLE',
      `The bonus with id "${id}" is not available anymore`,
    );
  }
}

export default BonusNotAvailableError;
