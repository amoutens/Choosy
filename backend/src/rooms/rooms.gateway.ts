import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomState } from './rooms.types';

@WebSocketGateway({
  cors: { origin: 'http://localhost:3000', credentials: true },
})
export class RoomsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() code: string,
  ): void {
    client.join(code);
  }

  emitRoomUpdated(code: string, state: RoomState): void {
    this.server.to(code).emit('room-updated', state);
  }
}
