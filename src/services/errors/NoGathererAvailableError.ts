import BaseHttpError from './BaseHttpError';

class NoGathererError extends BaseHttpError {
  constructor(type: string, worker: string) {
    super(
      403,
      'NO_GATHERER_ERROR',
      `Your "${type}" has no ${worker} yet. Buy one first.`,
    );
  }
}

export default NoGathererError;
