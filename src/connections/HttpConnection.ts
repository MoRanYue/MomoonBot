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
        const dataStr: string = req.body
        const data = <object>Utils.jsonToData(dataStr)
        if (Object.hasOwn(data, "echo")) {
          this.ev.emit("response", <ConnectionContent.Connection.Response<number | object | object[]>>data)
        }
        else {
          this.logger.debug("==========================")
          this.logger.debug("Http Received Event Report")

          switch ((<Event.Reported>data).post_type) {
            case EventEnum.EventType.message:
              this.logger.debug("Type: Message")
              this.logger.debug(dataStr)

              this.ev.emit("message", <Event.Message>data)
              break;

            case EventEnum.EventType.messageSent:
              this.logger.debug("Type: MessageSent")
              this.logger.debug(dataStr)
            
              this.ev.emit("message", <Event.Message>data)
              break;
          
            case EventEnum.EventType.notice:
              this.logger.debug("Type: Notice")
              this.logger.debug(dataStr)

              this.ev.emit("notice", <Event.Notice>data)
              break;

            case EventEnum.EventType.request:
              this.logger.debug("Type: Request")
              this.logger.debug(dataStr)

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

  private async receivePacket(res: http.IncomingMessage, cb?: DataType.ResponseFunction<any>): Promise<void> {
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
    const req = http.request({
      method: "post",
      protocol: "http:",
      host: this.clientAddresses[clientIndex],
      pathname: "/" + action,
    }, this.receivePacket)
    req.on("error", err => {
      throw err
    })
    req.write(Utils.dataToJson(data ?? {}))
    req.end()
  }

  // 以下函数仅被内置类调用
  public _addGroup(group: number, first?: any): void {
    if (!this.getGroup(group) && this.clientAddresses.length != 0) {
      this.groups[this.clientAddresses[0]][group] = new Group(group, this)
    }
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
    if (!this.getFriend(friend.user_id) && this.clientAddresses.length != 0) {
      this.friends[this.clientAddresses[0]][friend.user_id] = new User(friend, this)
    }
  }
  public _removeFriend(id: number, first?: any): void {
    if (this.getGroup(id)) {
      delete this.friends[this.clientAddresses[0]][id]
    }
  }
}
