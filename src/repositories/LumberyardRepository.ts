import { Service } from 'typedi';
import { getRepository, Repository } from 'typeorm';

import Lumberyard from '../graphql/resources/lumberyard/Lumberyard';

@Service()
class LumberyardRepository {
  repository: Repository<Lumberyard>;

  constructor() {
    this.repository = getRepository(Lumberyard);
  }

  create(lumberyard?: Lumberyard) {
    return this.repository.save(lumberyard || new Lumberyard());
  }

  update(lumberyard: Lumberyard) {
    return this.repository.save(lumberyard);
  }

  getByUserId(userId: string) {
    return this.repository.findOne({
      where: {
        userId,
      },
    });
  }
}

export default LumberyardRepository;
