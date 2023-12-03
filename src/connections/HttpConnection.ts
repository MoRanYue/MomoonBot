import { Connection } from "./Connection";
import http from "node:http"
import url from "node:url"
import { ResponseContent } from "../tools/ResponseContent";
import { CustomIncomingMessage } from "../types/http";
import { CustomEventEmitter } from "../types/CustomEventEmitter";
import { Utils } from "../tools/Utils";
import { Event } from "../types/event";
import { type ConnectionEnum, EventEnum } from "../types/enums";
import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter";
import type { ConnectionContent } from "src/types/connectionContent";

export class HttpConnection extends Connection {
  protected server!: http.Server
  readonly ev: CustomEventEmitter.HttpEventEmitter = new EventEmitter()
  public clientAddresses: string[] = []

  public createServer(port: number): this
  public createServer(port: number, host?: string): this
  public createServer(port: number, host?: string, cb?: () => void): this {
    this.server = http.createServer()

    this.ev.on("response", data => {
      console.log("======================")
      console.log("Http Received Response")
      console.log(data)
    })
    
    this.server.on("request", (req: http.IncomingMessage, res: http.ServerResponse) => {
      this.receiveRequest(req, res, async (req, res) => {
        const data = <object>Utils.jsonToData(req.body)
        if (Object.hasOwn(data, "echo")) {
          this.ev.emit("response", <ConnectionContent.Connection.Response<number | object | object[]>>data)
        }
        else {
          switch ((<Event.Reported>data).post_type) {
            case EventEnum.EventType.message:
              console.log("==========================")
              console.log("Http Received Event Report")

              this.ev.emit("message", <Event.Message>data)
              break;
          
            case EventEnum.EventType.notice:
              this.ev.emit("notice", <Event.Notice>data)
              break;

            case EventEnum.EventType.request:
              this.ev.emit("request", <Event.Request>data)
              break;
          
          
            default:
              this.ev.emit("unknown", <Event.Unknown>data)
              break;
          }
        }

        res.end(Utils.dataToJson(ResponseContent.httpClient()))
      })
    })
    
    this.server.listen(port, host, cb)

    return this
  }

  public connect(): never {
    throw new Error("Method not implemented.");
  }

  public async send(action: ConnectionEnum.Action, data: Record<string, any>, clientIndex: number = 0): Promise<void> {
    let resData: string
    const req = http.request({
      method: "post",
      protocol: "http:",
      host: this.clientAddresses[clientIndex],
      pathname: "/" + action,
    }, this.receivePacket)
    req.on("error", err => {
      throw err
    })
    req.write(Utils.dataToJson(data))
    req.end()
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

    let data: string = ""

    res.on('data', chunk => data += chunk)
    res.on('error', err => {
      throw err
    })
    res.on('end', () => this.ev.emit('response', Utils.jsonToData(data)))
  }
}
