import { Connection } from "./Connection";
import http from "node:http"
import url from "node:url"
import { ResponseContent } from "../tools/ResponseContent";
import { CustomIncomingMessage } from "../types/http";
import { ConnectionEventEmitter } from "../types/CustomEventEmitter";
import { Utils } from "../tools/Utils";
import { Event } from "../types/event";

export class HttpConnection extends Connection {
  declare protected server: http.Server
  declare readonly ev: ConnectionEventEmitter.HttpEventEmitter
  public clientAddresses: string[] = []

  public createServer(port: number): this
  public createServer(port: number, host?: string): this
  public createServer(port: number, host?: string, cb?: () => void): this {
    this.server = http.createServer()
    
    this.server.on("request", (req: http.IncomingMessage, res: http.ServerResponse) => {
      this.receiveRequest(req, res, async (req, res) => {
        console.log("=======================================")
        console.log("       Received Event Report")
        console.log("Client: ", req.socket.remoteAddress)
        console.log("Content: ", req.body)
        
        const data = <Event.Reported>Utils.jsonToData(req.body)
        switch (data.post_type) {
          case Event.EventType.message:
            this.ev.emit("message", <Event.Message>data)
            break;
        
          case Event.EventType.notice:
            this.ev.emit("notice", <Event.Notice>data)
            break;

          case Event.EventType.request:
            this.ev.emit("request", <Event.Request>data)
            break;
        
        
          default:
            this.ev.emit("unknown", <Event.Unknown>data)
            break;
        }

        res.end(Utils.dataToJson(ResponseContent.httpClient()))
      })
    })
    
    this.server.listen(port, host, cb)

    return this
  }

  public connect(): never {
    throw new Error('未实现')
  }

  public send(): void {
    this.clientAddresses.forEach(address => {
      http.request(address, this.receivePacket)
    })
  }

  public addClient(...address: string[]): void {
    this.clientAddresses.push(...address)
  }
  
  private receiveRequest(req: http.IncomingMessage, res: http.ServerResponse, cb: (req: CustomIncomingMessage, res: http.ServerResponse) => void) {
    const msg = <CustomIncomingMessage>req
    msg.query = new url.URL(req.url!, `http://${msg.headers.host}`).searchParams

    res.setHeader("Content-Type", "application/json;charset=utf-8")
    res.setHeader("Cache-Control", "no-cache")
    res.statusCode = 200
  
    if (msg.method!.toLowerCase() == 'post') {
      let data: string = ""
      msg.on("data", async (chunk: string) => data += chunk)
      msg.on("end", () => {
        msg.body = data
        cb(msg, res)
      })
    }
    else {
      cb(req, res)
    }
  }

  private async receivePacket(res: http.IncomingMessage): Promise<void> {
    res.setEncoding('utf-8')

    const data: any[] = []

    res.on('data', chunk => data.push(chunk))
    res.on('error', err => {
      throw err
    })
    res.on('end', () => this.ev.emit('data', data))
  }
}
