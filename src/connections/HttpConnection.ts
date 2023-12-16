import { Connection } from "./Connection";
import http from "node:http"
import url from "node:url"
import { ResponseContent } from "../tools/ResponseContent";
import { CustomIncomingMessage } from "../types/http";
import { CustomEventEmitter } from "../types/CustomEventEmitter";
import { Utils } from "../tools/Utils";
import { Event } from "../types/event";
import { ConnectionEnum, EventEnum } from "../types/enums";
import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter";
import type { ConnectionContent } from "src/types/connectionContent";
import type { DataType } from "src/types/dataType";
import { Group } from "../processors/sets/Group";
import { User } from "../processors/sets/User";

export class HttpConnection extends Connection {
  protected token: string | null | undefined;
  public groups: Record<string, Record<number, Group>> = {};
  public friends: Record<string, Record<number, User>> = {};
  protected server!: http.Server
  readonly ev: CustomEventEmitter.HttpEventEmitter = new EventEmitter()
  public clientAddresses: string[] = []

  public createServer(port: number): this
  public createServer(port: number, host?: string): this
  public createServer(port: number, host?: string, token?: string | null): this
  public createServer(port: number, host?: string, token?: string | null, cb?: () => void): this {
    if (this.server) {
      this.server.close()
    }

    this.server = http.createServer()
    this.token = token

    this.ev.once("connect", () => {
      this.logger.info("正在尝试获取群聊与好友信息")
      if (this.clientAddresses.length == 0) {
        this.logger.error("“Http”无法获取群聊与好友信息，因为未指定客户端地址")
        return
      }
      
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
    
    this.server.on("request", (req: http.IncomingMessage, res: http.ServerResponse) => {
      const auth = req.headers.authorization
      if (token) {
        if (!auth || auth.split(" ", 2).pop() != token) {
          this.logger.info("客户端鉴权失败")
          return
        }
      }

      this.ev.emit("connect")

      this.receiveRequest(req, res, async (req, res) => {
        const data = <object>Utils.jsonToData(req.body)
        if (Object.hasOwn(data, "echo")) {
          this.ev.emit("response", <ConnectionContent.Connection.Response<number | object | object[]>>data)
        }
        else {
          this.logger.info("==========================")
          this.logger.info("Http Received Event Report")

          switch ((<Event.Reported>data).post_type) {
            case EventEnum.EventType.message:
              this.logger.info("Type: Message")

              this.ev.emit("message", <Event.Message>data)
              break;

            case EventEnum.EventType.messageSent:
              this.logger.info("Type: MessageSent")
            
              this.ev.emit("message", <Event.Message>data)
              break;
          
            case EventEnum.EventType.notice:
              this.logger.info("Type: Notice")

              this.ev.emit("notice", <Event.Notice>data)
              break;

            case EventEnum.EventType.request:
              this.logger.info("Type: Request")

              this.ev.emit("request", <Event.Request>data)
              break;
          
            default:
              this.ev.emit("unknown", <Event.Unknown>data)
              break;
          }
        }

        res.end(Utils.dataToJson(ResponseContent.httpClient()))
      })
    })
    
    this.server.listen(port, host, cb)

    return this
  }

  public connect(): never {
    throw new Error("Method not implemented.");
  }

  public address(): string | undefined {
    return <string>this.server.address()
  }

  public getGroups(first?: any): Record<number, Group> | undefined {
    if (this.clientAddresses.length == 0) {
      return undefined
    }
    return this.groups[this.clientAddresses[0]]
  }
  public getGroup(id: number, first?: any): Group | undefined {
    if (!(this.clientAddresses.length != 0 && Object.hasOwn(this.groups, this.clientAddresses[0]) && Object.hasOwn(this.groups[this.clientAddresses[0]], id))) {
      return undefined
    }
    return this.groups[this.clientAddresses[0]][id]
  }
  public getFriends(first?: any): Record<number, User> | undefined {
    if (this.clientAddresses.length == 0) {
      return undefined
    }
    return this.friends[this.clientAddresses[0]]
  }
  public getFriend(id: number, first?: any): User | undefined {
    if (!(this.clientAddresses.length != 0 && Object.hasOwn(this.friends, this.clientAddresses[0]) && Object.hasOwn(this.friends[this.clientAddresses[0]], id))) {
      return undefined
    }
    return this.friends[this.clientAddresses[0]][id]
  }

  public send(action: ConnectionEnum.Action, data: Record<string, any> = {}, cb?: DataType.ResponseFunction, clientIndex: number = 0): void {
    const req = http.request({
      method: "post",
      protocol: "http:",
      host: this.clientAddresses[clientIndex],
      pathname: "/" + action,
    }, this.receivePacket)
    req.on("error", err => {
      throw err
    })
    req.write(Utils.dataToJson(data))
    req.end()
  }

  public addClient(...address: string[]): void {
    this.clientAddresses.push(...address)
  }
  
  private receiveRequest(req: http.IncomingMessage, res: http.ServerResponse, cb: (req: CustomIncomingMessage, res: http.ServerResponse) => void) {
    const msg = <CustomIncomingMessage>req
    msg.query = new url.URL(req.url!, `http://${msg.headers.host}`).searchParams

    res.setHeader("Content-Type", "application/json;charset=utf-8")
    res.setHeader("Cache-Control", "no-cache")
    res.statusCode = 200
  
    if (msg.method!.toLowerCase() == 'post') {
      let data: string = ""
      msg.on("data", async (chunk: string) => data += chunk)
      msg.on("end", () => {
        msg.body = data
        cb(msg, res)
      })
    }
    else {
      cb(req, res)
    }
  }

  private async receivePacket(res: http.IncomingMessage, cb?: DataType.ResponseFunction): Promise<void> {
    res.setEncoding('utf-8')

    let data: string = ""

    res.on('data', chunk => data += chunk)
    res.on('error', err => {
      if (err) {
        throw err
      }
    })
    res.on('end', () => {
      let result
      try {
        result = Utils.jsonToData(data)
      }
      catch (err) {
        this.logger.error("===========================")
        this.logger.error("Http Received Error Request")
        this.logger.error(err)
        return 
      }

      if (cb) {
        cb(result)
      }
      this.ev.emit("response", result)
    })
  }

  // 以下函数仅被内置类调用
  public _addGroup(group: Event.Reported): void {
    throw new Error("Method not implemented.");
  }
  public _removeGroup(id: number, first?: any): void {
    if (this.getGroup(id)) {
      delete this.groups[this.clientAddresses[0]][id]
    }
  }
  public _addGroupMember(member: Event.GroupMemberIncrease, first?: any): void
  public _addGroupMember(member: DataType.GroupMemberParams, first?: any): void
  public _addGroupMember(member: Event.GroupMemberIncrease | DataType.GroupMemberParams, first?: any): void {
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
      this.groups[this.clientAddresses[0]][groupId]._addMember(userId)
    }
  }
  public _removeGroupMember(member: Event.GroupMemberDecrease, first?: any): void {
    if (this.getGroup(member.group_id)) {
      this.groups[this.clientAddresses[0]][member.group_id]._removeMember(member)
    }
  }
  public _processGroupAdminChange(admin: Event.GroupAdminChange, first?: any): void {
    if (this.getGroup(admin.group_id)) {
      this.groups[this.clientAddresses[0]][admin.group_id]._processAdminChange(admin)
    }
  }
  public _processGroupMemberCardChange(card: Event.GroupCardChange, first?: any): void {
    if (this.getGroup(card.group_id)) {
      this.groups[this.clientAddresses[0]][card.group_id]._processMemberCardChange(card)
    }
  }
  public _addFriend(friend: Event.FriendAdd, first?: any): void {
    if (!this.getFriend(friend.user_id)) {
      this.friends[this.clientAddresses[0]][friend.user_id] = new User(friend, this)
    }
  }
  public _removeFriend(id: number, first?: any): void {
    if (this.getGroup(id)) {
      delete this.friends[this.clientAddresses[0]][id]
    }
  }
}
