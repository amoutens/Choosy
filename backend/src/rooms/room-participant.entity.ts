import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Room } from './room.entity';

@Entity('room_participants')
@Unique(['roomId', 'userId'])
export class RoomParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Room, (r) => r.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room: Room;

  @Column()
  roomId: string;

  @Column()
  userId: string;

  @Column()
  userEmail: string;

  @Column({ default: false })
  hasFinished: boolean;

  @CreateDateColumn()
  joinedAt: Date;
}
