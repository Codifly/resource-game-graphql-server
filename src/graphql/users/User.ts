import { Field, ID, ObjectType } from 'type-graphql';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import UserBonus from '../bonus/UserBonus';
import Lumberyard from '../resources/lumberyard/Lumberyard';
import Mine from '../resources/mine/Mine';
import Smithy from '../resources/smithy/Smithy';

@Entity()
@Unique(['username'])
@ObjectType({ description: 'The user model' })
class User {
  constructor(username: string, salt: string, hash: string) {
    this.username = username;
    this.salt = salt;
    this.hash = hash;
  }

  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  id: string;

  @Column()
  hash: string;

  @Column()
  salt: string;

  @Column()
  @Field()
  username: string;

  @Column('float8', { default: 0 })
  @Field()
  balance: number;

  @OneToOne(() => Mine)
  @JoinColumn({ name: 'mineId' })
  @Field()
  mine: Mine;

  @Column({ nullable: false })
  mineId: string;

  @OneToOne(() => Lumberyard)
  @JoinColumn({ name: 'lumberyardId' })
  @Field()
  lumberyard: Lumberyard;

  @Column({ nullable: false })
  lumberyardId: string;

  @OneToOne(() => Smithy)
  @JoinColumn({ name: 'smithyId' })
  @Field()
  smithy: Smithy;

  @Column({ nullable: false })
  smithyId: string;

  @Field(() => [UserBonus])
  activeBonuses: UserBonus[];

  @Column({ default: false })
  isAdmin: boolean;
}

export default User;
