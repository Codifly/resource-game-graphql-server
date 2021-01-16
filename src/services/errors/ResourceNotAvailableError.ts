import BaseHttpError from './BaseHttpError';

class ResourceNotAvailableError extends BaseHttpError {
  constructor() {
    super(
      403,
      'RESOURCE_NOT_AVAILABLE',
      'The resource you are trying to gather is not available yet',
    );
  }
}

export default ResourceNotAvailableError;
