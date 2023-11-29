import { CustomEventEmitter } from "../tools/CustomEventEmitter"

export abstract class Connection {
  protected server: unknown
  
  readonly ev: CustomEventEmitter

  constructor() {
    this.ev = new CustomEventEmitter()
  }

  public abstract createServer(port: number): this
  public abstract createServer(port: number, host?: string): this
  public abstract createServer(port: number, host?: string, cb?: VoidFunction): this

  public abstract connect(address: string): boolean

  public abstract send(): unknown
}
