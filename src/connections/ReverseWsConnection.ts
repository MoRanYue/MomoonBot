import type { CustomEventEmitter } from "src/types/CustomEventEmitter";
import { Connection } from "./Connection";
import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter";
import type { Event } from "src/types/event";
import ws from "ws"
import { Utils } from "../tools/Utils";
import { ConnectionEnum, EventEnum } from "../types/enums";
import { ConnectionContent } from "src/types/connectionContent";
import type { DataType } from "src/types/dataType";
import { Group } from "../processors/sets/Group";
import { User } from "../processors/sets/User";
import { Logger } from "../tools/Logger";
import { ReverseWsClient } from "./ReverseWsClient";
import { ConnectionIsClosedError } from "../exceptions/exceptions";
import { Client } from "./Client";

export class ReverseWsConnection extends Connection {
  protected clients: ReverseWsClient[] = [];
  protected readonly logger: Logger = new Logger("反向 WebSocket");
  protected token: string | null | undefined;
  protected server!: ws.Server;
  protected messageCbs: Record<string, DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>> = {}

  readonly ev: CustomEventEmitter.ReverseWsEventEmitter = new EventEmitter()
  
  constructor() {
    super();
  
    this.ev.on("response", (data: ConnectionContent.Connection.Response<any>) => {
      this.logger.debug("接收到客户端返回")
      this.logger.debug(Utils.dataToJson(data))
      this.clients.forEach(client => client._processResponse(data))
    })
    this.ev.on("_removeClient", removedClient => {
      for (let i = 0; i < this.clients.length; i++) {
        const client = this.clients[i];
        
        if (client.getAddress() == removedClient.getAddress()) {
          delete this.clients[i]
          break
        }
      }
    })
  }

  public createServer(port: number): this;
  public createServer(port: number, host?: string | undefined): this;
  public createServer(port: number, host?: string | undefined, token?: string | null): this;
  public createServer(port: number, host?: string | undefined, token?: string | null, cb?: VoidFunction | undefined): this {
    if (this.server) {
      this.stopServer()
    }

    this.server = new ws.Server({
      port,
      host,
    })
    this.token = token
    this.logger.setPrefix("反向 WebSocket @ " + Utils.showHostWithPort(host, port))

    if (cb) {
      this.server.on("listening", cb)
    }

    this.server.on("connection", (socket, req) => {
      this.ev.emit("connect")

      const address = Utils.showHostWithPort(req.socket.remoteAddress, req.socket.remotePort)
      this.logger.info("接收到客户端连接")
      this.logger.info("客户端地址：" + address)

      const auth = req.headers.authorization
      if (this.token) {
        if (!auth || auth.split(" ", 2).pop() != this.token) {
          this.logger.info("客户端鉴权失败")
          return
        }
      }

      const client = new ReverseWsClient(this, socket, req.socket.remoteAddress!, req.socket.remotePort!)
      const index = this.clients.push(client) - 1

      socket.on("message", buf => this.receivePacket(buf, dataStr => {
        const data = <object>Utils.jsonToData(dataStr)
        if (Object.hasOwn(data, "echo")) {
          this.ev.emit("response", <ConnectionContent.Connection.Response<number | object | object[]>>data)
        }
        else {
          switch ((<Event.Reported>data).post_type) {
            case EventEnum.EventType.message:
              this.logger.debug(`接收到“${client.getAddress()}”的事件上报`)
              this.logger.debug("类型：消息（Message）")
              this.logger.debug(dataStr)

              this.ev.emit("message", <Event.Message>data, client)
              break;

            case EventEnum.EventType.messageSent:
              this.logger.debug("接收到事件上报")
              this.logger.debug("类型：自发送消息（MessageSent）")
              this.logger.debug(dataStr)
            
              this.ev.emit("message", <Event.Message>data, client)
              break;
          
            case EventEnum.EventType.notice:
              this.logger.debug("接收到事件上报")
              this.logger.debug("类型：通知（Notice）")
              this.logger.debug(dataStr)

              this.ev.emit("notice", <Event.Notice>data, client)
              break;

            case EventEnum.EventType.request:
              this.logger.debug("接收到事件上报")
              this.logger.debug("类型：请求（Request）")
              this.logger.debug(dataStr)

              this.ev.emit("request", <Event.Request>data, client)
              break;
            
            case EventEnum.EventType.meta:
              this.ev.emit("meta", <Event.MetaEvent>data, client)
          
            default:
              this.ev.emit("unknown", <Event.Unknown>data, client)
              break;
          }
        }
      }))
      socket.on("close", () => {
        delete this.clients[index]
        this.logger.info("客户端连接关闭")
        this.logger.info("客户端地址：" + address)
      })
      socket.on("error", err => {
        if (err) {
          this.logger.error(`与客户端“${address}”通信时出现错误`)
          this.logger.error(err)
        }
      })

      this.logger.info("正在尝试获取群聊与好友信息")
      this.clients[index].send(ConnectionEnum.Action.getGroupList, undefined, data => {
        const groups: Record<number, Group> = {}
        data.data.forEach(group => groups[group.group_id] = new Group(group, this.clients[index]))
        this.clients[index].groups = groups
      })
      this.clients[index].send(ConnectionEnum.Action.getFriendList, undefined, data => {
        const friends: Record<number, User> = {}
        data.data.forEach(friend => friends[friend.user_id] = new User(friend, this.clients[index]))
        this.clients[index].friends = friends
      })
    })
    this.server.on("error", err => {
      if (err) {
        this.logger.error("服务端出现错误")
        this.logger.error(err)
      }
    })

    return this
  }

  public _processUnavailableClient(): void {
    this.clients.forEach((client, i) => {
      if (!client._connectable) {
        delete this.clients[i]
      }
    })
  }

  public stopServer(cb?: (err?: Error) => void): void {
    this.server.close(cb)
    this.clients = []
  }

  public connect(address: string): boolean {
    throw new Error("Method not implemented.");
  }

  public getGroups(clientIndex: number = 0): Record<number, Group> | undefined {
    if (this.clients[clientIndex]) {
      return this.clients[clientIndex].groups
    }
  }
  public getGroup(id: number, clientIndex: number = 0): Group | undefined {
    if (this.clients[clientIndex]) {
      return this.clients[clientIndex].groups[id]
    }
  }
  public getFriends(clientIndex: number = 0): Record<number, User> | undefined {
    if (this.clients[clientIndex]) {
      return this.clients[clientIndex].friends
    }
  }
  public getFriend(id: number, clientIndex: number = 0): User | undefined {
    if (this.clients[clientIndex]) {
      return this.clients[clientIndex].friends[id]
    }
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
  public send(action: ConnectionEnum.Action.uploadFile, data: ConnectionContent.Params.UploadFile, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.UploadFile>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.uploadFileToShamrock, data: ConnectionContent.Params.UploadFileToShamrock, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.UploadFileToShamrock>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.switchAccount, data: ConnectionContent.Params.SwitchAccount, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.sendLike, data: ConnectionContent.Params.SendLike, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupFileUrl, data: ConnectionContent.Params.GetGroupFileUrl, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFileUrl> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupFilesByFolder, data: ConnectionContent.Params.GetGroupFilesByFolder, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFilesByFolder> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupRootFiles, data: ConnectionContent.Params.GetGroupRootFiles, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupRootFiles> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupFileSystemInfo, data: ConnectionContent.Params.GetGroupFileSystemInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFileSystemInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.deleteGroupFolder, data: ConnectionContent.Params.DeleteGroupFolder, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.renameGroupFolder, data: ConnectionContent.Params.RenameGroupFolder, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.createGroupFileFolder, data: ConnectionContent.Params.CreateGroupFileFolder, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CreateGroupFileFolder> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.deleteGroupFile, data: ConnectionContent.Params.DeleteGroupFile, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.uploadGroupFile, data: ConnectionContent.Params.UploadGroupFile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.UploadGroupFile> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.uploadPrivateFile, data: ConnectionContent.Params.UploadPrivateFile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.UploadPrivateFile> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupAtAllRemain, data: ConnectionContent.Params.GetGroupAtAllRemain, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupAtAllRemain> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getProhibitedMemberList, data: ConnectionContent.Params.GetProhibitedMemberList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetProhibitedMemberList> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.groupTouch, data: ConnectionContent.Params.GroupTouch, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.poke, data: ConnectionContent.Params.Poke, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setGroupCommentFace, data: ConnectionContent.Params.SetGroupCommentFace, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
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
  public send(action: ConnectionEnum.Action.getUid, data: ConnectionContent.Params.GetUid, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUid> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getUinByUid, data: ConnectionContent.Params.GetUinByUid, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUinByUid> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupList> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getGroupInfo, data: ConnectionContent.Params.GetGroupInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getNotJoinedGroupInfo, data: ConnectionContent.Params.GetNotJoinedGroupInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetNotJoinedGroupInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getUnidirectionalFriendList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUnidirectionalFriendList> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getFriendList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetFriendList> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getStrangerInfo, data: ConnectionContent.Params.GetStrangerInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetStrangerInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getUserInfo, data: ConnectionContent.Params.GetUserInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUserInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getStatus, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetStatus> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getSelfInfo, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetSelfInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getVersionInfo, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetVersionInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.cleanCache, data?: null | undefined, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getSupportedActions, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetSupportedActions> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getOnlineClients, data: ConnectionContent.Params.GetOnlineClients, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetOnlineClients> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setModelShow, data: ConnectionContent.Params.SetModelShow, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getModelShow, data: ConnectionContent.Params.GetModelShow, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetModelShow> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.setQqProfile, data: ConnectionContent.Params.SetQqProfile, cb?: DataType.ResponseFunction<null> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getLoginInfo, data: ConnectionContent.Params.GetLoginInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetLoginInfo> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.favoriteGetItemList, data: ConnectionContent.Params.FavoriteGetItemList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteGetItemList> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.favoriteGetItemContent, data: ConnectionContent.Params.FavoriteGetItemContent, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteGetItemContent> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.favoriteAddTextMsg, data: ConnectionContent.Params.FavoriteAddTextMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteAddTextMsg> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.favoriteAddImageMsg, data: ConnectionContent.Params.FavoriteAddImageMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteAddImageMsg> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getCsrfToken, data?: ConnectionContent.Params.GetCsrfToken | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetCsrfToken> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getCookies, data?: ConnectionContent.Params.GetCookies | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetCookies> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getCredentials, data?: ConnectionContent.Params.GetCredentials | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetCredentials> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getHttpCookies, data?: ConnectionContent.Params.GetHttpCookies | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetHttpCookies> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.test, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.Test> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.getLatestEvents, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetLatestEvents> | undefined, clientIndex?: number): void;
  public send(action: ConnectionEnum.Action.createGuildRole, data: ConnectionContent.Params.CreateGuildRole, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CreateGuildRole>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.setGuildMemberRole, data: ConnectionContent.Params.SetGuildMemberRole, cb?: DataType.ResponseFunction<null>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.deleteGuildRole, data: ConnectionContent.Params.DeleteGuildRole, cb?: DataType.ResponseFunction<null>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.getGuildRoles, data: ConnectionContent.Params.GetGuildRoles, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildRoles>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.getGuildFeeds, data: ConnectionContent.Params.GetGuildFeeds, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildFeeds>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.sendGuildChannelMsg, data: ConnectionContent.Params.SendGuildChannelMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendGuildChannelMsg>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.getGuildMemberProfile, data: ConnectionContent.Params.GetGuildMemberProfile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildMemberProfile>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.getGuildMemberList, data: ConnectionContent.Params.GetGuildMemberList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildMemberList>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.getGuildChannelList, data: ConnectionContent.Params.GetGuildChannelList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildChannelList>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.getGuildMetaByGuest, data: ConnectionContent.Params.GetGuildMetaByGuest, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildMetaByGuest>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.getGuildServiceProfile, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildServiceProfile>, clientIndex?: number): void
  public send(action: ConnectionEnum.Action.getGuildList, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildList>, clientIndex?: number): void
  public send(action: string, data?: string | Record<string, any> | null | undefined, cb?: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any> | undefined, clientIndex?: number): void;
  public send(action: string, data?: string | Record<string, any> | null | undefined, cb?: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any> | undefined, clientIndex: number = 0): void {
    if (this.clients[clientIndex] && this.server.clients.has(this.clients[clientIndex]._client)) {
      this.clients[clientIndex].send(action, data, cb)
      return
    }
    throw new ConnectionIsClosedError(`找不到客户端 ${clientIndex}`)
  }
  
  private receivePacket(data: ws.RawData, cb: (data: string) => void) {
    cb(data.toString("utf-8"))
  }
  
  public getClients(): ReverseWsClient[] {
    return this.clients
  }

  // 以下函数仅被内置类调用
  public _addGroup(group: number, clientIndex: number = 0): void {
    this.clients[clientIndex]._addGroup(group)
  }
  public _removeGroup(id: number, clientIndex: number = 0): void {
    this.clients[clientIndex]._removeGroup(id)
  }
  public _addGroupMember(member: Event.GroupMemberIncrease, clientIndex?: number): void
  public _addGroupMember(member: DataType.GroupMemberParams, clientIndex?: number): void
  public _addGroupMember(member: Event.GroupMemberIncrease | DataType.GroupMemberParams, clientIndex: number = 0): void {
    this.clients[clientIndex]._addGroupMember(member)
  }
  public _removeGroupMember(member: Event.GroupMemberDecrease, clientIndex: number = 0): void {
    this.clients[clientIndex]._removeGroupMember(member)
  }
  public _processGroupAdminChange(admin: Event.GroupAdminChange, clientIndex: number = 0): void {
    this.clients[clientIndex]._processGroupAdminChange(admin)
  }
  public _processGroupMemberCardChange(card: Event.GroupCardChange, clientIndex: number = 0): void {
    this.clients[clientIndex]._processGroupMemberCardChange(card)
  }
  public _addFriend(friend: Event.FriendAdd, clientIndex: number = 0): void {
    this.clients[clientIndex]._addFriend(friend)
  }
  public _removeFriend(id: number, clientIndex: number = 0): void {
    this.clients[clientIndex]._removeFriend(id)
  }
}