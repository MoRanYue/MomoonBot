import type { ConnectionContent } from "src/types/connectionContent"
import { ConnectionEnum } from "../../types/enums"
import { User } from "./User"
import type { Event } from "src/types/event"
import type { Client } from "../../connections/Client"

export class Group {
  public id: number
  public name!: string
  public remark!: string
  public isFrozen!: boolean
  public maxMemberNumber!: number
  public memberNumber!: number
  public admins: Record<number, User> = {}
  public members: Record<number, User> = {}

  protected client: Client

  constructor(group: number, client: Client)
  constructor(group: ConnectionContent.ActionResponse.GetGroupInfo, client: Client)
  constructor(group: number | ConnectionContent.ActionResponse.GetGroupInfo, client: Client) {
    this.client = client

    if (typeof group == "number") {
      this.id = group
      this.client.send(ConnectionEnum.Action.getGroupInfo, {
        group_id: this.id
      }, data => {
        const result = data.data
        this.name = result.group_name
        this.remark = result.group_remark
        this.isFrozen = result.is_frozen
        this.maxMemberNumber = result.max_member
        this.memberNumber = result.member_num

        this.client.send(ConnectionEnum.Action.getGroupMemberList, {
          group_id: this.id
        }, data => {
          data.data.forEach(member => {
            const user = new User(member, this.client)
            this.members[member.user_id] = user
            if (["admin", "owner"].includes(member.role)) {
              this.admins[member.user_id] = user
            }
          })
        })
      })
    }
    else {
      this.id = group.group_id
      this.name = group.group_name
      this.remark = group.group_remark
      this.isFrozen = group.is_frozen
      this.client.send(ConnectionEnum.Action.getGroupMemberList, {
        group_id: this.id
      }, data => {
        data.data.forEach(member => {
          const user = new User(member, this.client)
          this.members[member.user_id] = user
          if (["admin", "owner"].includes(member.role)) {
            this.admins[member.user_id] = user
          }
        })
      })
    }
  }

  public sendMessage() {}

  public _addMember(member: number): boolean
  public _addMember(member: Event.GroupMemberIncrease): boolean
  public _addMember(member: Event.GroupMemberIncrease | number): boolean {
    if (!member) {
      return false
    }

    let id: number
    if (typeof member == "number") {
      id = member
    }
    else {
      id = member.user_id
      if (member.group_id != this.id) {
        return false
      }
    }

    // 兼容OpenShamrock的Bug
    // https://github.com/whitechi73/OpenShamrock/issues/150
    // 2024年1月1日 00:27，OpenShamrock的d44150e提交中，值可能为0或-1
    if (!id || id < 0) {
      return false
    }

    this.members[id] = new User({
      id,
      groupId: this.id
    }, this.client)

    return true
  }
  public _removeMember(member: Event.GroupMemberDecrease): boolean {
    if (member.group_id != this.id) {
      return false
    }

    delete this.members[member.user_id]
    return true
  }
  public _processAdminChange(admin: Event.GroupAdminChange): boolean {
    if (admin.group_id != this.id) {
      return false
    }

    if (admin.sub_type == "set") {
      if (Object.hasOwn(this.admins, admin.user_id)) {
        return false
      }

      this.admins[admin.user_id] = this.members[admin.user_id]
    }
    else if (admin.sub_type == "unset") {
      if (!Object.hasOwn(this.admins, admin.user_id)) {
        return false
      }

      delete this.admins[admin.user_id]
    }

    return true
  }
  public _processMemberCardChange(card: Event.GroupCardChange): boolean {
    if (card.group_id != this.id || !Object.hasOwn(this.members, card.user_id)) {
      return false
    }

    const member = this.members[card.user_id]
    member.remark = card.card_new
    return true
  }
}