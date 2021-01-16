import { PubSubEngine } from 'apollo-server-koa';
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Publisher,
  PubSub,
  Query,
  Resolver,
  Subscription,
} from 'type-graphql';
import { Service } from 'typedi';

import { Context } from '../../global/GraphQL';
import BonusService from '../../services/BonusService';
import Bonus from './Bonus';
import BuyBonusInput from './BuyBonusInput';

@ObjectType()
class BuyBonusReturn {
  @Field()
  success: boolean;
}

@ObjectType()
class GenerateNewBonus {
  @Field()
  success: boolean;
}

@Service()
@Resolver(() => Bonus)
class BonusResolver {
  constructor(private bonusService: BonusService) {}

  @Authorized()
  @Query(() => [Bonus], {
    description: 'Get all bonuses which are available right now.',
  })
  availableBonuses(@Ctx() ctx: Context) {
    return this.bonusService.getAvailableBonusesByUser(ctx.user!);
  }

  @Authorized()
  @Subscription(() => [Bonus], {
    topics: `AVAILABLE_BONUSES`,
    description: 'Get all bonuses which are available for you right now.',
  })
  availableBonusesLive(@Ctx() ctx: Context) {
    return this.bonusService.getAvailableBonusesByUser(ctx.user!);
  }

  @Authorized()
  @Mutation(() => BuyBonusReturn, {
    description: 'Buy the bonus with id.',
  })
  async buyBonus(
    @Arg('input') args: BuyBonusInput,
    @Ctx() ctx: Context,
    @PubSub() pubSub: PubSubEngine,
  ) {
    const { success, affectedUsers } = await this.bonusService.buyBonus(
      args,
      ctx,
    );
    pubSub.publish('AVAILABLE_BONUSES', undefined);
    pubSub.publish('USERS', undefined);
    affectedUsers.forEach(({ id }) => {
      pubSub.publish(`USER_${id}`, id);
    });
    return { success };
  }

  @Authorized('SYSTEM')
  @Mutation(() => GenerateNewBonus, {
    description: 'Can only be called when a system token is present',
  })
  async generateNewBonus(@PubSub('AVAILABLE_BONUSES') pubSub: Publisher<void>) {
    const success = await this.bonusService.generateNewBonus();
    if (success) {
      pubSub();
    }
    return { success };
  }
}

export default BonusResolver;
