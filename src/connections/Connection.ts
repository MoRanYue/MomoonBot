import type { ConnectionEnum } from "src/types/enums"
import type { CustomEventEmitter } from "../tools/CustomEventEmitter"
import type { ConnectionContent } from "src/types/connectionContent"

export abstract class Connection {
  protected abstract server: unknown
  
  abstract readonly ev: CustomEventEmitter

  public abstract createServer(port: number): this
  public abstract createServer(port: number, host?: string): this
  public abstract createServer(port: number, host?: string, cb?: VoidFunction): this

  public abstract connect(address: string): boolean

  public abstract send(action: ConnectionEnum.Action, data: Record<string, any>): Promise<void>
}
