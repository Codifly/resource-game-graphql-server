import { Service } from 'typedi';
import { getRepository, Repository } from 'typeorm';

import Mine from '../graphql/resources/mine/Mine';

@Service()
class MineRepository {
  repository: Repository<Mine>;

  constructor() {
    this.repository = getRepository(Mine);
  }

  create(mine?: Mine) {
    return this.repository.save(mine || new Mine());
  }

  update(mine: Mine) {
    return this.repository.save(mine);
  }

  getByUserId(userId: string) {
    return this.repository.findOne({
      where: {
        userId,
      },
    });
  }
}

export default MineRepository;
