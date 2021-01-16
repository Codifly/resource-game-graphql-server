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
import SmithyService from '../../../services/SmithyService';
import User from '../../users/User';
import Config from '../Config';
import getLevelMultiplier from '../getLevelMultiplier';
import getLevelPrice from '../getLevelPrice';
import getPrice from '../getPrice';
import getPriceSum from '../getPriceSum';
import BuyBlacksmithInput from './BuyBlacksmithInput';
import Smithy from './Smithy';

@ObjectType()
class SmithyMutationReturn implements Partial<Smithy> {
  @Field(() => ID)
  id: string;

  @Field()
  blacksmith: number;

  @Field()
  iron: number;

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
class SellIronMutationReturn implements Partial<User> {
  @Field(() => ID)
  id: string;

  @Field()
  balance: number;

  @Field(() => Smithy)
  smithy: Smithy;
}

@Service()
@Resolver(() => Smithy)
class SmithyResolver {
  constructor(private smithyService: SmithyService) {}

  @FieldResolver(() => Float)
  cost_1(@Root() smithy: Smithy) {
    return getPrice(Config.BLACKSMITH_BASE_PRICE, smithy.blacksmith);
  }

  @FieldResolver(() => Float)
  cost_10(@Root() smithy: Smithy) {
    return getPriceSum(Config.BLACKSMITH_BASE_PRICE, smithy.blacksmith, 10);
  }

  @FieldResolver(() => Float)
  cost_100(@Root() smithy: Smithy) {
    return getPriceSum(Config.BLACKSMITH_BASE_PRICE, smithy.blacksmith, 100);
  }

  @FieldResolver(() => Float)
  cost_level(@Root() smithy: Smithy) {
    return getLevelPrice(Config.SMITHY_BASE_PRICE, smithy.level);
  }

  @FieldResolver(() => Float)
  level_multiplier(@Root() smithy: Smithy) {
    return getLevelMultiplier(smithy.level);
  }

  @Authorized()
  @Mutation(() => SellIronMutationReturn)
  async sellIron(@Ctx() ctx: Context, @PubSub() pubSub: PubSubEngine) {
    const user = await this.smithyService.sellIron(ctx);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return user;
  }

  @Authorized()
  @Mutation(() => SmithyMutationReturn)
  async upgradeSmithy(@Ctx() ctx: Context, @PubSub() pubSub: PubSubEngine) {
    const smithy = await this.smithyService.upgradeSmithy(ctx);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return smithy;
  }

  @Authorized()
  @Mutation(() => SmithyMutationReturn)
  async buyBlacksmith(
    @Arg('input') args: BuyBlacksmithInput,
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine,
  ) {
    const smithy = await this.smithyService.buyBlacksmith(ctx, args);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return smithy;
  }

  @Authorized()
  @Mutation(() => SmithyMutationReturn, {
    description:
      'Gather iron with your blacksmiths. Returns "{success: false}" when timout has not run out yet',
  })
  async gatherIron(@Ctx() ctx: Context, @PubSub() pubSub: PubSubEngine) {
    const smithy = await this.smithyService.gatherIron(ctx);
    pubSub.publish('USERS', undefined);
    pubSub.publish(`USER_${ctx.user!.id}`, ctx.user!.id);
    return smithy;
  }
}

export default SmithyResolver;
