import LumberyardService from 'src/services/LumberyardService';
import {
  Authorized,
  Ctx,
  FieldResolver,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from 'type-graphql';
import { Service } from 'typedi';

import { Context } from '../../global/GraphQL';
import UserService from '../../services/UserService';
import User from './User';

@Service()
@Resolver(() => User)
class UserResolver implements ResolverInterface<User> {
  constructor(
    private userService: UserService,
    private lumberyardService: LumberyardService,
  ) {}

  @FieldResolver()
  lumberyard(@Root() user: User) {
    return this.lumberyardService.getLumberyardById(user.lumberyardId);
  }

  @Authorized()
  @Query(() => User)
  me(@Ctx() ctx: Context) {
    return this.userService.getUser(ctx.user!.id);
  }
}

export default UserResolver;
