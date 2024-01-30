import type { ConnectionContent } from "src/types/connectionContent";
import type { DataType } from "src/types/dataType";
import { ConnectionEnum } from "../types/enums";
import { Client } from "./Client";
import { Utils } from "../tools/Utils";
import axios from "axios"
import { launcher } from "../app";
import { Group } from "../processors/sets/Group";
import { User } from "../processors/sets/User";
import { ActionFailedError } from "../exceptions/exceptions";
import type { Event } from "src/types/event";
import type { HttpConnection } from "./HttpConnection";

export class HttpClient extends Client {
  public groups: Record<number, Group> = {};
  public friends: Record<number, User> = {};

  protected connectable: boolean;
  protected _address: string;
  protected _port: number;
  protected _host?: string

  declare protected _conn: HttpConnection;

  protected inst: axios.AxiosInstance = axios.create({
    headers: {
      "Content-Encoding": "utf-8",
      "Content-Type": "application/json",
      "User-Agent": "MomoonBot/" + launcher.version
    },
    responseType: "text",
    responseEncoding: "utf-8"
  })

  constructor(conn: HttpConnection, address: string, host?: string, token?: string | null | undefined) {
    super(conn);

    this.inst.interceptors.request.use(config => {
      if (typeof token == "string") {
        config.headers.Authorization = "Bearer " + token
      }
      return config
    })

    this._port = 0
    this._address = address
    this._host = host
    this.connectable = Boolean(host)
  }

  public get host(): string | undefined {
    return this._host
  }

  public set host(target: string) {
    this._host = target
  }

  public get address(): string {
    return this._address
  }

  public getAddress(): string {
    return Utils.showHostWithPort(this._address, this._port)
  }

  public send(action: ConnectionEnum.Action.uploadGroupImage, data: ConnectionContent.Params.UploadGroupImage, cb?: DataType.RawResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.getWeather, data: ConnectionContent.Params.GetWeather, cb?: DataType.RawResponseFunction<object> | undefined): void;
  public send(action: ConnectionEnum.Action.getWeatherCityCode, data: ConnectionContent.Params.GetWeatherCityCode, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetWeatherCityCode> | undefined): void;
  public send(action: ConnectionEnum.Action.shut, data?: null | undefined, cb?: DataType.RawResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.shell, data: ConnectionContent.Params.Shell, cb?: DataType.RawResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.log, data: ConnectionContent.Params.Log, cb?: DataType.RawResponseFunction<string> | undefined): void;
  public send(action: ConnectionEnum.Action.getStartTime, data?: null | undefined, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetStartTime> | undefined): void;
  public send(action: ConnectionEnum.Action.getDeviceBattery, data?: null | undefined, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetDeviceBattery> | undefined): void;
  public send(action: ConnectionEnum.Action.downloadFile, data: ConnectionContent.Params.DownloadFile, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.DownloadFile> | undefined): void;
  public send(action: ConnectionEnum.Action.uploadFile, data: string, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.UploadFile> | undefined): void;
  public send(action: ConnectionEnum.Action.switchAccount, data: ConnectionContent.Params.SwitchAccount, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.sendLike, data: ConnectionContent.Params.SendLike, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupFileUrl, data: ConnectionContent.Params.GetGroupFileUrl, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFileUrl> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupFilesByFolder, data: ConnectionContent.Params.GetGroupFilesByFolder, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFilesByFolder> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupRootFiles, data: ConnectionContent.Params.GetGroupRootFiles, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupRootFiles> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupFileSystemInfo, data: ConnectionContent.Params.GetGroupFileSystemInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFileSystemInfo> | undefined): void;
  public send(action: ConnectionEnum.Action.deleteGroupFolder, data: ConnectionContent.Params.DeleteGroupFolder, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.renameGroupFolder, data: ConnectionContent.Params.RenameGroupFolder, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.createGroupFileFolder, data: ConnectionContent.Params.CreateGroupFileFolder, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CreateGroupFileFolder> | undefined): void;
  public send(action: ConnectionEnum.Action.deleteGroupFile, data: ConnectionContent.Params.DeleteGroupFile, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.uploadGroupFile, data: ConnectionContent.Params.UploadGroupFile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.UploadGroupFile> | undefined): void;
  public send(action: ConnectionEnum.Action.uploadPrivateFile, data: ConnectionContent.Params.UploadPrivateFile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.UploadPrivateFile> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupAtAllRemain, data: ConnectionContent.Params.GetGroupAtAllRemain, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupAtAllRemain> | undefined): void;
  public send(action: ConnectionEnum.Action.getProhibitedMemberList, data: ConnectionContent.Params.GetProhibitedMemberList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetProhibitedMemberList> | undefined): void;
  public send(action: ConnectionEnum.Action.groupTouch, data: ConnectionContent.Params.GroupTouch, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.poke, data: ConnectionContent.Params.Poke, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setGroupCommentFace, data: ConnectionContent.Params.SetGroupCommentFace, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setGroupLeave, data: ConnectionContent.Params.SetGroupLeave, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setGroupKick, data: ConnectionContent.Params.SetGroupKick, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupNotice, data: ConnectionContent.Params.GetGroupNotice, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupNotice> | undefined): void;
  public send(action: ConnectionEnum.Action.sendGroupNotice, data: ConnectionContent.Params.SendGroupNotice, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.sendGroupSign, data: ConnectionContent.Params.SendGroupSign, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.deleteEssenceMsg, data: ConnectionContent.Params.DeleteEssenceMsg, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setEssenceMsg, data: ConnectionContent.Params.SetEssenceMsg, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setGroupWholeBan, data: ConnectionContent.Params.SetGroupWholeBan, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setGroupBan, data: ConnectionContent.Params.SetGroupBan, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setGroupSpecialTitle, data: ConnectionContent.Params.SetGroupSpecialTitle, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setGroupCard, data: ConnectionContent.Params.SetGroupCard, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setGroupAdmin, data: ConnectionContent.Params.SetGroupAdmin, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setGroupPortrait, data: ConnectionContent.Params.SetGroupPortrait, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setGroupName, data: ConnectionContent.Params.SetGroupName, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setGroupAddRequest, data: ConnectionContent.Params.SetGroupAddRequest, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.setFriendAddRequest, data: ConnectionContent.Params.SetFriendAddRequest, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.canSendRecord, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CanSendRecord> | undefined): void;
  public send(action: ConnectionEnum.Action.getRecord, data: ConnectionContent.Params.GetRecord, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetRecord> | undefined): void;
  public send(action: ConnectionEnum.Action.ocrImage, data: ConnectionContent.Params.OcrImage, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.OcrImage> | undefined): void;
  public send(action: ConnectionEnum.Action.canSendImage, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CanSendImage> | undefined): void;
  public send(action: ConnectionEnum.Action.getImage, data: ConnectionContent.Params.GetImage, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetImage> | undefined): void;
  public send(action: ConnectionEnum.Action.sendPrivateForwardMsg, data: ConnectionContent.Params.SendPrivateForwardMsg, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.sendGroupForwardMsg, data: ConnectionContent.Params.SendGroupForwardMsg, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.getForwardMsg, data: ConnectionContent.Params.GetForwardMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetForwardMsg> | undefined): void;
  public send(action: ConnectionEnum.Action.clearMsgs, data: ConnectionContent.Params.ClearMsgs, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.getHistoryMsg, data: ConnectionContent.Params.GetHistoryMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetHistoryMsg> | undefined): void;
  public send(action: ConnectionEnum.Action.deleteMsg, data: ConnectionContent.Params.DeleteMsg, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.getMsg, data: ConnectionContent.Params.GetMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetMsg> | undefined): void;
  public send(action: ConnectionEnum.Action.sendMsg, data: ConnectionContent.Params.SendMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendMsg> | undefined): void;
  public send(action: ConnectionEnum.Action.sendGroupMsg, data: ConnectionContent.Params.SendGroupMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendGroupMsg> | undefined): void;
  public send(action: ConnectionEnum.Action.sendPrivateMsg, data: ConnectionContent.Params.SendPrivateMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendPrivateMsg> | undefined): void;
  public send(action: ConnectionEnum.Action.deleteUnidirectionalFriend, data: ConnectionContent.Params.DeleteUnidirectionalFriend, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.deleteFriend, data: ConnectionContent.Params.DeleteFriend, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.isBlacklistUin, data: ConnectionContent.Params.IsBlacklistUin, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.IsBlacklistUin> | undefined): void;
  public send(action: ConnectionEnum.Action.getEssenceMsgList, data: ConnectionContent.Params.GetEssenceMsgList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetEssenceMsgList> | undefined): void;
  public send(action: ConnectionEnum.Action.getFriendSystemMsg, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetFriendSystemMsg> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupSystemMsg, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupSystemMsg> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupHonorInfo, data: ConnectionContent.Params.GetGroupHonorInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupHonorInfo> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupMemberList, data: ConnectionContent.Params.GetGroupMemberList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupMemberList> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupMemberInfo, data: ConnectionContent.Params.GetGroupMemberInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupMemberInfo> | undefined): void;
  public send(action: ConnectionEnum.Action.getUid, data: ConnectionContent.Params.GetUid, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUid> | undefined): void;
  public send(action: ConnectionEnum.Action.getUinByUid, data: ConnectionContent.Params.GetUinByUid, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUinByUid> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupList> | undefined): void;
  public send(action: ConnectionEnum.Action.getGroupInfo, data: ConnectionContent.Params.GetGroupInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupInfo> | undefined): void;
  public send(action: ConnectionEnum.Action.getNotJoinedGroupInfo, data: ConnectionContent.Params.GetNotJoinedGroupInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetNotJoinedGroupInfo> | undefined): void;
  public send(action: ConnectionEnum.Action.getUnidirectionalFriendList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUnidirectionalFriendList> | undefined): void;
  public send(action: ConnectionEnum.Action.getFriendList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetFriendList> | undefined): void;
  public send(action: ConnectionEnum.Action.getStrangerInfo, data: ConnectionContent.Params.GetStrangerInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetStrangerInfo> | undefined): void;
  public send(action: ConnectionEnum.Action.getUserInfo, data: ConnectionContent.Params.GetUserInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUserInfo> | undefined): void;
  public send(action: ConnectionEnum.Action.getStatus, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetStatus> | undefined): void;
  public send(action: ConnectionEnum.Action.getSelfInfo, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetSelfInfo> | undefined): void;
  public send(action: ConnectionEnum.Action.getVersionInfo, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetVersionInfo> | undefined): void;
  public send(action: ConnectionEnum.Action.cleanCache, data?: null | undefined, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.getSupportedActions, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetSupportedActions> | undefined): void;
  public send(action: ConnectionEnum.Action.getOnlineClients, data: ConnectionContent.Params.GetOnlineClients, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetOnlineClients> | undefined): void;
  public send(action: ConnectionEnum.Action.setModelShow, data: ConnectionContent.Params.SetModelShow, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.getModelShow, data: ConnectionContent.Params.GetModelShow, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetModelShow> | undefined): void;
  public send(action: ConnectionEnum.Action.setQqProfile, data: ConnectionContent.Params.SetQqProfile, cb?: DataType.ResponseFunction<null> | undefined): void;
  public send(action: ConnectionEnum.Action.getLoginInfo, data: ConnectionContent.Params.GetLoginInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetLoginInfo> | undefined): void;
  public send(action: ConnectionEnum.Action.favoriteGetItemList, data: ConnectionContent.Params.FavoriteGetItemList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteGetItemList> | undefined): void;
  public send(action: ConnectionEnum.Action.favoriteGetItemContent, data: ConnectionContent.Params.FavoriteGetItemContent, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteGetItemContent> | undefined): void;
  public send(action: ConnectionEnum.Action.favoriteAddTextMsg, data: ConnectionContent.Params.FavoriteAddTextMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteAddTextMsg> | undefined): void;
  public send(action: ConnectionEnum.Action.favoriteAddImageMsg, data: ConnectionContent.Params.FavoriteAddImageMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteAddImageMsg> | undefined): void;
  public send(action: ConnectionEnum.Action.getCsrfToken, data?: ConnectionContent.Params.GetCsrfToken | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetCsrfToken> | undefined): void;
  public send(action: ConnectionEnum.Action.getCookies, data?: ConnectionContent.Params.GetCookies | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetCookies> | undefined): void;
  public send(action: ConnectionEnum.Action.getCredentials, data?: ConnectionContent.Params.GetCredentials | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetCredentials> | undefined): void;
  public send(action: ConnectionEnum.Action.getHttpCookies, data?: ConnectionContent.Params.GetHttpCookies | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetHttpCookies> | undefined): void;
  public send(action: ConnectionEnum.Action.test, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.Test> | undefined): void;
  public send(action: ConnectionEnum.Action.getLatestEvents, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetLatestEvents> | undefined): void;
  public send(action: string, data?: string | Record<string, any> | null | undefined, cb?: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any> | undefined): void;
  public send(action: string, data?: string | Record<string, any> | null | undefined, cb?: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any> | undefined): void {
    if (!this.host) {
      throw new ActionFailedError(null, action, undefined, undefined, `客户端没有指定请求地址`)
    }
    
    action = action.replaceAll(".", "/")
    if (!this.host.endsWith("/") && !action.startsWith("/")) {
      action = "/" + action
    }
    if (!data) {
      data = {}
    }
    if (typeof data != "string") {
      data = Utils.dataToJson(data)
    }

    this.inst.post(this.host + action, data).then(res => {
      if (res.status != 200) {
        throw new ActionFailedError(null, action, res.status, true)
      }

      let result: ConnectionContent.Connection.Response<any>
      try {
        result = <ConnectionContent.Connection.Response<any>>Utils.jsonToData(res.data)
      } catch (err) {
        throw new ActionFailedError(res.data, action, undefined, undefined, "返回数据的结构不正确")
      }

      this._conn._logger.debug(`接收到客户端“${this.getAddress()}”返回`)
      this._conn._logger.debug(data)
      this._conn._logger.debug(Utils.dataToJson(result))

      // if (result.status == ConnectionEnum.ResponseStatus.failed) {
      //   throw new ActionFailedError(result, action, result.retcode, undefined, result.message)
      // }

      if (cb) {
        cb(result)
      }
    }).catch(err => {
      if (err) {
        throw err
      }
    })
  }

  public getGroupMember(groupId: number, userId: number): User | undefined {
    if (this.groups[groupId]) {
      return this.groups[groupId].members[userId]
    }
  }

  public _addGroup(group: number): void {
    if (!this.groups[group]) {
      this.groups[group] = new Group(group, this)
    } 
  }
  public _removeGroup(id: number): void {
    if (this.groups[id]) {
      delete this.groups[id]
    }
  }
  public _addGroupMember(member: Event.GroupMemberIncrease): void;
  public _addGroupMember(member: DataType.GroupMemberParams): void;
  public _addGroupMember(member: Event.GroupMemberIncrease | DataType.GroupMemberParams): void
  public _addGroupMember(member: Event.GroupMemberIncrease | DataType.GroupMemberParams): void {
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
    if (this.groups[groupId]) {
      this.groups[groupId]._addMember(userId)
    }
  }
  public _removeGroupMember(member: Event.GroupMemberDecrease): void {
    if (this.groups[member.group_id]) {
      this.groups[member.group_id]._removeMember(member)
    }
  }
  public _processGroupAdminChange(admin: Event.GroupAdminChange): void {
    if (this.groups[admin.group_id]) {
      this.groups[admin.group_id]._processAdminChange(admin)
    }
  }
  public _processGroupMemberCardChange(card: Event.GroupCardChange): void {
    if (this.groups[card.group_id]) {
      this.groups[card.group_id]._processMemberCardChange(card)
    }
  }
  public _addFriend(friend: Event.FriendAdd): void {
    if (!this.friends[friend.user_id]) {
      this.friends[friend.user_id] = new User(friend, this)
    }
  }
  public _removeFriend(id: number): void {
    if (this.friends[id]) {
      delete this.friends[id]
    }
  }
}