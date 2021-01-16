import { Service } from 'typedi';
import { getRepository, Repository } from 'typeorm';

import Smithy from '../graphql/resources/smithy/Smithy';

@Service()
class SmithyRepository {
  repository: Repository<Smithy>;

  constructor() {
    this.repository = getRepository(Smithy);
  }

  create(smithy?: Smithy) {
    return this.repository.save(smithy || new Smithy());
  }

  update(smithy: Smithy) {
    return this.repository.save(smithy);
  }

  getByUserId(userId: string) {
    return this.repository.findOne({
      where: {
        userId,
      },
    });
  }
}

export default SmithyRepository;
