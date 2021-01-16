import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  ResolverInterface,
  Root,
  Subscription,
} from 'type-graphql';
import { Service } from 'typedi';

import { Context } from '../../global/GraphQL';
import BonusService from '../../services/BonusService';
import UserService from '../../services/UserService';
import LoginInput from './LoginInput';
import User from './User';

@ObjectType()
class LoginReturn {
  @Field()
  token: string;
}

@Service()
@Resolver(() => User)
class UserResolver implements ResolverInterface<User> {
  constructor(
    private userService: UserService,
    private bonusService: BonusService,
  ) {}

  @FieldResolver()
  activeBonuses(@Root() user: User) {
    return this.bonusService.getActiveBonusesForUser(user);
  }

  @Authorized()
  @Query(() => User)
  me(@Ctx() ctx: Context) {
    return this.userService.getUser(ctx.user!.id);
  }

  @Mutation(() => LoginReturn)
  login(@Arg('input') args: LoginInput) {
    return this.userService.login(args);
  }

  @Subscription(() => [User], {
    topics: `USERS`,
    description: 'Get live updates of all users',
  })
  usersLive() {
    return this.userService.getUsers();
  }

  @Subscription(() => User, {
    topics: ({ context }) => `USER_${context.user.id}`,
    description: 'Get live updates for your user account.',
  })
  userLive(@Root() id: string) {
    return this.userService.getUser(id);
  }
}

export default UserResolver;
