import type { ConnectionContent } from "src/types/connectionContent"
import type { Connection } from "../../connections/Connection"
import type { Event } from "src/types/event"
import { ConnectionEnum, EventEnum, ListenerEnum } from "../../types/enums"
import { Utils } from "../../tools/Utils"
import { ListenerUtils } from "../../tools/ListenerUtils"

interface UserInfo {
  id: number
  groupId?: number
}

export class User {
  public id: number
  public name: string
  public displayName: string
  public remark?: string
  public age?: number
  public gender: number
  public group?: number

  public isFriend: boolean
  public isGroupMember: boolean
  public permission: ListenerEnum.Permission

  protected conn: Connection

  constructor(friend: number, conn: Connection)
  constructor(friend: UserInfo, conn: Connection)
  constructor(friend: Event.FriendAdd, conn: Connection)
  constructor(friend: ConnectionContent.ActionResponse.GetStrangerInfo, conn: Connection)
  constructor(friend: ConnectionContent.ActionResponse.GetGroupMemberInfo, conn: Connection)
  constructor(friend: ConnectionContent.ActionResponse.FriendListItem, conn: Connection)
  constructor(friend: number | 
  UserInfo | 
  Event.FriendAdd | 
  ConnectionContent.ActionResponse.FriendListItem | 
  ConnectionContent.ActionResponse.GetGroupMemberInfo | 
  ConnectionContent.ActionResponse.GetStrangerInfo, conn: Connection) {
    this.conn = conn

    this.id = 0
    this.name = ""
    this.displayName = ""
    this.gender = 0
    this.isFriend = false
    this.isGroupMember = false
    this.permission = ListenerEnum.Permission.user

    if (typeof friend == "number") {
      this.id = friend
      this.conn.send(ConnectionEnum.Action.getStrangerInfo, <ConnectionContent.Params.GetStrangerInfo>{
        user_id: this.id
      }, (data) => {
        const result = <ConnectionContent.ActionResponse.GetStrangerInfo>data.data
        this.name = result.nickname
        this.displayName = result.nickname
        this.gender = Utils.sexToId(result.sex)
        this.age = result.age
      })
      this.isFriend = Boolean(this.conn.getFriend(this.id))
      this.isGroupMember = false
      this.permission = ListenerUtils.isSuperuser(this.id) ? ListenerEnum.Permission.superuser : ListenerEnum.Permission.user
    }
    else if (Object.hasOwn(friend, "ext")) {
      friend = <ConnectionContent.ActionResponse.GetStrangerInfo>friend
      this.id = friend.user_id
      this.name = friend.nickname
      this.displayName = friend.nickname
      this.age = friend.age
      this.gender = Utils.sexToId(friend.sex)
      this.isFriend = Boolean(this.conn.getFriend(this.id))
      this.isGroupMember = false
      this.permission = ListenerEnum.Permission.user
    }
    else if (Object.hasOwn(friend, "user_remark")) {
      friend = <ConnectionContent.ActionResponse.FriendListItem>friend
      this.id = friend.user_id
      this.name = friend.user_name
      this.displayName = friend.user_displayname
      this.remark = friend.user_remark
      this.age = friend.age
      this.gender = friend.gender
      this.isFriend = true
      this.isGroupMember = false
      this.permission = ListenerUtils.isSuperuser(this.id) ? ListenerEnum.Permission.superuser : ListenerEnum.Permission.user
    }
    else if (Object.hasOwn(friend, "group_id")) {
      friend = <ConnectionContent.ActionResponse.GetGroupMemberInfo>friend
      this.id = friend.user_id
      this.gender = Utils.sexToId(friend.sex)
      this.name = friend.user_name
      this.displayName = friend.user_displayname
      this.remark = friend.nickname
      this.group = friend.group_id
      this.isFriend = Boolean(this.conn.getFriend(this.id))
      this.isGroupMember = true
      this.permission = ListenerUtils.userToPermission(this.id, friend.role)
    }
    else if (Object.hasOwn(friend, "id")) {
      friend = <UserInfo>friend
      this.id = friend.id
      this.group = friend.groupId

      if (this.group) {
        this.conn.send(ConnectionEnum.Action.getGroupMemberInfo, <ConnectionContent.Params.GetGroupMemberInfo>{
          group_id: friend.groupId,
          user_id: this.id
        }, data => {
          const result = <ConnectionContent.ActionResponse.GetGroupMemberInfo>data.data
          this.gender = Utils.sexToId(result.sex)
          this.displayName = result.user_displayname
          this.name = result.user_name
          this.remark = result.nickname
          this.isFriend = Boolean(this.conn.getFriend(this.id))
          this.isGroupMember = true
          this.permission = ListenerUtils.userToPermission(this.id, result.role)
        })

        return
      }

      this.conn.send(ConnectionEnum.Action.getStrangerInfo, <ConnectionContent.Params.GetStrangerInfo>{
        user_id: this.id
      }, (data) => {
        const result = <ConnectionContent.ActionResponse.GetStrangerInfo>data.data
        this.name = result.nickname
        this.displayName = result.nickname
        this.gender = Utils.sexToId(result.sex)
        this.age = result.age
        this.isFriend = Boolean(this.conn.getFriend(this.id))
        this.isGroupMember = false
        this.permission = ListenerUtils.isSuperuser(this.id) ? ListenerEnum.Permission.superuser : ListenerEnum.Permission.user
      })
    }
    else if (Object.hasOwn(friend, "notice_type")) {
      friend = <Event.FriendAdd>friend
      if (friend.notice_type != EventEnum.NoticeType.friendAdd) {
        throw new Error("无法识别用户信息")
      }

      this.id = friend.user_id
      this.conn.send(ConnectionEnum.Action.getStrangerInfo, <ConnectionContent.Params.GetStrangerInfo>{
        user_id: this.id
      }, (data) => {
        const result = <ConnectionContent.ActionResponse.GetStrangerInfo>data.data
        this.name = result.nickname
        this.displayName = result.nickname
        this.gender = Utils.sexToId(result.sex)
        this.age = result.age
        this.isFriend = true
        this.isGroupMember = false
        this.permission = ListenerUtils.isSuperuser(this.id) ? ListenerEnum.Permission.superuser : ListenerEnum.Permission.user
      })
    }
    else {
      throw new Error("无法识别用户信息")
    }
  }

  public get viewedName(): string {
    return this.remark || this.displayName || this.name || "unknown"
  }

  public sendMessage() {
    
  }
}