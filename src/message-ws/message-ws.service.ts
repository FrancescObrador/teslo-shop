import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

interface ConnectedClients{
    [id: string]: {
        socket: Socket,
        user: User
    }
}

@Injectable()
export class MessageWsService {

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ){}

    private connectClients: ConnectedClients = {}

    async registerClient(client: Socket, id: string){

        const user = await this.userRepo.findOneBy({id})
        if(!user) throw new Error('User not found')
        if(!user.isActive) throw new Error('User not active')

        this.checkUserConnection(user)
            
        this.connectClients[client.id] = {
            socket: client,
            user
        }
    }

    removeClient(clientID: string){
        delete this.connectClients[clientID]
    }

    getConnectedClients(): string[]{
        return Object.keys(this.connectClients)
    }

    getUserFullName(socketId: string){
        return this.connectClients[socketId].user.fullName
    }

    private checkUserConnection(user: User){
        for(const clientId of Object.keys(this.connectClients)){
            const connectedClient = this.connectClients[clientId]

            if(connectedClient.user.id === user.id){
                connectedClient.socket.disconnect()
                break
            }
        }
    }
}
