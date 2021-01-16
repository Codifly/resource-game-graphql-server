import moment from 'moment';
import { Service } from 'typedi';

import { Context } from '../global/GraphQL';
import { BonusType, BonusTypeLevelMap } from '../graphql/bonus/BonusType';
import Config from '../graphql/resources/Config';
import getLevelMultiplier from '../graphql/resources/getLevelMultiplier';
import getLevelPrice from '../graphql/resources/getLevelPrice';
import getPrice from '../graphql/resources/getPrice';
import getPriceSum from '../graphql/resources/getPriceSum';
import BuyMinerInput from '../graphql/resources/mine/BuyMinerInput';
import MineRepository from '../repositories/MineRepository';
import UserBonusRepository from '../repositories/UserBonusRepository';
import UserRepository from '../repositories/UserRepository';
import LevelTooHighError from './errors/LevelTooHighError';
import NoGathererError from './errors/NoGathererAvailableError';
import NotEnoughMoneyError from './errors/NotEnoughMoneyError';
import ResourceNotAvailableError from './errors/ResourceNotAvailableError';
import UnknownError from './errors/UnknownError';

@Service()
class MineService {
  constructor(
    private mineRepository: MineRepository,
    private userRepository: UserRepository,
    private userBonusRepository: UserBonusRepository,
  ) {}

  async upgradeMine(ctx: Context) {
    const user = await this.userRepository.getUserById(ctx.user!.id, ['mine']);
    // If the user does not exist at this point, something went wrong in validation
    if (!user) throw new UnknownError();

    const mine = user.mine;
    const { level, miner } = mine;
    const { balance } = user;

    if (level === 5) {
      throw new LevelTooHighError();
    }
    if (miner === 0) {
      throw new NoGathererError('mine', 'miner');
    }

    // Ge user's active bonuses
    const userBonuses = await this.userBonusRepository.getActiveBonusesByUserId(
      user.id,
      ['bonus'],
    );

    // Only get bonuses relevant to this action on this resource
    const relevantBonuses = userBonuses.filter(({ bonus: { type } }) =>
      [BonusType.SALE, BonusType.MINER_SALE, BonusType.TAX].includes(type),
    );

    let price = getLevelPrice(Config.MINE_BASE_PRICE, level);

    // Apply every bonus multiplier
    relevantBonuses.forEach(({ bonus: { type, level: bonusLevel } }) => {
      price = price * BonusTypeLevelMap[type][bonusLevel];
    });

    // Check if use has enough money to buy this amount of miners
    if (user.balance < price) {
      throw new NotEnoughMoneyError();
    }

    const newMineLevel = level + 1;
    const newBalance = balance - price;

    await this.userRepository.update({
      ...user,
      balance: newBalance,
    });
    return this.mineRepository.update({
      ...mine,
      level: newMineLevel,
    });
  }

  async buyMiner(ctx: Context, args: BuyMinerInput) {
    const { amount } = args;
    const user = await this.userRepository.getUserById(ctx.user!.id, ['mine']);
    // If the user does not exist at this point, something went wrong in validation
    if (!user) throw new UnknownError();

    // Ge user's active bonuses
    const userBonuses = await this.userBonusRepository.getActiveBonusesByUserId(
      user.id,
      ['bonus'],
    );
    // Only get bonuses relevant to this action on this resource
    const relevantBonuses = userBonuses.filter(({ bonus: { type } }) =>
      [BonusType.SALE, BonusType.MINER_SALE, BonusType.TAX].includes(type),
    );

    const mine = user.mine;
    const { balance } = user;
    const { miner } = mine;

    // Price calculation
    let price: number;
    if (amount === 1) {
      price = getPrice(Config.MINER_BASE_PRICE, miner);
    } else {
      price = getPriceSum(Config.MINER_BASE_PRICE, miner, amount);
    }
    // Apply every bonus multiplier
    relevantBonuses.forEach(({ bonus: { type, level } }) => {
      price = price * BonusTypeLevelMap[type][level];
    });

    // Check if use has enough money to buy this amount of miners
    if (balance < price) {
      throw new NotEnoughMoneyError();
    }

    const newMinerAmount = miner + amount;
    const newBalance = balance - price;

    await this.userRepository.update({
      ...user,
      balance: newBalance,
    });
    return this.mineRepository.update({
      ...mine,
      miner: newMinerAmount,
    });
  }

  async gatherStone(ctx: Context) {
    const user = await this.userRepository.getUserById(ctx.user!.id, ['mine']);
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
        BonusType.STONE_EFFICIENCY,
        BonusType.FREEZE,
      ].includes(type),
    );

    const mine = user.mine;
    const { lastGather, stone, miner, level } = mine;

    // Check if mine is available
    const availableAt = moment(lastGather).add(Config.MINE_TIMEOUT, 's');
    const now = moment();
    if (availableAt.isAfter(now)) {
      throw new ResourceNotAvailableError();
    }

    const levelMultiplier = getLevelMultiplier(level);
    let newStoneAmount =
      stone + Config.MINE_BASE_AMOUNT * miner * levelMultiplier;
    // Apply every bonus multiplier
    relevantBonuses.forEach(({ bonus: { type, level: bonusLevel } }) => {
      newStoneAmount = newStoneAmount * BonusTypeLevelMap[type][bonusLevel];
    });

    return this.mineRepository.update({
      ...mine,
      stone: newStoneAmount,
      lastGather: now.toDate(),
    });
  }

  async sellStone(ctx: Context) {
    const user = await this.userRepository.getUserById(ctx.user!.id, ['mine']);
    // If the user does not exist at this point, something went wrong in validation
    if (!user) throw new UnknownError();

    const mine = user.mine;
    const { stone } = mine;
    const { balance } = user;

    const price = stone * Config.STONE_PRICE;

    const newBalance = balance + price;

    await this.mineRepository.update({
      ...mine,
      stone: 0,
    });
    await this.userRepository.update({
      ...user,
      balance: newBalance,
    });

    return {
      ...user,
      balance: newBalance,
      mine: {
        ...mine,
        stone: 0,
      },
    };
  }
}

export default MineService;
