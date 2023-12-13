import type { ConnectionEnum } from "src/types/enums"
import type { CustomEventEmitter } from "../types/CustomEventEmitter"
import type { DataType } from "src/types/dataType"
import type { Group } from "../processors/sets/Group"
import type { User } from "../processors/sets/User"
import { Event } from "src/types/event"

export abstract class Connection {
  protected abstract server: unknown
  protected abstract token: string | null | undefined
  
  readonly abstract ev: CustomEventEmitter.ConnectionEventEmitter

  public abstract groups: Record<string, Record<number, Group>>
  public abstract friends: Record<string, Record<number, User>>

  public abstract createServer(port: number): this
  public abstract createServer(port: number, host?: string): this
  public abstract createServer(port: number, host?: string, cb?: VoidFunction): this

  public abstract connect(address: string): boolean
  public abstract address(): string | undefined

  public abstract send(action: ConnectionEnum.Action, data: Record<string, any>, cb?: DataType.ResponseFunction): void

  public abstract getGroups(...args: any[]): Record<number, Group> | undefined
  public abstract getGroup(id: number): Group | undefined
  public abstract getFriends(...args: any[]): Record<number, User> | undefined
  public abstract getFriend(id: number): User | undefined

  // 以下函数仅被内置类调用
  public abstract _addGroup(group: Event.Unknown): void
  public abstract _removeGroup(id: number): void
  public abstract _addGroupMember(member: Event.GroupMemberIncrease): void
  public abstract _removeGroupMember(member: Event.GroupMemberDecrease): void
  public abstract _processGroupAdminChange(admin: Event.GroupAdminChange): void
  public abstract _processGroupMemberCardChange(card: Event.GroupCardChange): void
  public abstract _addFriend(friend: Event.FriendAdd): void
  public abstract _removeFriend(id: number): void
}
