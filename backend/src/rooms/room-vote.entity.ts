import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('room_votes')
export class RoomVote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  roomId: string;

  @Column()
  userId: string;

  @Column()
  movieId: string;

  @Column()
  vote: 'like' | 'dislike';

  @Column({ type: 'jsonb' })
  movieData: unknown;

  @CreateDateColumn()
  createdAt: Date;
}
