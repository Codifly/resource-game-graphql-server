import moment from 'moment';
import { Service } from 'typedi';

import { Context } from '../global/GraphQL';
import { BonusType, BonusTypeLevelMap } from '../graphql/bonus/BonusType';
import Config from '../graphql/resources/Config';
import getLevelMultiplier from '../graphql/resources/getLevelMultiplier';
import getLevelPrice from '../graphql/resources/getLevelPrice';
import getPrice from '../graphql/resources/getPrice';
import getPriceSum from '../graphql/resources/getPriceSum';
import BuyBlacksmithInput from '../graphql/resources/smithy/BuyBlacksmithInput';
import SmithyRepository from '../repositories/SmithyRepository';
import UserBonusRepository from '../repositories/UserBonusRepository';
import UserRepository from '../repositories/UserRepository';
import LevelTooHighError from './errors/LevelTooHighError';
import NoGathererError from './errors/NoGathererAvailableError';
import NotEnoughMoneyError from './errors/NotEnoughMoneyError';
import ResourceNotAvailableError from './errors/ResourceNotAvailableError';
import UnknownError from './errors/UnknownError';

@Service()
class SmithyService {
  constructor(
    private smithyRepository: SmithyRepository,
    private userRepository: UserRepository,
    private userBonusRepository: UserBonusRepository,
  ) {}

  async upgradeSmithy(ctx: Context) {
    const user = await this.userRepository.getUserById(ctx.user!.id, [
      'smithy',
    ]);
    // If the user does not exist at this point, something went wrong in validation
    if (!user) throw new UnknownError();

    const smithy = user.smithy;
    const { level, blacksmith } = smithy;
    const { balance } = user;

    if (level === 5) {
      throw new LevelTooHighError();
    }
    if (blacksmith === 0) {
      throw new NoGathererError('smithy', 'blacksmith');
    }

    // Ge user's active bonuses
    const userBonuses = await this.userBonusRepository.getActiveBonusesByUserId(
      user.id,
      ['bonus'],
    );

    // Only get bonuses relevant to this action on this resource
    const relevantBonuses = userBonuses.filter(({ bonus: { type } }) =>
      [BonusType.SALE, BonusType.BLACKSMITH_SALE, BonusType.TAX].includes(type),
    );

    let price = getLevelPrice(Config.SMITHY_BASE_PRICE, level);

    // Apply every bonus multiplier
    relevantBonuses.forEach(({ bonus: { type, level: bonusLevel } }) => {
      price = price * BonusTypeLevelMap[type][bonusLevel];
    });

    // Check if use has enough money to buy this amount of blacksmiths
    if (user.balance < price) {
      throw new NotEnoughMoneyError();
    }

    const newSmithyLevel = level + 1;
    const newBalance = balance - price;

    await this.userRepository.update({
      ...user,
      balance: newBalance,
    });
    return this.smithyRepository.update({
      ...smithy,
      level: newSmithyLevel,
    });
  }

  async buyBlacksmith(ctx: Context, args: BuyBlacksmithInput) {
    const { amount } = args;
    const user = await this.userRepository.getUserById(ctx.user!.id, [
      'smithy',
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
      [BonusType.SALE, BonusType.BLACKSMITH_SALE, BonusType.TAX].includes(type),
    );

    const smithy = user.smithy;
    const { balance } = user;
    const { blacksmith } = smithy;

    // Price calculation
    let price: number;
    if (amount === 1) {
      price = getPrice(Config.BLACKSMITH_BASE_PRICE, blacksmith);
    } else {
      price = getPriceSum(Config.BLACKSMITH_BASE_PRICE, blacksmith, amount);
    }
    // Apply every bonus multiplier
    relevantBonuses.forEach(({ bonus: { type, level } }) => {
      price = price * BonusTypeLevelMap[type][level];
    });

    // Check if use has enough money to buy this amount of blacksmiths
    if (balance < price) {
      throw new NotEnoughMoneyError();
    }

    const newSmithyAmount = blacksmith + amount;
    const newBalance = balance - price;

    await this.userRepository.update({
      ...user,
      balance: newBalance,
    });
    return this.smithyRepository.update({
      ...smithy,
      blacksmith: newSmithyAmount,
    });
  }

  async gatherIron(ctx: Context) {
    const user = await this.userRepository.getUserById(ctx.user!.id, [
      'smithy',
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
        BonusType.IRON_EFFICIENCY,
        BonusType.FREEZE,
      ].includes(type),
    );

    const smithy = user.smithy;
    const { lastGather, iron, blacksmith, level } = smithy;

    // Check if smithy is available
    const availableAt = moment(lastGather).add(Config.SMITHY_TIMEOUT, 's');
    const now = moment();
    if (availableAt.isAfter(now)) {
      throw new ResourceNotAvailableError();
    }

    const levelMultiplier = getLevelMultiplier(level);
    let newIronAmount =
      iron + Config.SMITHY_BASE_AMOUNT * blacksmith * levelMultiplier;
    // Apply every bonus multiplier
    relevantBonuses.forEach(({ bonus: { type, level: bonusLevel } }) => {
      newIronAmount = newIronAmount * BonusTypeLevelMap[type][bonusLevel];
    });

    return this.smithyRepository.update({
      ...smithy,
      iron: newIronAmount,
      lastGather: now.toDate(),
    });
  }

  async sellIron(ctx: Context) {
    const user = await this.userRepository.getUserById(ctx.user!.id, [
      'smithy',
    ]);
    // If the user does not exist at this point, something went wrong in validation
    if (!user) throw new UnknownError();

    const smithy = user.smithy;
    const { iron } = smithy;
    const { balance } = user;

    const price = iron * Config.IRON_PRICE;

    const newBalance = balance + price;

    await this.smithyRepository.update({
      ...smithy,
      iron: 0,
    });
    await this.userRepository.update({
      ...user,
      balance: newBalance,
    });

    return {
      ...user,
      balance: newBalance,
      smithy: {
        ...smithy,
        iron: 0,
      },
    };
  }
}

export default SmithyService;
