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
  public groups: Record<string, Record<number, Group>> = {};
  public friends: Record<string, Record<number, User>> = {};
  protected server!: http.Server
  readonly ev: CustomEventEmitter.HttpEventEmitter = new EventEmitter()
  public clientAddresses: string[] = []

  public createServer(port: number): this
  public createServer(port: number, host?: string): this
  public createServer(port: number, host?: string, cb?: () => void): this {
    this.server = http.createServer()

    this.ev.on("response", data => {
      console.log("======================")
      console.log("Http Received Response")
    })

    this.ev.once("connect", () => {
      console.log("正在尝试获取群聊与好友信息")
      if (this.clientAddresses.length == 0) {
        console.error("“Http”无法获取群聊与好友信息，因为未指定客户端地址")
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
      this.ev.emit("connect")

      this.receiveRequest(req, res, async (req, res) => {
        const data = <object>Utils.jsonToData(req.body)
        if (Object.hasOwn(data, "echo")) {
          this.ev.emit("response", <ConnectionContent.Connection.Response<number | object | object[]>>data)
        }
        else {
          console.log("==========================")
          console.log("Http Received Event Report")

          switch ((<Event.Reported>data).post_type) {
            case EventEnum.EventType.message:
              console.log("Type: Message")

              this.ev.emit("message", <Event.Message>data)
              break;

            case EventEnum.EventType.messageSent:
              console.log("Type: MessageSent")
            
              this.ev.emit("message", <Event.Message>data)
              break;
          
            case EventEnum.EventType.notice:
              console.log("Type: Notice")

              this.ev.emit("notice", <Event.Notice>data)
              break;

            case EventEnum.EventType.request:
              console.log("Type: Request")

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

  public getGroups(first?: any): Record<number, Group> {
    return this.groups[this.clientAddresses[0]]
  }
  public getGroup(id: number, first?: any): Group {
    return this.groups[this.clientAddresses[0]][id]
  }
  public getFriends(first?: any): Record<number, User> {
    return this.friends[this.clientAddresses[0]]
  }
  public getFriend(id: number, first?: any): User {
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
      throw err
    })
    res.on('end', () => {
      let result
      try {
        result = Utils.jsonToData(data)
      }
      catch (err) {
        console.error("===========================")
        console.error("Http Received Error Request")
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
  public _removeGroup(id: number): void {
    throw new Error("Method not implemented.");
  }
  public _addGroupMember(member: Event.GroupMemberIncrease): void {
    throw new Error("Method not implemented.");
  }
  public _removeGroupMember(id: number): void {
    throw new Error("Method not implemented.");
  }
  public _processGroupAdminChange(admin: Event.GroupAdminChange): void {
    throw new Error("Method not implemented.");
  }
  public _processGroupMemberCardChange(card: Event.GroupCardChange): void {
    throw new Error("Method not implemented.");
  }
  public _addFriend(friend: Event.FriendAdd): void {
    throw new Error("Method not implemented.");
  }
  public _removeFriend(id: number): void {
    throw new Error("Method not implemented.");
  }
}
