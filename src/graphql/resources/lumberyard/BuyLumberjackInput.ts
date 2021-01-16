import { Min } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType()
class BuyLumberjackInput {
  @Field()
  @Min(1)
  amount: number;
}

export default BuyLumberjackInput;
