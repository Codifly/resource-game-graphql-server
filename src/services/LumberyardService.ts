import moment from 'moment';
import { Service } from 'typedi';

import { Context } from '../global/GraphQL';
import { BonusType, BonusTypeLevelMap } from '../graphql/bonus/BonusType';
import Config from '../graphql/resources/Config';
import getLevelMultiplier from '../graphql/resources/getLevelMultiplier';
import getLevelPrice from '../graphql/resources/getLevelPrice';
import getPrice from '../graphql/resources/getPrice';
import getPriceSum from '../graphql/resources/getPriceSum';
import BuyLumberjackInput from '../graphql/resources/lumberyard/BuyLumberjackInput';
import LumberyardRepository from '../repositories/LumberyardRepository';
import UserBonusRepository from '../repositories/UserBonusRepository';
import UserRepository from '../repositories/UserRepository';
import LevelTooHighError from './errors/LevelTooHighError';
import NoGathererError from './errors/NoGathererAvailableError';
import NotEnoughMoneyError from './errors/NotEnoughMoneyError';
import ResourceNotAvailableError from './errors/ResourceNotAvailableError';
import UnknownError from './errors/UnknownError';

@Service()
class LumberyardService {
  constructor(
    private lumberyardRepository: LumberyardRepository,
    private userRepository: UserRepository,
    private userBonusRepository: UserBonusRepository,
  ) {}

  async upgradeLumberyard(ctx: Context) {
    const user = await this.userRepository.getUserById(ctx.user!.id, [
      'lumberyard',
    ]);
    // If the user does not exist at this point, something went wrong in validation
    if (!user) throw new UnknownError();

    const lumberyard = user.lumberyard;
    const { level, lumberjack } = lumberyard;
    const { balance } = user;

    if (level === 5) {
      throw new LevelTooHighError();
    }
    if (lumberjack === 0) {
      throw new NoGathererError('lumberyard', 'lumberjack');
    }

    // Ge user's active bonuses
    const userBonuses = await this.userBonusRepository.getActiveBonusesByUserId(
      user.id,
      ['bonus'],
    );

    // Only get bonuses relevant to this action on this resource
    const relevantBonuses = userBonuses.filter(({ bonus: { type } }) =>
      [BonusType.SALE, BonusType.LUMBERJACK_SALE, BonusType.TAX].includes(type),
    );

    let price = getLevelPrice(Config.LUMBERYARD_BASE_PRICE, level);

    // Apply every bonus multiplier
    relevantBonuses.forEach(({ bonus: { type, level: bonusLevel } }) => {
      price = price * BonusTypeLevelMap[type][bonusLevel];
    });

    // Check if use has enough money to buy this amount of lumberjacks
    if (user.balance < price) {
      throw new NotEnoughMoneyError();
    }

    const newLumberyardLevel = level + 1;
    const newBalance = balance - price;

    await this.userRepository.update({
      ...user,
      balance: newBalance,
    });
    return this.lumberyardRepository.update({
      ...lumberyard,
      level: newLumberyardLevel,
    });
  }

  async buyLumberjack(ctx: Context, args: BuyLumberjackInput) {
    const { amount } = args;
    const user = await this.userRepository.getUserById(ctx.user!.id, [
      'lumberyard',
    ]);
    // If the user does not exist at this point, something went wrong in validation
    if (!user) throw new UnknownError();

    // Ge user's active bonuses
    const userBonuses = await this.userBonusRepository.getActiveBonusesByUserId(
      user.id,
      ['bonus'],
    );
    // Only get bonuses relevant to this action on this resource
    const relevantBonuses = userBonuses.filter(({ bonus: { type } }) =>
      [BonusType.SALE, BonusType.LUMBERJACK_SALE, BonusType.TAX].includes(type),
    );

    const lumberyard = user.lumberyard;
    const { balance } = user;
    const { lumberjack } = lumberyard;

    // Price calculation
    let price: number;
    if (amount === 1) {
      price = getPrice(Config.LUMBERJACK_BASE_PRICE, lumberjack);
    } else {
      price = getPriceSum(Config.LUMBERJACK_BASE_PRICE, lumberjack, amount);
    }
    // Apply every bonus multiplier
    relevantBonuses.forEach(({ bonus: { type, level } }) => {
      price = price * BonusTypeLevelMap[type][level];
    });

    // Check if use has enough money to buy this amount of lumberjacks
    if (balance < price) {
      throw new NotEnoughMoneyError();
    }

    const newLumberjackAmount = lumberjack + amount;
    const newBalance = balance - price;

    await this.userRepository.update({
      ...user,
      balance: newBalance,
    });
    return this.lumberyardRepository.update({
      ...lumberyard,
      lumberjack: newLumberjackAmount,
    });
  }

  async gatherWood(ctx: Context) {
    const user = await this.userRepository.getUserById(ctx.user!.id, [
      'lumberyard',
    ]);
    // If the user does not exist at this point, something went wrong in validation
    if (!user) throw new UnknownError();
    // Ge user's active bonuses
    const userBonuses = await this.userBonusRepository.getActiveBonusesByUserId(
      user.id,
      ['bonus'],
    );
    // Only get bonuses relevant to this action on this resource
    const relevantBonuses = userBonuses.filter(({ bonus: { type } }) =>
      [
        BonusType.EFFICIENCY,
        BonusType.WOOD_EFFICIENCY,
        BonusType.FREEZE,
      ].includes(type),
    );

    const lumberyard = user.lumberyard;
    const { lastGather, wood, lumberjack, level } = lumberyard;

    // Check if lumberyard is available
    const availableAt = moment(lastGather).add(Config.LUMBERYARD_TIMEOUT, 's');
    const now = moment();
    if (availableAt.isAfter(now)) {
      throw new ResourceNotAvailableError();
    }

    const levelMultiplier = getLevelMultiplier(level);
    let newWoodAmount =
      wood + Config.LUMBERYARD_BASE_AMOUNT * lumberjack * levelMultiplier;
    // Apply every bonus multiplier
    relevantBonuses.forEach(({ bonus: { type, level: bonusLevel } }) => {
      newWoodAmount = newWoodAmount * BonusTypeLevelMap[type][bonusLevel];
    });

    return this.lumberyardRepository.update({
      ...lumberyard,
      wood: newWoodAmount,
      lastGather: now.toDate(),
    });
  }

  async sellWood(ctx: Context) {
    const user = await this.userRepository.getUserById(ctx.user!.id, [
      'lumberyard',
    ]);
    // If the user does not exist at this point, something went wrong in validation
    if (!user) throw new UnknownError();

    const lumberyard = user.lumberyard;
    const { wood } = lumberyard;
    const { balance } = user;

    const price = wood * Config.WOOD_PRICE;

    const newBalance = balance + price;

    await this.lumberyardRepository.update({
      ...lumberyard,
      wood: 0,
    });
    await this.userRepository.update({
      ...user,
      balance: newBalance,
    });

    return {
      ...user,
      balance: newBalance,
      lumberyard: {
        ...lumberyard,
        wood: 0,
      },
    };
  }
}

export default LumberyardService;
