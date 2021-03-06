import { Field, Float, ObjectType } from 'type-graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import lastGatherColumnTransformer from '../lastGatherColumnTransformer';

@Entity()
@ObjectType({ description: 'The mine model' })
class Mine {
  @PrimaryGeneratedColumn('uuid')
  @Field()
  id: string;

  @Column({ default: 0 })
  @Field()
  miner: number;

  @Column({ default: 0 })
  @Field()
  stone: number;

  @Column({ default: 1 })
  @Field()
  level: number;

  @Column({
    type: 'timestamp',
    transformer: lastGatherColumnTransformer,
    default: () => 'NOW()',
  })
  lastGather: Date;

  @Field(() => Float)
  cost_1?: number;

  @Field(() => Float)
  cost_10?: number;

  @Field(() => Float)
  cost_100?: number;

  @Field(() => Float)
  cost_level?: number;

  @Field(() => Float)
  level_multiplier?: number;
}

export default Mine;
