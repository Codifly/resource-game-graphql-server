import moment from 'moment';
import { Service } from 'typedi';

import { Context } from '../global/GraphQL';
import {
  BonusTargetType,
  BonusTypeToTargetType,
} from '../graphql/bonus/BonusType';
import BuyBonusInput from '../graphql/bonus/BuyBonusInput';
import UserBonus from '../graphql/bonus/UserBonus';
import User from '../graphql/users/User';
import BonusRepository from '../repositories/BonusRepository';
import UserBonusRepository from '../repositories/UserBonusRepository';
import UserRepository from '../repositories/UserRepository';
import BonusNotAvailableError from './errors/BonusNotAvailableError';
import NotEnoughMoneyError from './errors/NotEnoughMoneyError';
import NotFoundError from './errors/NotFoundError';

@Service()
class BonusService {
  constructor(
    private bonusRepository: BonusRepository,
    private userBonusRepository: UserBonusRepository,
    private userRepository: UserRepository,
  ) {}

  async buyBonus(args: BuyBonusInput, ctx: Context) {
    const { id: bonusId } = args;
    const bonus = await this.bonusRepository.getBonusById(bonusId);
    if (!bonus) {
      throw new NotFoundError(`Could not find bonus with id "${bonusId}"`);
    }
    // Check if bonus "availableUntil" date lies in the future.
    const bonusIsAvailable = moment(bonus.availableUntil).isAfter(moment());
    if (!bonusIsAvailable) {
      throw new BonusNotAvailableError(bonusId);
    }

    const user = ctx.user!;
    const { id: userId } = user;

    const allUserBonuses = await this.userBonusRepository.getAllBonusesByUserId(
      userId,
      ['bonus'],
    );

    if (allUserBonuses.find(({ bonus: { id } }) => id === bonusId)) {
      throw new NotFoundError(`Could not find bonus with id "${bonusId}"`);
    }

    const { cost, duration, type } = bonus;

    if (user.balance < cost) {
      throw new NotEnoughMoneyError();
    }

    const newBalance = user.balance - cost;
    const activeUntil = moment().add(duration, 's').toDate();

    const target = BonusTypeToTargetType[type];
    let affectedUsers: User[];

    if (target === BonusTargetType.YOURSELF) {
      affectedUsers = [user];
      const userBonus = new UserBonus(activeUntil, userId, bonusId);
      await this.userRepository.update({
        ...user,
        balance: newBalance,
      });
      await this.userBonusRepository.create(userBonus);
    } else {
      // Bonus target is other players, we want to assign it to everyone else except yourself.
      // Make bonus unavailable for others.
      bonus.availableUntil = moment().subtract(1, 'second').toDate();
      await this.bonusRepository.update(bonus);

      const otherUsers = await this.userRepository.getOtherUsers(userId);
      affectedUsers = otherUsers;
      await this.userRepository.update({
        ...user,
        balance: newBalance,
      });
      const userBonuses = otherUsers.map(({ id: otherUserId }) => {
        return new UserBonus(activeUntil, otherUserId, bonusId);
      });
      await this.userBonusRepository.createMany(userBonuses);
    }

    return { success: true, affectedUsers };
  }

  async getAvailableBonusesByUser(user: User) {
    const availableBonuses = await this.bonusRepository.getAvailableBonuses();
    const activeBonuses = await this.getAllBonusesForUser(user);
    return availableBonuses.filter(({ id }: any) => {
      return !activeBonuses.find(({ bonus: { id: activeId } }: any) => {
        return activeId === id;
      });
    });
  }

  getAvailableBonuses() {
    return this.bonusRepository.getAvailableBonuses();
  }

  getActiveBonusesForUser(user: User) {
    return this.userBonusRepository.getActiveBonusesByUserId(user.id, [
      'bonus',
    ]);
  }

  getAllBonusesForUser(user: User) {
    return this.userBonusRepository.getAllBonusesByUserId(user.id, ['bonus']);
  }

  async generateNewBonus() {
    const availableBonuses = await this.getAvailableBonuses();
    if (availableBonuses.length < 5) {
      await this.bonusRepository.create();
      return true;
    }
    return false;
  }
}

export default BonusService;
