import jwt from 'jsonwebtoken';
import { Service } from 'typedi';

import LoginInput from '../graphql/users/LoginInput';
import User from '../graphql/users/User';
import LumberyardRepository from '../repositories/LumberyardRepository';
import MineRepository from '../repositories/MineRepository';
import SmithyRepository from '../repositories/SmithyRepository';
import UserRepository from '../repositories/UserRepository';
import compareHash from '../utils/compareHash';
import generateHash from '../utils/generateHash';
import generateSalt from '../utils/generateSalt';
import NotFoundError from './errors/NotFoundError';
import UnauthorizedError from './errors/UnauthorizedError';

const SECRET: string = process.env.SECRET || 'SuP3r-s3Cr3T';

@Service()
class UserService {
  constructor(
    private userRepository: UserRepository,
    private smithyRepository: SmithyRepository,
    private mineRepository: MineRepository,
    private lumberyardRepository: LumberyardRepository,
  ) {}

  async getUser(id: string) {
    const user = await this.userRepository.getUserById(id, [
      'mine',
      'lumberyard',
      'smithy',
    ]);
    if (!user) {
      throw new NotFoundError(`Could not find user with id "${id}"`);
    }
    return user;
  }

  async getUsers() {
    return this.userRepository.getUsers(['mine', 'lumberyard', 'smithy']);
  }

  async login(args: LoginInput) {
    const { username, password } = args;

    let user = await this.userRepository.getUserByName(username);

    // If the user does not exist, register him.
    if (!user) {
      const salt = generateSalt();
      const hash = generateHash(password, salt);

      user = new User(username, salt, hash);
      user.mineId = (await this.mineRepository.create()).id;
      user.smithyId = (await this.smithyRepository.create()).id;
      user.lumberyardId = (await this.lumberyardRepository.create()).id;

      user = await this.userRepository.create(user);
    }

    // User exists now, check password hash.
    const { salt, hash } = user;
    const validCredentials = compareHash(password, salt, hash);

    // If credentials are wrong, throw error.
    if (!validCredentials) {
      throw new UnauthorizedError();
    }

    // If credentials correct, generate and return jwt token.
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, {
      expiresIn: '30d',
    });

    return { token };
  }
}

export default UserService;
