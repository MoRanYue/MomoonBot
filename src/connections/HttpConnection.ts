import { Connection } from "./Connection";
import http from 'http'

export class HttpConnection extends Connection {
  declare protected server: http.Server
  public clientAddresses: string[] = []

  public createServer(port: number): this
  public createServer(port: number, host?: string): this
  public createServer(port: number, host?: string, cb?: VoidFunction): this {
    this.server = http.createServer().listen(port, host, cb)

    return this
  }

  public connect(address: string): never {
    throw new Error('未实现')
  }

  public send(): void {
    this.clientAddresses.forEach(address => {
      http.request(address, this.receivePacket)
    })
  }

  private async receivePacket(res: http.IncomingMessage): void {
    res.setEncoding('utf-8')

    const data: any[] = []

    res.on('data', chunk => data.push(chunk))
    res.on('error', err => {
      throw err
    })
    res.on('end', () => this.ev.emit('data', data))
  }
}