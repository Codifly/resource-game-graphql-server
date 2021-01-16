import { Field, ObjectType } from 'type-graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import User from '../users/User';
import Bonus from './Bonus';

@Entity()
@Unique(['userId', 'bonusId'])
@ObjectType({ description: 'The user bonus model' })
class UserBonus {
  constructor(activeUntil: Date, userId: string, bonusId: string) {
    this.activeUntil = activeUntil;
    this.userId = userId;
    this.bonusId = bonusId;
  }

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('timestamp')
  @Field()
  activeUntil: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: false })
  userId: string;

  @ManyToOne(() => Bonus)
  @JoinColumn({ name: 'bonusId' })
  @Field()
  bonus: Bonus;

  @Column({ nullable: false })
  bonusId: string;
}

export default UserBonus;
