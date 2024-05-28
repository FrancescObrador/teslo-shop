import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({cors: true})
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wws: Server
  constructor(
    private readonly messageWsService: MessageWsService,
    private readonly jwtService: JwtService,
  ) {}
  
  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string
    let payload: JwtPayload
    try {
      payload = this.jwtService.verify(token)
      await this.messageWsService.registerClient(client, payload.id)
    } catch (error) {
      client.disconnect()
    }

    console.log(payload)


    this.wws.emit('clients-updated', this.messageWsService.getConnectedClients())
  }
  
  handleDisconnect(client: Socket) {
    this.messageWsService.removeClient(client.id)
    this.wws.emit('clients-updated', this.messageWsService.getConnectedClients())
  }

  @SubscribeMessage('message-from-client')
  onMessageFromClient(client: Socket, payload: NewMessageDto){
    
    // client.emit('messages-from-server', {
    //   fullName: 'Soy yo',
    //   message: 'AAAA'
    // })

    // client.broadcast.emit('messages-from-server', {
    //   fullname: client.id, 
    //   message: payload.message || 'no-message'
    // })

    this.wws.emit('messages-from-server', {
      fullName: this.messageWsService.getUserFullName(client.id), 
      message: payload.message || 'no-message'
    })
  }
}
