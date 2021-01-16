import BaseHttpError from './BaseHttpError';

class NotEnoughMoneyError extends BaseHttpError {
  constructor() {
    super(
      403,
      'NOT_ENOUGH_MONEY',
      'You do not have enough money to peform this action',
    );
  }
}

export default NotEnoughMoneyError;
