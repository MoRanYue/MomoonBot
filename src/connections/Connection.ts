import type { ConnectionEnum } from "src/types/enums"
import type { CustomEventEmitter } from "../types/CustomEventEmitter"
import type { DataType } from "src/types/dataType"
import type { Group } from "../processors/sets/Group"
import type { User } from "../processors/sets/User"

export abstract class Connection {
  protected abstract server: unknown
  
  readonly abstract ev: CustomEventEmitter.ConnectionEventEmitter

  public abstract groups: Record<string, Record<number, Group>>
  public abstract friends: Record<string, Record<number, User>>

  public abstract createServer(port: number): this
  public abstract createServer(port: number, host?: string): this
  public abstract createServer(port: number, host?: string, cb?: VoidFunction): this

  public abstract connect(address: string): boolean
  public abstract address(): string | undefined

  public abstract send(action: ConnectionEnum.Action, data: Record<string, any>, cb?: DataType.ResponseFunction): void

  public abstract getGroups(...args: any[]): Record<number, Group>
  public abstract getGroup(id: number): Group
  public abstract getFriends(...args: any[]): Record<number, User>
  public abstract getFriend(id: number): User
}
