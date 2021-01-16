import { Service } from 'typedi';
import { getRepository, MoreThan, Repository } from 'typeorm';

import Bonus from '../graphql/bonus/Bonus';

@Service()
class BonusRepository {
  repository: Repository<Bonus>;

  constructor() {
    this.repository = getRepository(Bonus);
  }

  create(bonus?: Bonus) {
    return this.repository.save(bonus || new Bonus());
  }

  update(bonus: Bonus) {
    return this.repository.save(bonus);
  }

  getBonusById(id: string) {
    return this.repository.findOne({
      where: {
        id,
      },
    });
  }

  getAvailableBonuses() {
    return this.repository.find({
      where: {
        availableUntil: MoreThan(new Date()),
      },
    });
  }
}

export default BonusRepository;
