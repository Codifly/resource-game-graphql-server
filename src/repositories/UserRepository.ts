import { Service } from 'typedi';
import { getRepository, Not, Repository } from 'typeorm';

import User from '../graphql/users/User';

@Service()
class UserRepository {
  repository: Repository<User>;

  constructor() {
    this.repository = getRepository(User);
  }

  create(user: User) {
    return this.repository.save(user);
  }

  update(user: User) {
    return this.repository.save(user);
  }

  getUserById(id: string, relations?: string[]) {
    return this.repository.findOne({
      relations,
      where: {
        id,
      },
    });
  }

  getUserByName(username: string, relations?: string[]) {
    return this.repository.findOne({
      relations,
      where: {
        username,
      },
    });
  }

  getOtherUsers(id: string) {
    return this.repository.find({
      where: {
        id: Not(id),
      },
    });
  }

  getUsers(relations?: string[]) {
    return this.repository.find({
      relations,
    });
  }
}

export default UserRepository;
