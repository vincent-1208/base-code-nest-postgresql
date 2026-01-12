import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ROLE, STATUS } from '@shared/src/constants/user.constant';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  user_name: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  hashedRefreshToken?: string;

  @Column({ enum: ROLE })
  role: string;

  @Column({ enum: STATUS })
  status: string;
}
