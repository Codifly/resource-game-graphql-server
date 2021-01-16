import { Field, InputType } from 'type-graphql';

import User from './User';

@InputType()
class LoginInput implements Partial<User> {
  @Field()
  username: string;

  @Field()
  password: string;
}

export default LoginInput;
