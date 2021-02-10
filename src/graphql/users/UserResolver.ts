import LumberyardService from 'src/services/LumberyardService';
import {
  Arg,
  Authorized,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  ResolverInterface,
  Root,
} from 'type-graphql';
import { Service } from 'typedi';

import { Context } from '../../global/GraphQL';
import UserService from '../../services/UserService';
import User from './User';
@InputType()
class LoginInput implements Partial<User> {
  @Field()
  username: string;

  @Field()
  password: string;
}

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

  @Mutation(() => LoginReturn)
  login(@Arg('input') args: LoginInput) {
    return this.userService.login(args);
  }
}

export default UserResolver;
