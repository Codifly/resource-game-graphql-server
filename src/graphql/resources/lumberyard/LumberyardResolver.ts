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
import LumberyardService from '../../../services/LumberyardService';
import User from '../../users/User';
import Config from '../Config';
import getLevelMultiplier from '../getLevelMultiplier';
import getLevelPrice from '../getLevelPrice';
import getPrice from '../getPrice';
import getPriceSum from '../getPriceSum';
import BuyLumberjackInput from './BuyLumberjackInput';
import Lumberyard from './Lumberyard';

@ObjectType()
class LumberyardMutationReturn implements Partial<Lumberyard> {
  @Field(() => ID)
  id: string;

  @Field()
  lumberjack: number;

  @Field()
  wood: number;

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
class SellWoodMutationReturn implements Partial<User> {
  @Field(() => ID)
  id: string;

  @Field()
  balance: number;

  @Field(() => Lumberyard)
  lumberyard: Lumberyard;
}

@Service()
@Resolver(() => Lumberyard)
class LumberyardResolver {
  constructor(private lumberyardService: LumberyardService) {}

  @FieldResolver(() => Float)
  cost_1(@Root() lumberyard: Lumberyard) {
    return getPrice(Config.LUMBERJACK_BASE_PRICE, lumberyard.lumberjack);
  }

  @FieldResolver(() => Float)
  cost_10(@Root() lumberyard: Lumberyard) {
    return getPriceSum(Config.LUMBERJACK_BASE_PRICE, lumberyard.lumberjack, 10);
  }

  @FieldResolver(() => Float)
  cost_level(@Root() lumberyard: Lumberyard) {
    return getLevelPrice(Config.LUMBERYARD_BASE_PRICE, lumberyard.level);
  }

  @FieldResolver(() => Float)
  level_multiplier(@Root() lumberyard: Lumberyard) {
    return getLevelMultiplier(lumberyard.level);
  }

  @FieldResolver(() => Float)
  cost_100(@Root() lumberyard: Lumberyard) {
    return getPriceSum(
      Config.LUMBERJACK_BASE_PRICE,
      lumberyard.lumberjack,
      100,
    );
  }

  @Authorized()
  @Mutation(() => SellWoodMutationReturn)
  async sellWood(@Ctx() ctx: Context, @PubSub() pubSub: PubSubEngine) {
    const user = await this.lumberyardService.sellWood(ctx);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return user;
  }

  @Authorized()
  @Mutation(() => LumberyardMutationReturn)
  async upgradeLumberyard(@Ctx() ctx: Context, @PubSub() pubSub: PubSubEngine) {
    const lumberyard = await this.lumberyardService.upgradeLumberyard(ctx);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return lumberyard;
  }

  @Authorized()
  @Mutation(() => LumberyardMutationReturn)
  async buyLumberjack(
    @Arg('input') args: BuyLumberjackInput,
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine,
  ) {
    const lumberyard = await this.lumberyardService.buyLumberjack(ctx, args);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return lumberyard;
  }

  @Authorized()
  @Mutation(() => LumberyardMutationReturn, {
    description:
      'Gather wood with your lumberjacks. Returns "{success: false}" when timout has not run out yet',
  })
  async gatherWood(@Ctx() ctx: Context, @PubSub() pubSub: PubSubEngine) {
    const lumberyard = await this.lumberyardService.gatherWood(ctx);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return lumberyard;
  }
}

export default LumberyardResolver;
