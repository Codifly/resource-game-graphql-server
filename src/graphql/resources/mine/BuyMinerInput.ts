import { Min } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType()
class BuyMinerInput {
  @Field()
  @Min(1)
  amount: number;
}

export default BuyMinerInput;
