import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Float,
  ID,
  Mutation,
  ObjectType,
  PubSub,
  PubSubEngine,
  Resolver,
  Root,
} from 'type-graphql';
import { Service } from 'typedi';

import { Context } from '../../../global/GraphQL';
import MineService from '../../../services/MineService';
import User from '../../users/User';
import Config from '../Config';
import getLevelMultiplier from '../getLevelMultiplier';
import getLevelPrice from '../getLevelPrice';
import getPrice from '../getPrice';
import getPriceSum from '../getPriceSum';
import BuyMinerInput from './BuyMinerInput';
import Mine from './Mine';

@ObjectType()
class MineMutationReturn implements Partial<Mine> {
  @Field(() => ID)
  id: string;

  @Field()
  miner: number;

  @Field()
  stone: number;

  @Field()
  level: number;

  @Field()
  cost_1: number;

  @Field()
  cost_10: number;

  @Field()
  cost_100: number;

  @Field()
  cost_level: number;

  @Field()
  level_multiplier: number;
}

@ObjectType()
class SellStoneMutationReturn implements Partial<User> {
  @Field(() => ID)
  id: string;

  @Field()
  balance: number;

  @Field(() => Mine)
  mine: Mine;
}

@Service()
@Resolver(() => Mine)
class MineResolver {
  constructor(private mineService: MineService) {}

  @FieldResolver(() => Float)
  cost_1(@Root() mine: Mine) {
    return getPrice(Config.MINER_BASE_PRICE, mine.miner);
  }

  @FieldResolver(() => Float)
  cost_10(@Root() mine: Mine) {
    return getPriceSum(Config.MINER_BASE_PRICE, mine.miner, 10);
  }

  @FieldResolver(() => Float)
  cost_100(@Root() mine: Mine) {
    return getPriceSum(Config.MINER_BASE_PRICE, mine.miner, 100);
  }

  @FieldResolver(() => Float)
  cost_level(@Root() mine: Mine) {
    return getLevelPrice(Config.MINE_BASE_PRICE, mine.level);
  }

  @FieldResolver(() => Float)
  level_multiplier(@Root() mine: Mine) {
    return getLevelMultiplier(mine.level);
  }

  @Authorized()
  @Mutation(() => SellStoneMutationReturn)
  async sellStone(@Ctx() ctx: Context, @PubSub() pubSub: PubSubEngine) {
    const user = await this.mineService.sellStone(ctx);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return user;
  }

  @Authorized()
  @Mutation(() => MineMutationReturn)
  async upgradeMine(@Ctx() ctx: Context, @PubSub() pubSub: PubSubEngine) {
    const mine = await this.mineService.upgradeMine(ctx);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return mine;
  }

  @Authorized()
  @Mutation(() => MineMutationReturn)
  async buyMiner(
    @Arg('input') args: BuyMinerInput,
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine,
  ) {
    const mine = await this.mineService.buyMiner(ctx, args);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return mine;
  }

  @Authorized()
  @Mutation(() => MineMutationReturn, {
    description:
      'Gather stone with your miners. Returns "{success: false}" when timout has not run out yet',
  })
  async gatherStone(@Ctx() ctx: Context, @PubSub() pubSub: PubSubEngine) {
    const mine = await this.mineService.gatherStone(ctx);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return mine;
  }
}

export default MineResolver;
