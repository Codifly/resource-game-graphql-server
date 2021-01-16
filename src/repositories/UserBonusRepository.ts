import { Service } from 'typedi';
import { getRepository, MoreThan, Repository } from 'typeorm';

import UserBonus from '../graphql/bonus/UserBonus';

@Service()
class UserBonusRepository {
  repository: Repository<UserBonus>;

  constructor() {
    this.repository = getRepository(UserBonus);
  }

  create(userBonus: UserBonus) {
    return this.repository.save(userBonus);
  }

  createMany(userBonuses: UserBonus[]) {
    return this.repository.save(userBonuses);
  }

  getActiveBonusesByUserId(id: string, relations?: string[]) {
    return this.repository.find({
      relations,
      where: {
        userId: id,
        activeUntil: MoreThan(new Date()),
      },
    });
  }

  getAllBonusesByUserId(id: string, relations?: string[]) {
    return this.repository.find({
      relations,
      where: {
        userId: id,
      },
    });
  }
}

export default UserBonusRepository;
