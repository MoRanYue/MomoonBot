import type { ConnectionEnum } from "src/types/enums"
import type { CustomEventEmitter } from "../types/CustomEventEmitter"
import type { ConnectionContent } from "src/types/connectionContent"
import type { DataType } from "src/types/dataType"

export abstract class Connection {
  protected abstract server: unknown
  
  abstract readonly ev: CustomEventEmitter.ConnectionEventEmitter

  public abstract createServer(port: number): this
  public abstract createServer(port: number, host?: string): this
  public abstract createServer(port: number, host?: string, cb?: VoidFunction): this

  public abstract connect(address: string): boolean
  public abstract address(): string | undefined

  public abstract send(action: ConnectionEnum.Action, data: Record<string, any>, cb?: DataType.ResponseFunction): void
}
