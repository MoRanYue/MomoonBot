import type { CustomEventEmitter } from "src/types/CustomEventEmitter";
import { Connection } from "./Connection";
import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter";
import type { Event } from "src/types/event";
import ws from "ws"
import config from "../config"
import { Utils } from "../tools/Utils";
import { ConnectionEnum, EventEnum } from "../types/enums";
import { ConnectionContent } from "src/types/connectionContent";
import type { DataType } from "src/types/dataType";
import { Group } from "../processors/sets/Group";
import { User } from "../processors/sets/User";

export class ReverseWsConnection extends Connection {
  protected token: string | null | undefined;
  public groups: Record<string, Record<number, Group>> = {};
  public friends: Record<string, Record<number, User>> = {};
  protected server!: ws.Server;
  public clientAddresses: string[] = []
  protected messageCbs: Record<string, DataType.ResponseFunction> = {}

  readonly ev: CustomEventEmitter.ReverseWsEventEmitter = new EventEmitter()

  public createServer(port: number): this;
  public createServer(port: number, host?: string | undefined): this;
  public createServer(port: number, host?: string | undefined, token?: string | null): this;
  public createServer(port: number, host?: string | undefined, token?: string | null, cb?: VoidFunction | undefined): this {
    if (this.server) {
      this.server.close()
    }

    this.server = new ws.Server({
      port,
      host,
    })
    this.token = token

    if (cb) {
      this.server.on("listening", cb)
    }

    this.server.on("connection", (socket, req) => {
      this.ev.emit("connect")

      this.clientAddresses.push(`${req.socket.remoteAddress}:${req.socket.remotePort}`)
      console.log("=============================================")
      console.log("Reverse WebSocket Received Connection Request")
      console.log("Client:", `${req.socket.remoteAddress}:${req.socket.remotePort}`)

      const auth = req.headers.authorization
      if (this.token) {
        if (!auth || auth.split(" ", 2).pop() != this.token) {
          console.log("客户端鉴权失败")
          return
        }
      }
      
      this.ev.on("response", data => {
        console.log("===================================")
        console.log("Reverse WebSocket Received Response")

        let messageInfo: ConnectionContent.Connection.WsRequestDetector
        try {
          messageInfo = <ConnectionContent.Connection.WsRequestDetector>Utils.jsonToData(data.echo)
          console.log(messageInfo)
        } catch (err) {
          console.warn("收到的返回非本服务器发送的请求所应返回的")
          return
        }

        if (Object.hasOwn(this.messageCbs, messageInfo.id)) {
          this.messageCbs[messageInfo.id](data)
          delete this.messageCbs[messageInfo.id]
        }
      })

      socket.on("message", buf => this.receivePacket(buf, dataStr => {
        const data = <object>Utils.jsonToData(dataStr)
        if (Object.hasOwn(data, "echo")) {
          this.ev.emit("response", <ConnectionContent.Connection.Response<number | object | object[]>>data)
        }
        else {
          switch ((<Event.Reported>data).post_type) {
            case EventEnum.EventType.message:
              console.log("=======================================")
              console.log("Reverse WebSocket Received Event Report")
              console.log("Type: Message")

              this.ev.emit("message", <Event.Message>data)
              break;

            case EventEnum.EventType.messageSent:
              console.log("=======================================")
              console.log("Reverse WebSocket Received Event Report")
              console.log("Type: MessageSent")
            
              this.ev.emit("message", <Event.Message>data)
              break;
          
            case EventEnum.EventType.notice:
              console.log("=======================================")
              console.log("Reverse WebSocket Received Event Report")
              console.log("Type: Notice")
              console.log(data)

              this.ev.emit("notice", <Event.Notice>data)
              break;

            case EventEnum.EventType.request:
              console.log("=======================================")
              console.log("Reverse WebSocket Received Event Report")
              console.log("Type: Request")

              this.ev.emit("request", <Event.Request>data)
              break;
            
            case EventEnum.EventType.meta:
              this.ev.emit("meta", <Event.MetaEvent>data)
          
            default:
              this.ev.emit("unknown", <Event.Unknown>data)
              break;
          }
        }
      }))
      socket.on("close", () => {
        const clientAddress = `${req.socket.remoteAddress}:${req.socket.remotePort}`
        this.clientAddresses.forEach((address, i) => {
          if (address.includes(clientAddress)) {
            this.clientAddresses.splice(i, 1)
          }
        })
        delete this.groups[clientAddress]
        delete this.friends[clientAddress]

        console.log("===================================")
        console.log("Reverse WebSocket Connection Closed")
        console.log("Client:", `${req.socket.remoteAddress}:${req.socket.remotePort}`)
      })
      socket.on("error", err => {
        if (err) {
          throw err
        }
      })

      console.log("正在尝试获取群聊与好友信息")
      this.send(ConnectionEnum.Action.getGroupList, {}, data => {
        const result = <ConnectionContent.Connection.Response<ConnectionContent.ActionResponse.GetGroupList>>data
        const groups: Record<number, Group> = {}
        result.data.forEach(group => groups[group.group_id] = new Group(group, this))
        this.groups[this.clientAddresses[0]] = groups
      })
      this.send(ConnectionEnum.Action.getFriendList, {}, data => {
        const result = <ConnectionContent.Connection.Response<ConnectionContent.ActionResponse.GetFriendList>>data
        const friends: Record<number, User> = {}
        result.data.forEach(friend => friends[friend.user_id] = new User(friend, this))
        this.friends[this.clientAddresses[0]] = friends
      })
    })

    return this
  }

  public connect(address: string): boolean {
    throw new Error("Method not implemented.");
  }
  public address(): string | undefined {
    return <string>this.server.address()
  }

  public getGroups(clientIndex: number = 0): Record<number, Group> | undefined {
    if (!this.clientAddresses[clientIndex]) {
      return undefined
    }
    return this.groups[this.clientAddresses[clientIndex]]
  }
  public getGroup(id: number, clientIndex: number = 0): Group | undefined {
    if (!(this.clientAddresses[clientIndex] && Object.hasOwn(this.groups, this.clientAddresses[clientIndex]) && Object.hasOwn(this.groups[this.clientAddresses[clientIndex]], id))) {
      return undefined
    }
    return this.groups[this.clientAddresses[clientIndex]][id]
  }
  public getFriends(clientIndex: number = 0): Record<number, User> | undefined {
    if (!this.clientAddresses[clientIndex]) {
      return undefined
    }
    return this.friends[this.clientAddresses[clientIndex]]
  }
  public getFriend(id: number, clientIndex: number = 0): User | undefined {
    if (!(this.clientAddresses[clientIndex] && Object.hasOwn(this.friends, this.clientAddresses[clientIndex]) && Object.hasOwn(this.friends[this.clientAddresses[clientIndex]], id))) {
      return undefined
    }
    return this.friends[this.clientAddresses[clientIndex]][id]
  }

  public send(action: ConnectionEnum.Action, data: Record<string, any> = {}, cb?: DataType.ResponseFunction, clientIndex: number = 0): void {
    const id: string = Utils.randomChar()
    if (cb) {
      this.messageCbs[id] = cb
    }

    let i: number = -1
    this.server.clients.forEach(socket => {
      i++
      if (i == clientIndex) {
        socket.send(Utils.dataToJson(<ConnectionContent.Connection.WsRequest<typeof data>>{
          action,
          params: data,
          echo: Utils.dataToJson(<ConnectionContent.Connection.WsRequestDetector>{
            platform: "Momoon Bot",
            id
          })
        }), err => {
          if (err) {
            console.log("There Is A Error In Sending WS Request")
            throw err
          }
        })
      }
    })
    
  }
  
  private receivePacket(data: ws.RawData, cb: (data: string) => void) {
    cb(data.toString("utf-8"))
  }

  // 以下函数仅被内置类调用
  public _addGroup(group: Event.Reported, clientIndex: number = 0): void {
    throw new Error("Method not implemented.");
  }
  public _removeGroup(id: number, clientIndex: number = 0): void {
    if (this.getGroup(id, clientIndex)) {
      delete this.groups[this.clientAddresses[clientIndex]][id]
    }
  }
  public _addGroupMember(member: Event.GroupMemberIncrease, clientIndex?: number): void
  public _addGroupMember(member: DataType.GroupMemberParams, clientIndex?: number): void
  public _addGroupMember(member: Event.GroupMemberIncrease | DataType.GroupMemberParams, clientIndex: number = 0): void {
    let userId: number
    let groupId: number
    if (Object.hasOwn(member, "groupId")) {
      member = <DataType.GroupMemberParams>member
      userId = member.id
      groupId = member.groupId
    }
    else {
      member = <Event.GroupMemberIncrease>member
      userId = member.user_id
      groupId = member.group_id
    }
    if (this.getGroup(groupId)) {
      this.groups[this.clientAddresses[clientIndex]][groupId]._addMember(userId)
    }
  }
  public _removeGroupMember(member: Event.GroupMemberDecrease, clientIndex: number = 0): void {
    if (this.getGroup(member.group_id, clientIndex)) {
      this.groups[this.clientAddresses[clientIndex]][member.group_id]._removeMember(member)
    }
  }
  public _processGroupAdminChange(admin: Event.GroupAdminChange, clientIndex: number = 0): void {
    if (this.getGroup(admin.group_id, clientIndex)) {
      this.groups[this.clientAddresses[clientIndex]][admin.group_id]._processAdminChange(admin)
    }
  }
  public _processGroupMemberCardChange(card: Event.GroupCardChange, clientIndex: number = 0): void {
    if (this.getGroup(card.group_id, clientIndex)) {
      this.groups[this.clientAddresses[clientIndex]][card.group_id]._processMemberCardChange(card)
    }
  }
  public _addFriend(friend: Event.FriendAdd, clientIndex: number = 0): void {
    if (!this.getFriend(friend.user_id, clientIndex)) {
      this.friends[this.clientAddresses[clientIndex]][friend.user_id] = new User(friend, this)
    }
  }
  public _removeFriend(id: number, clientIndex: number = 0): void {
    if (this.getGroup(id, clientIndex)) {
      delete this.friends[this.clientAddresses[clientIndex]][id]
    }
  }
}