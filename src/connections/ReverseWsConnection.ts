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
  protected messageCbs: Record<string, DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>> = {}

  readonly ev: CustomEventEmitter.ReverseWsEventEmitter = new EventEmitter()
  
  constructor() {
    super();
  
    this.ev.on("response", (data: ConnectionContent.Connection.Response<any>) => {
      this.logger.debug("===================================")
      this.logger.debug("Reverse WebSocket Received Response")
      
      let messageInfo: ConnectionContent.Connection.WsRequestDetector
      try {
        messageInfo = <ConnectionContent.Connection.WsRequestDetector>Utils.jsonToData(data.echo)
        this.logger.debug("\n", Utils.dataToJson(messageInfo, 2))
      } catch (err) {
        this.logger.warning("收到的返回非本服务器发送的请求所应返回的")
        return
      }

      if (Object.hasOwn(this.messageCbs, messageInfo.id)) {
        this.messageCbs[messageInfo.id](data)
        delete this.messageCbs[messageInfo.id]
      }
    })
  }

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
      this.logger.info("=============================================")
      this.logger.info("Reverse WebSocket Received Connection Request")
      this.logger.info("Client:", `${req.socket.remoteAddress}:${req.socket.remotePort}`)

      const auth = req.headers.authorization
      if (this.token) {
        if (!auth || auth.split(" ", 2).pop() != this.token) {
          this.logger.info("客户端鉴权失败")
          return
        }
      }

      this.groups[this.clientAddresses[0]] = {}
      this.friends[this.clientAddresses[0]] = {}

      socket.on("message", buf => this.receivePacket(buf, dataStr => {
        const data = <object>Utils.jsonToData(dataStr)
        if (Object.hasOwn(data, "echo")) {
          this.ev.emit("response", <ConnectionContent.Connection.Response<number | object | object[]>>data)
        }
        else {
          switch ((<Event.Reported>data).post_type) {
            case EventEnum.EventType.message:
              this.logger.debug("=======================================")
              this.logger.debug("Reverse WebSocket Received Event Report")
              this.logger.debug("Type: Message")
              this.logger.debug(dataStr)

              this.ev.emit("message", <Event.Message>data)
              break;

            case EventEnum.EventType.messageSent:
              this.logger.debug("=======================================")
              this.logger.debug("Reverse WebSocket Received Event Report")
              this.logger.debug("Type: MessageSent")
              this.logger.debug(dataStr)
            
              this.ev.emit("message", <Event.Message>data)
              break;
          
            case EventEnum.EventType.notice:
              this.logger.debug("=======================================")
              this.logger.debug("Reverse WebSocket Received Event Report")
              this.logger.debug("Type: Notice")
              this.logger.debug(dataStr)

              this.ev.emit("notice", <Event.Notice>data)
              break;

            case EventEnum.EventType.request:
              this.logger.debug("=======================================")
              this.logger.debug("Reverse WebSocket Received Event Report")
              this.logger.debug("Type: Request")
              this.logger.debug(dataStr)

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

        this.logger.info("===================================")
        this.logger.info("Reverse WebSocket Connection Closed")
        this.logger.info("Client:", `${req.socket.remoteAddress}:${req.socket.remotePort}`)
      })
      socket.on("error", err => {
        if (err) {
          throw err
        }
      })

      this.logger.info("正在尝试获取群聊与好友信息")
      this.send(ConnectionEnum.Action.getGroupList, undefined, data => {
        const groups: Record<number, Group> = {}
        data.data.forEach(group => groups[group.group_id] = new Group(group, this))
        this.groups[this.clientAddresses[0]] = groups
      })
      this.send(ConnectionEnum.Action.getFriendList, undefined, data => {
        const friends: Record<number, User> = {}
        data.data.forEach(friend => friends[friend.user_id] = new User(friend, this))
        this.friends[this.clientAddresses[0]] = friends
      })
    })
    this.server.on("error", err => {
      if (err) {
        this.logger.error("===============================")
        this.logger.error("Reverse WebSocket Threw A Error")
        this.logger.error(err)
      }
    })
    this.server.on("close", () => {
      this.groups = {}
      this.friends = {}
      this.clientAddresses = []
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

  public send(action: ConnectionEnum.Action.uploadGroupImage, data: ConnectionContent.Params.UploadGroupImage, cb?: DataType.RawResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getWeather, data: ConnectionContent.Params.GetWeather, cb?: DataType.RawResponseFunction<object> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getWeatherCityCode, data: ConnectionContent.Params.GetWeatherCityCode, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetWeatherCityCode> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.shut, data?: null | undefined, cb?: DataType.RawResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.shell, data: ConnectionContent.Params.Shell, cb?: DataType.RawResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.log, data: ConnectionContent.Params.Log, cb?: DataType.RawResponseFunction<string> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getStartTime, data?: null | undefined, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetStartTime> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getDeviceBattery, data?: null | undefined, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetDeviceBattery> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.downloadFile, data: ConnectionContent.Params.DownloadFile, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.DownloadFile> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.uploadFile, data: string, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.UploadFile> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.switchAccount, data: ConnectionContent.Params.SwitchAccount, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupFileUrl, data: ConnectionContent.Params.GetGroupFileUrl, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFileUrl> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupFilesByFolder, data: ConnectionContent.Params.GetGroupFilesByFolder, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFilesByFolder> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupRootFiles, data: ConnectionContent.Params.GetGroupRootFiles, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupRootFiles> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupFileSystemInfo, data: ConnectionContent.Params.GetGroupFileSystemInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFileSystemInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.deleteGroupFolder, data: ConnectionContent.Params.DeleteGroupFolder, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.createGroupFileFolder, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CreateGroupFileFolder> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.deleteGroupFile, data: ConnectionContent.Params.DeleteGroupFile, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.uploadGroupFile, data: ConnectionContent.Params.UploadGroupFile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.UploadGroupFile> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.uploadPrivateFile, data: ConnectionContent.Params.UploadPrivateFile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.UploadPrivateFile> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getProhibitedMemberList, data: ConnectionContent.Params.GetProhibitedMemberList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetProhibitedMemberList> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.groupTouch, data: ConnectionContent.Params.GroupTouch, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setGroupLeave, data: ConnectionContent.Params.SetGroupLeave, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setGroupKick, data: ConnectionContent.Params.SetGroupKick, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupNotice, data: ConnectionContent.Params.GetGroupNotice, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupNotice> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.sendGroupNotice, data: ConnectionContent.Params.SendGroupNotice, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.sendGroupSign, data: ConnectionContent.Params.SendGroupSign, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.deleteEssenceMsg, data: ConnectionContent.Params.DeleteEssenceMsg, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setEssenceMsg, data: ConnectionContent.Params.SetEssenceMsg, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setGroupWholeBan, data: ConnectionContent.Params.SetGroupWholeBan, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setGroupBan, data: ConnectionContent.Params.SetGroupBan, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setGroupSpecialTitle, data: ConnectionContent.Params.SetGroupSpecialTitle, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setGroupCard, data: ConnectionContent.Params.SetGroupCard, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setGroupAdmin, data: ConnectionContent.Params.SetGroupAdmin, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setGroupPortrait, data: ConnectionContent.Params.SetGroupPortrait, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setGroupName, data: ConnectionContent.Params.SetGroupName, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setGroupAddRequest, data: ConnectionContent.Params.SetGroupAddRequest, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setFriendAddRequest, data: ConnectionContent.Params.SetFriendAddRequest, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.canSendRecord, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CanSendRecord> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getRecord, data: ConnectionContent.Params.GetRecord, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetRecord> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.ocrImage, data: ConnectionContent.Params.OcrImage, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.OcrImage> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.canSendImage, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CanSendImage> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getImage, data: ConnectionContent.Params.GetImage, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetImage> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.sendPrivateForwardMsg, data: ConnectionContent.Params.SendPrivateForwardMsg, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.sendGroupForwardMsg, data: ConnectionContent.Params.SendGroupForwardMsg, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getForwardMsg, data: ConnectionContent.Params.GetForwardMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetForwardMsg> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.clearMsgs, data: ConnectionContent.Params.ClearMsgs, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getHistoryMsg, data: ConnectionContent.Params.GetHistoryMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetHistoryMsg> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.deleteMsg, data: ConnectionContent.Params.DeleteMsg, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getMsg, data: ConnectionContent.Params.GetMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetMsg> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.sendMsg, data: ConnectionContent.Params.SendMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendMsg> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.sendGroupMsg, data: ConnectionContent.Params.SendGroupMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendGroupMsg> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.sendPrivateMsg, data: ConnectionContent.Params.SendPrivateMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendPrivateMsg> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.deleteUnidirectionalFriend, data: ConnectionContent.Params.DeleteUnidirectionalFriend, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.deleteFriend, data: ConnectionContent.Params.DeleteFriend, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.isBlacklistUin, data: ConnectionContent.Params.IsBlacklistUin, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.IsBlacklistUin> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getEssenceMsgList, data: ConnectionContent.Params.GetEssenceMsgList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetEssenceMsgList> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getFriendSystemMsg, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetFriendSystemMsg> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupSystemMsg, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupSystemMsg> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupHonorInfo, data: ConnectionContent.Params.GetGroupHonorInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupHonorInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupMemberList, data: ConnectionContent.Params.GetGroupMemberList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupMemberList> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupMemberInfo, data: ConnectionContent.Params.GetGroupMemberInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupMemberInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupList> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupInfo, data: ConnectionContent.Params.GetGroupInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getUnidirectionalFriendList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUnidirectionalFriendList> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getFriendList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetFriendList> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getStrangerInfo, data: ConnectionContent.Params.GetStrangerInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetStrangerInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getOnlineClients, data: ConnectionContent.Params.GetOnlineClients, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetOnlineClients> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setModelShow, data: ConnectionContent.Params.SetModelShow, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getModelShow, data: ConnectionContent.Params.GetModelShow, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetModelShow> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setQqProfile, data: ConnectionContent.Params.SetQqProfile, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getLoginInfo, data: ConnectionContent.Params.GetLoginInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetLoginInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action, data?: string | Record<string, any> | null | undefined, cb?: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any> | undefined, clientIndex: number = 0): void {
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
            this.logger.error("向客户端发送数据时出错：")
            this.logger.error(err)
          }
        })
      }
    })
    
  }
  
  private receivePacket(data: ws.RawData, cb: (data: string) => void) {
    cb(data.toString("utf-8"))
  }

  // 以下函数仅被内置类调用
  public _addGroup(group: number, clientIndex: number = 0): void {
    if (!this.getGroup(group, clientIndex) && this.clientAddresses[clientIndex]) {
      this.groups[this.clientAddresses[clientIndex]][group] = new Group(group, this)
    }
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
    if (!this.getFriend(friend.user_id, clientIndex) && this.clientAddresses[clientIndex]) {
      this.friends[this.clientAddresses[clientIndex]][friend.user_id] = new User(friend, this)
    }
  }
  public _removeFriend(id: number, clientIndex: number = 0): void {
    if (this.getGroup(id, clientIndex)) {
      delete this.friends[this.clientAddresses[clientIndex]][id]
    }
  }
}