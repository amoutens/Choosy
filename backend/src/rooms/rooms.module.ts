import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './room.entity';
import { RoomParticipant } from './room-participant.entity';
import { RoomVote } from './room-vote.entity';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomsGateway } from './rooms.gateway';
import { RecommendationService } from './recommendation.service';
import { MoviesModule } from '../movies/movies.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, RoomParticipant, RoomVote]),
    MoviesModule,
    UsersModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway, RecommendationService],
})
export class RoomsModule {}
