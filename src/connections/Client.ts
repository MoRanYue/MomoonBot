import type { ConnectionContent } from "src/types/connectionContent";
import type { Connection } from "./Connection";
import type { DataType } from "src/types/dataType";
import { ConnectionEnum } from "../types/enums";
import { User } from "../processors/sets/User";
import { Group } from "../processors/sets/Group";
import type { Event } from "src/types/event";

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

  public abstract send(action: ConnectionEnum.Action.uploadGroupImage, data: ConnectionContent.Params.UploadGroupImage, cb?: DataType.RawResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getWeather, data: ConnectionContent.Params.GetWeather, cb?: DataType.RawResponseFunction<object> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getWeatherCityCode, data: ConnectionContent.Params.GetWeatherCityCode, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetWeatherCityCode> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.shut, data?: null | undefined, cb?: DataType.RawResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.shell, data: ConnectionContent.Params.Shell, cb?: DataType.RawResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.log, data: ConnectionContent.Params.Log, cb?: DataType.RawResponseFunction<string> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getStartTime, data?: null | undefined, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetStartTime> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getDeviceBattery, data?: null | undefined, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.GetDeviceBattery> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.downloadFile, data: ConnectionContent.Params.DownloadFile, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.DownloadFile> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.uploadFile, data: string, cb?: DataType.RawResponseFunction<ConnectionContent.ActionResponse.UploadFile> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.switchAccount, data: ConnectionContent.Params.SwitchAccount, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupFileUrl, data: ConnectionContent.Params.GetGroupFileUrl, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFileUrl> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupFilesByFolder, data: ConnectionContent.Params.GetGroupFilesByFolder, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFilesByFolder> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupRootFiles, data: ConnectionContent.Params.GetGroupRootFiles, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupRootFiles> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupFileSystemInfo, data: ConnectionContent.Params.GetGroupFileSystemInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupFileSystemInfo> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.deleteGroupFolder, data: ConnectionContent.Params.DeleteGroupFolder, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.createGroupFileFolder, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CreateGroupFileFolder> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.deleteGroupFile, data: ConnectionContent.Params.DeleteGroupFile, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.uploadGroupFile, data: ConnectionContent.Params.UploadGroupFile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.UploadGroupFile> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.uploadPrivateFile, data: ConnectionContent.Params.UploadPrivateFile, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.UploadPrivateFile> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupAtAllRemain, data: ConnectionContent.Params.GetGroupAtAllRemain, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupAtAllRemain> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getProhibitedMemberList, data: ConnectionContent.Params.GetProhibitedMemberList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetProhibitedMemberList> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.groupTouch, data: ConnectionContent.Params.GroupTouch, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setGroupLeave, data: ConnectionContent.Params.SetGroupLeave, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setGroupKick, data: ConnectionContent.Params.SetGroupKick, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupNotice, data: ConnectionContent.Params.GetGroupNotice, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupNotice> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.sendGroupNotice, data: ConnectionContent.Params.SendGroupNotice, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.sendGroupSign, data: ConnectionContent.Params.SendGroupSign, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.deleteEssenceMsg, data: ConnectionContent.Params.DeleteEssenceMsg, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setEssenceMsg, data: ConnectionContent.Params.SetEssenceMsg, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setGroupWholeBan, data: ConnectionContent.Params.SetGroupWholeBan, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setGroupBan, data: ConnectionContent.Params.SetGroupBan, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setGroupSpecialTitle, data: ConnectionContent.Params.SetGroupSpecialTitle, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setGroupCard, data: ConnectionContent.Params.SetGroupCard, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setGroupAdmin, data: ConnectionContent.Params.SetGroupAdmin, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setGroupPortrait, data: ConnectionContent.Params.SetGroupPortrait, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setGroupName, data: ConnectionContent.Params.SetGroupName, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setGroupAddRequest, data: ConnectionContent.Params.SetGroupAddRequest, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setFriendAddRequest, data: ConnectionContent.Params.SetFriendAddRequest, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.canSendRecord, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CanSendRecord> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getRecord, data: ConnectionContent.Params.GetRecord, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetRecord> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.ocrImage, data: ConnectionContent.Params.OcrImage, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.OcrImage> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.canSendImage, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.CanSendImage> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getImage, data: ConnectionContent.Params.GetImage, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetImage> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.sendPrivateForwardMsg, data: ConnectionContent.Params.SendPrivateForwardMsg, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.sendGroupForwardMsg, data: ConnectionContent.Params.SendGroupForwardMsg, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getForwardMsg, data: ConnectionContent.Params.GetForwardMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetForwardMsg> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.clearMsgs, data: ConnectionContent.Params.ClearMsgs, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getHistoryMsg, data: ConnectionContent.Params.GetHistoryMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetHistoryMsg> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.deleteMsg, data: ConnectionContent.Params.DeleteMsg, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getMsg, data: ConnectionContent.Params.GetMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetMsg> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.sendMsg, data: ConnectionContent.Params.SendMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendMsg> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.sendGroupMsg, data: ConnectionContent.Params.SendGroupMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendGroupMsg> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.sendPrivateMsg, data: ConnectionContent.Params.SendPrivateMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.SendPrivateMsg> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.deleteUnidirectionalFriend, data: ConnectionContent.Params.DeleteUnidirectionalFriend, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.deleteFriend, data: ConnectionContent.Params.DeleteFriend, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.isBlacklistUin, data: ConnectionContent.Params.IsBlacklistUin, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.IsBlacklistUin> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getEssenceMsgList, data: ConnectionContent.Params.GetEssenceMsgList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetEssenceMsgList> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getFriendSystemMsg, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetFriendSystemMsg> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupSystemMsg, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupSystemMsg> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupHonorInfo, data: ConnectionContent.Params.GetGroupHonorInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupHonorInfo> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupMemberList, data: ConnectionContent.Params.GetGroupMemberList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupMemberList> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupMemberInfo, data: ConnectionContent.Params.GetGroupMemberInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupMemberInfo> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupList> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getGroupInfo, data: ConnectionContent.Params.GetGroupInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetGroupInfo> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getUnidirectionalFriendList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetUnidirectionalFriendList> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getFriendList, data?: null | undefined, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetFriendList> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getStrangerInfo, data: ConnectionContent.Params.GetStrangerInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetStrangerInfo> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getOnlineClients, data: ConnectionContent.Params.GetOnlineClients, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetOnlineClients> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setModelShow, data: ConnectionContent.Params.SetModelShow, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getModelShow, data: ConnectionContent.Params.GetModelShow, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetModelShow> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.setQqProfile, data: ConnectionContent.Params.SetQqProfile, cb?: DataType.ResponseFunction<null> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.getLoginInfo, data: ConnectionContent.Params.GetLoginInfo, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.GetLoginInfo> | undefined): void;
  public abstract send(action: ConnectionEnum.Action.favoriteGetItemList, data: ConnectionContent.Params.FavoriteGetItemList, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteGetItemList>): void
  public abstract send(action: ConnectionEnum.Action.favoriteGetItemContent, data: ConnectionContent.Params.FavoriteGetItemContent, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteGetItemContent>): void
  public abstract send(action: ConnectionEnum.Action.favoriteAddTextMsg, data: ConnectionContent.Params.FavoriteAddTextMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteAddTextMsg>): void
  public abstract send(action: ConnectionEnum.Action.favoriteAddImageMsg, data: ConnectionContent.Params.FavoriteAddImageMsg, cb?: DataType.ResponseFunction<ConnectionContent.ActionResponse.FavoriteAddImageMsg>): void
  public abstract send(action: string, data?: string | Record<string, any> | null | undefined, cb?: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any> | undefined): void

  public abstract getGroupMember(groupId: number, userId: number): User | undefined

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