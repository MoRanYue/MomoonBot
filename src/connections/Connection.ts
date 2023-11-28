export abstract class Connection {
  protected host?: string
  protected port?: number
  protected clientAddress?: string

  public abstract createServer(): typeof this
  public abstract connect(address: string): boolean
  public abstract send(): boolean
}
