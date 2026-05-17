import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoomParticipant } from './room-participant.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 6 })
  code: string;

  @Column()
  hostId: string;

  @Column({ default: 'waiting' })
  status: 'waiting' | 'voting' | 'results';

  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  movies: unknown[] | null;

  @OneToMany(() => RoomParticipant, (p) => p.room, { cascade: true })
  participants: RoomParticipant[];

  @CreateDateColumn()
  createdAt: Date;
}
