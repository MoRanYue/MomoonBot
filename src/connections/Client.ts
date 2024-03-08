import type { ConnectionContent } from "src/types/connectionContent";
import type { Connection } from "./Connection";
import type { DataType } from "src/types/dataType";
import { ConnectionEnum } from "../types/enums";
import { User } from "../processors/sets/User";
import { Group } from "../processors/sets/Group";
import type { Event } from "src/types/event";

/**
 * 客户端（Bot 端）
 * @since 0.6.0
 */
export abstract class Client {
  protected abstract connectable: boolean
  protected abstract _address: string
  protected abstract _port: number

  public abstract groups: Record<number, Group>;
  public abstract friends: Record<number, User>;

  protected _conn: Connection

  constructor(conn: Connection) {
    this._conn = conn
  }

  public get conn(): Connection {
    return this._conn
  }

  public abstract getAddress(): string

  public abstract send(action: ConnectionEnum.Action.uploadGroupImage, data: ConnectionContent.Params.UploadGroupImage, cb?: DataType.RawResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.getWeather, data: ConnectionContent.Params.GetWeather, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetWeather>): void
  public abstract send(action: ConnectionEnum.Action.getWeatherCityCode, data: ConnectionContent.Params.GetWeatherCityCode, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetWeatherCityCode>): void
  public abstract send(action: ConnectionEnum.Action.shut, data?: null, cb?: DataType.RawResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.shell, data: ConnectionContent.Params.Shell, cb?: DataType.RawResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.log, data: ConnectionContent.Params.Log, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.Log>): void
  public abstract send(action: ConnectionEnum.Action.getStartTime, data?: null, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetStartTime>): void
  public abstract send(action: ConnectionEnum.Action.getDeviceBattery, data?: null, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetDeviceBattery>): void
  public abstract send(action: ConnectionEnum.Action.downloadFile, data: ConnectionContent.Params.DownloadFile, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.DownloadFile>): void
  public abstract send(action: ConnectionEnum.Action.uploadFile, data: ConnectionContent.Params.UploadFile, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.UploadFile>): void
  public abstract send(action: ConnectionEnum.Action.uploadFileToShamrock, data: ConnectionContent.Params.UploadFileToShamrock, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.UploadFileToShamrock>): void
  public abstract send(action: ConnectionEnum.Action.switchAccount, data: ConnectionContent.Params.SwitchAccount, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.sendLike, data: ConnectionContent.Params.SendLike, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.getGroupFileUrl, data: ConnectionContent.Params.GetGroupFileUrl, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFileUrl>): void
  public abstract send(action: ConnectionEnum.Action.getGroupFilesByFolder, data: ConnectionContent.Params.GetGroupFilesByFolder, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFilesByFolder>): void
  public abstract send(action: ConnectionEnum.Action.getGroupRootFiles, data: ConnectionContent.Params.GetGroupRootFiles, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupRootFiles>): void
  public abstract send(action: ConnectionEnum.Action.getGroupFileSystemInfo, data: ConnectionContent.Params.GetGroupFileSystemInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFileSystemInfo>): void
  public abstract send(action: ConnectionEnum.Action.deleteGroupFolder, data: ConnectionContent.Params.DeleteGroupFolder, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.renameGroupFolder, data: ConnectionContent.Params.RenameGroupFolder, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.createGroupFileFolder, data: ConnectionContent.Params.CreateGroupFileFolder, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CreateGroupFileFolder>): void
  public abstract send(action: ConnectionEnum.Action.deleteGroupFile, data: ConnectionContent.Params.DeleteGroupFile, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.uploadGroupFile, data: ConnectionContent.Params.UploadGroupFile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.UploadGroupFile>): void
  public abstract send(action: ConnectionEnum.Action.uploadPrivateFile, data: ConnectionContent.Params.UploadPrivateFile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.UploadPrivateFile>): void
  public abstract send(action: ConnectionEnum.Action.getGroupAtAllRemain, data: ConnectionContent.Params.GetGroupAtAllRemain, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupAtAllRemain>): void
  public abstract send(action: ConnectionEnum.Action.getProhibitedMemberList, data: ConnectionContent.Params.GetProhibitedMemberList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetProhibitedMemberList>): void
  public abstract send(action: ConnectionEnum.Action.groupTouch, data: ConnectionContent.Params.GroupTouch, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.poke, data: ConnectionContent.Params.Poke, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setGroupCommentFace, data: ConnectionContent.Params.SetGroupCommentFace, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setGroupLeave, data: ConnectionContent.Params.SetGroupLeave, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setGroupKick, data: ConnectionContent.Params.SetGroupKick, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.getGroupNotice, data: ConnectionContent.Params.GetGroupNotice, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupNotice>): void
  public abstract send(action: ConnectionEnum.Action.sendGroupNotice, data: ConnectionContent.Params.SendGroupNotice, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.sendGroupSign, data: ConnectionContent.Params.SendGroupSign, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.deleteEssenceMsg, data: ConnectionContent.Params.DeleteEssenceMsg, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setEssenceMsg, data: ConnectionContent.Params.SetEssenceMsg, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setGroupWholeBan, data: ConnectionContent.Params.SetGroupWholeBan, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setGroupBan, data: ConnectionContent.Params.SetGroupBan, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setGroupSpecialTitle, data: ConnectionContent.Params.SetGroupSpecialTitle, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setGroupCard, data: ConnectionContent.Params.SetGroupCard, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setGroupAdmin, data: ConnectionContent.Params.SetGroupAdmin, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setGroupPortrait, data: ConnectionContent.Params.SetGroupPortrait, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setGroupName, data: ConnectionContent.Params.SetGroupName, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setGroupAddRequest, data: ConnectionContent.Params.SetGroupAddRequest, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.setFriendAddRequest, data: ConnectionContent.Params.SetFriendAddRequest, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.canSendRecord, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CanSendRecord>): void
  public abstract send(action: ConnectionEnum.Action.getRecord, data: ConnectionContent.Params.GetRecord, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetRecord>): void
  public abstract send(action: ConnectionEnum.Action.ocrImage, data: ConnectionContent.Params.OcrImage, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.OcrImage>): void
  public abstract send(action: ConnectionEnum.Action.canSendImage, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CanSendImage>): void
  public abstract send(action: ConnectionEnum.Action.getImage, data: ConnectionContent.Params.GetImage, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetImage>): void
  public abstract send(action: ConnectionEnum.Action.sendPrivateForwardMsg, data: ConnectionContent.Params.SendPrivateForwardMsg, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.sendGroupForwardMsg, data: ConnectionContent.Params.SendGroupForwardMsg, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.getForwardMsg, data: ConnectionContent.Params.GetForwardMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetForwardMsg>): void
  public abstract send(action: ConnectionEnum.Action.clearMsgs, data: ConnectionContent.Params.ClearMsgs, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.getHistoryMsg, data: ConnectionContent.Params.GetHistoryMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetHistoryMsg>): void
  public abstract send(action: ConnectionEnum.Action.deleteMsg, data: ConnectionContent.Params.DeleteMsg, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.getMsg, data: ConnectionContent.Params.GetMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetMsg>): void
  public abstract send(action: ConnectionEnum.Action.sendMsg, data: ConnectionContent.Params.SendMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendMsg>): void
  public abstract send(action: ConnectionEnum.Action.sendGroupMsg, data: ConnectionContent.Params.SendGroupMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendGroupMsg>): void
  public abstract send(action: ConnectionEnum.Action.sendPrivateMsg, data: ConnectionContent.Params.SendPrivateMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendPrivateMsg>): void
  public abstract send(action: ConnectionEnum.Action.deleteUnidirectionalFriend, data: ConnectionContent.Params.DeleteUnidirectionalFriend, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.deleteFriend, data: ConnectionContent.Params.DeleteFriend, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.isBlacklistUin, data: ConnectionContent.Params.IsBlacklistUin, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.IsBlacklistUin>): void
  public abstract send(action: ConnectionEnum.Action.getEssenceMsgList, data: ConnectionContent.Params.GetEssenceMsgList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetEssenceMsgList>): void
  public abstract send(action: ConnectionEnum.Action.getFriendSystemMsg, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetFriendSystemMsg>): void
  public abstract send(action: ConnectionEnum.Action.getGroupSystemMsg, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupSystemMsg>): void
  public abstract send(action: ConnectionEnum.Action.getGroupHonorInfo, data: ConnectionContent.Params.GetGroupHonorInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupHonorInfo>): void
  public abstract send(action: ConnectionEnum.Action.getGroupMemberList, data: ConnectionContent.Params.GetGroupMemberList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupMemberList>): void
  public abstract send(action: ConnectionEnum.Action.getGroupMemberInfo, data: ConnectionContent.Params.GetGroupMemberInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupMemberInfo>): void
  public abstract send(action: ConnectionEnum.Action.getUid, data: ConnectionContent.Params.GetUid, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUid>): void
  public abstract send(action: ConnectionEnum.Action.getUinByUid, data: ConnectionContent.Params.GetUinByUid, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUinByUid>): void
  public abstract send(action: ConnectionEnum.Action.getGroupList, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupList>): void
  public abstract send(action: ConnectionEnum.Action.getGroupInfo, data: ConnectionContent.Params.GetGroupInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupInfo>): void
  public abstract send(action: ConnectionEnum.Action.getNotJoinedGroupInfo, data: ConnectionContent.Params.GetNotJoinedGroupInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetNotJoinedGroupInfo>): void
  public abstract send(action: ConnectionEnum.Action.getUnidirectionalFriendList, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUnidirectionalFriendList>): void
  public abstract send(action: ConnectionEnum.Action.getFriendList, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetFriendList>): void
  public abstract send(action: ConnectionEnum.Action.getStrangerInfo, data: ConnectionContent.Params.GetStrangerInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetStrangerInfo>): void
  public abstract send(action: ConnectionEnum.Action.getUserInfo, data: ConnectionContent.Params.GetUserInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUserInfo>): void
  public abstract send(action: ConnectionEnum.Action.getStatus, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetStatus>): void
  public abstract send(action: ConnectionEnum.Action.getSelfInfo, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetSelfInfo>): void
  public abstract send(action: ConnectionEnum.Action.getVersionInfo, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetVersionInfo>): void
  public abstract send(action: ConnectionEnum.Action.cleanCache, data?: null, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.getSupportedActions, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetSupportedActions>): void
  public abstract send(action: ConnectionEnum.Action.getOnlineClients, data: ConnectionContent.Params.GetOnlineClients, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetOnlineClients>): void
  public abstract send(action: ConnectionEnum.Action.setModelShow, data: ConnectionContent.Params.SetModelShow, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.getModelShow, data: ConnectionContent.Params.GetModelShow, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetModelShow>): void
  public abstract send(action: ConnectionEnum.Action.setQqProfile, data: ConnectionContent.Params.SetQqProfile, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.getLoginInfo, data: ConnectionContent.Params.GetLoginInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetLoginInfo>): void
  public abstract send(action: ConnectionEnum.Action.favoriteGetItemList, data: ConnectionContent.Params.FavoriteGetItemList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteGetItemList>): void
  public abstract send(action: ConnectionEnum.Action.favoriteGetItemContent, data: ConnectionContent.Params.FavoriteGetItemContent, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteGetItemContent>): void
  public abstract send(action: ConnectionEnum.Action.favoriteAddTextMsg, data: ConnectionContent.Params.FavoriteAddTextMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteAddTextMsg>): void
  public abstract send(action: ConnectionEnum.Action.favoriteAddImageMsg, data: ConnectionContent.Params.FavoriteAddImageMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteAddImageMsg>): void
  public abstract send(action: ConnectionEnum.Action.getCsrfToken, data?: ConnectionContent.Params.GetCsrfToken, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetCsrfToken>): void
  public abstract send(action: ConnectionEnum.Action.getCookies, data?: ConnectionContent.Params.GetCookies, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetCookies>): void
  public abstract send(action: ConnectionEnum.Action.getCredentials, data?: ConnectionContent.Params.GetCredentials, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetCredentials>): void
  public abstract send(action: ConnectionEnum.Action.getHttpCookies, data?: ConnectionContent.Params.GetHttpCookies, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetHttpCookies>): void
  public abstract send(action: ConnectionEnum.Action.test, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.Test>): void
  public abstract send(action: ConnectionEnum.Action.getLatestEvents, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetLatestEvents>): void
  public abstract send(action: ConnectionEnum.Action.createGuildRole, data: ConnectionContent.Params.CreateGuildRole, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CreateGuildRole>): void
  public abstract send(action: ConnectionEnum.Action.setGuildMemberRole, data: ConnectionContent.Params.SetGuildMemberRole, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.deleteGuildRole, data: ConnectionContent.Params.DeleteGuildRole, cb?: DataType.ResponseFunction<null>): void
  public abstract send(action: ConnectionEnum.Action.getGuildRoles, data: ConnectionContent.Params.GetGuildRoles, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildRoles>): void
  public abstract send(action: ConnectionEnum.Action.getGuildFeeds, data: ConnectionContent.Params.GetGuildFeeds, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildFeeds>): void
  public abstract send(action: ConnectionEnum.Action.sendGuildChannelMsg, data: ConnectionContent.Params.SendGuildChannelMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendGuildChannelMsg>): void
  public abstract send(action: ConnectionEnum.Action.getGuildMemberProfile, data: ConnectionContent.Params.GetGuildMemberProfile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildMemberProfile>): void
  public abstract send(action: ConnectionEnum.Action.getGuildMemberList, data: ConnectionContent.Params.GetGuildMemberList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildMemberList>): void
  public abstract send(action: ConnectionEnum.Action.getGuildChannelList, data: ConnectionContent.Params.GetGuildChannelList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildChannelList>): void
  public abstract send(action: ConnectionEnum.Action.getGuildMetaByGuest, data: ConnectionContent.Params.GetGuildMetaByGuest, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildMetaByGuest>): void
  public abstract send(action: ConnectionEnum.Action.getGuildServiceProfile, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildServiceProfile>): void
  public abstract send(action: ConnectionEnum.Action.getGuildList, data?: null, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGuildList>): void
  public abstract send(action: string, data?: Record<string, any> | string | null, cb?: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): void
  public abstract send(action: string, data?: Record<string, any> | string | null, cb?: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): void

  public abstract getGroupMember(groupId: number, userId: number): User | undefined

  public getUserId(uids: string[] | string, cb: (userIds: Record<string, number>) => void | Promise<void>): void {
    this.send(ConnectionEnum.Action.getUinByUid, {
      uid_list: typeof uids == "string" ? [uids] : uids
    }, data => cb(data.data))
  }
  public getUid(userIds: number[] | number, cb: (uids: Record<string, string>) => void | Promise<void>): void {
    this.send(ConnectionEnum.Action.getUid, {
      uin_list: typeof userIds == "number" ? [userIds] : userIds
    }, data => cb(data.data))
  }
  
  /**
   * 上传文件到OpenShamrock的缓存目录
   * @param file 文件内容
   * @param [segmented=true] 是否分片上传
   * @param [segmentedUplodingThreshold=10485760] 分段上传阈值（单位：字节）（默认为10MB）
   * @param [segmentSize=10485760] 文件块大小（单位：字节）（默认为10MB）
   * @param [finishingCb] 完成时的回调函数
   * @param [uplodingCb] 每个文件块上传时的回调函数
   * @since 0.8.7
   */
  public abstract uploadFileToCache(file: string | Buffer, segmented?: boolean, segmentedUplodingThreshold?: number, segmentSize?: number, finishingCb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.UploadFileToShamrock>, uploadingCb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.UploadFileToShamrock>): void

  // 以下函数仅被内置类调用
  public abstract _addGroup(group: number): void
  public abstract _removeGroup(id: number): void
  public abstract _addGroupMember(member: Event.GroupMemberIncrease): void
  public abstract _addGroupMember(member: DataType.GroupMemberParams): void
  public abstract _addGroupMember(member: Event.GroupMemberIncrease | DataType.GroupMemberParams): void
  public abstract _addGroupMember(member: Event.GroupMemberIncrease | DataType.GroupMemberParams): void
  public abstract _removeGroupMember(member: Event.GroupMemberDecrease): void
  public abstract _processGroupAdminChange(admin: Event.GroupAdminChange): void
  public abstract _processGroupMemberCardChange(card: Event.GroupCardChange): void
  public abstract _addFriend(friend: Event.FriendAdd): void
  public abstract _removeFriend(id: number): void
}