import { Ctx, Query, Resolver } from 'type-graphql';
import { Service } from 'typedi';

import { Context } from '../../global/GraphQL';
import UserService from '../../services/UserService';
import User from './User';

@Service()
@Resolver()
class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => User)
  me(@Ctx() ctx: Context) {
    return this.userService.getUser(ctx.user!.id);
  }
}

export default UserResolver;
