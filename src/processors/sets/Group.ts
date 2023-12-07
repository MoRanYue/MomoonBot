import type { ConnectionContent } from "src/types/connectionContent"
import type { Connection } from "../../connections/Connection"
import { ConnectionEnum } from "../../types/enums"
import { User } from "./User"

export class Group {
  public id: number
  public name!: string
  public remark!: string
  public isFrozen!: boolean
  public maxMemberNumber!: number
  public memberNumber!: number
  public admins: Record<number, User> = {}
  public members: Record<number, User> = {}

  protected conn: Connection

  constructor(group: number, conn: Connection)
  constructor(group: ConnectionContent.ActionResponse.GetGroupInfo, conn: Connection)
  constructor(group: number | ConnectionContent.ActionResponse.GetGroupInfo, conn: Connection) {
    this.conn = conn

    if (typeof group == "number") {
      this.id = group
      this.conn.send(ConnectionEnum.Action.getGroupInfo, <ConnectionContent.Params.GetGroupInfo>{
        group_id: this.id
      }, data => {
        const result = <ConnectionContent.ActionResponse.GetGroupInfo>data.data
        this.name = result.group_name
        this.remark = result.group_remark
        this.isFrozen = result.is_frozen
        this.maxMemberNumber = result.max_member
        this.memberNumber = result.member_num

        this.conn.send(ConnectionEnum.Action.getGroupMemberList, <ConnectionContent.Params.GetGroupMemberList>{
          group_id: this.id
        }, data => {
          (<ConnectionContent.ActionResponse.GetGroupMemberList>data.data).forEach(member => {
            const user = new User(member, this.conn)
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
      this.conn.send(ConnectionEnum.Action.getGroupMemberList, <ConnectionContent.Params.GetGroupMemberList>{
        group_id: this.id
      }, data => {
        (<ConnectionContent.ActionResponse.GetGroupMemberList>data.data).forEach(member => {
          const user = new User(member, this.conn)
          this.members[member.user_id] = user
          if (["admin", "owner"].includes(member.role)) {
            this.admins[member.user_id] = user
          }
        })
      })
    }
  }

  public sendMessage() {}
}