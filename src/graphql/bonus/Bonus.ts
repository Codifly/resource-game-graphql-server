import moment from 'moment';
import { Field, ID, ObjectType } from 'type-graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import generateRandomEnum from '../../utils/generateRandomEnum';
import generateRandomInt from '../../utils/generateRandomInt';
import {
  BonusTargetType,
  BonusType,
  BonusTypeLevelMap,
  BonusTypeToDescription,
  BonusTypeToTargetType,
} from './BonusType';

@Entity()
@ObjectType({ description: 'The bonus model' })
class Bonus {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  @Field(() => BonusType)
  type: BonusType;

  @Column('timestamp')
  @Field()
  availableUntil: Date;

  @Column()
  @Field()
  level: number;

  @Column()
  @Field()
  cost: number;

  @Column()
  @Field()
  duration: number;

  @Field(() => BonusTargetType)
  get target(): BonusTargetType {
    return BonusTypeToTargetType[this.type];
  }

  @Field()
  get multiplier(): number {
    return BonusTypeLevelMap[this.type][this.level];
  }

  @Field()
  get description(): string {
    return BonusTypeToDescription[this.type];
  }

  constructor();
  constructor(
    type?: BonusType,
    availableUntil?: Date,
    level?: number,
    cost?: number,
    duration?: number,
  ) {
    this.type = type || generateRandomEnum(BonusType); // Generate a random type
    this.availableUntil =
      availableUntil ||
      moment().add(generateRandomInt(1, 5), 'minutes').toDate(); // Generate a random availability between 1 and 5 minutes
    this.level = level || generateRandomInt(1, 3); // Generate a random level between 1 and 3
    this.cost = cost || generateRandomInt(20000, 30000) * this.level; // Generate a random cost between 500 and 50000 and multiply by level.
    this.duration = duration || generateRandomInt(30, 120); // Generate a random duration between 10 and 60 seconds
  }
}

export default Bonus;
