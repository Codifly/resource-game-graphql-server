import { Field, ID, InputType } from 'type-graphql';

import Bonus from './Bonus';

@InputType()
class BuyBonusInput implements Partial<Bonus> {
  @Field(() => ID)
  id: string;
}

export default BuyBonusInput;
