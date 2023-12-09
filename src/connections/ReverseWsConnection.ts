import type { CustomEventEmitter } from "src/types/CustomEventEmitter";
import { Connection } from "./Connection";
import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter";
import type { Event } from "src/types/event";
import ws from "ws"
import { Utils } from "../tools/Utils";
import { type ConnectionEnum, EventEnum } from "../types/enums";
import { ConnectionContent } from "src/types/connectionContent";
import type { DataType } from "src/types/dataType";

export class ReverseWsConnection extends Connection {
  protected server!: ws.Server;
  public clientAddresses: string[] = []
  protected messageCbs: Record<string, DataType.ResponseFunction> = {}

  readonly ev: CustomEventEmitter.ReverseWsEventEmitter = new EventEmitter()

  public createServer(port: number): this;
  public createServer(port: number, host?: string | undefined): this;
  public createServer(port: number, host?: string | undefined, cb?: VoidFunction | undefined): this {
    this.server = new ws.Server({
      port,
      host,
    })

    if (cb) {
      this.server.on("listening", cb)
    }

    this.server.on("connection", (socket, req) => {
      this.ev.emit("connect")

      this.clientAddresses.push(`${req.socket.remoteAddress}:${req.socket.remotePort}`)
      console.log("=============================================")
      console.log("Reverse WebSocket Received Connection Request")
      console.log("Client:", `${req.socket.remoteAddress}:${req.socket.remotePort}`)
      
      this.ev.on("response", data => {
        console.log("===================================")
        console.log("Reverse WebSocket Received Response")

        let messageInfo: ConnectionContent.Connection.WsRequestDetector
        try {
          messageInfo = <ConnectionContent.Connection.WsRequestDetector>Utils.jsonToData(data.echo)
          console.log(messageInfo)
        } catch (err) {
          console.warn("收到的返回非本服务器发送的请求所应返回的")
          return
        }

        if (Object.hasOwn(this.messageCbs, messageInfo.id)) {
          this.messageCbs[messageInfo.id](data)
          delete this.messageCbs[messageInfo.id]
        }
      })

      socket.on("message", buf => this.receivePacket(buf, dataStr => {
        const data = <object>Utils.jsonToData(dataStr)
        if (Object.hasOwn(data, "echo")) {
          this.ev.emit("response", <ConnectionContent.Connection.Response<number | object | object[]>>data)
        }
        else {
          switch ((<Event.Reported>data).post_type) {
            case EventEnum.EventType.message:
              console.log("=======================================")
              console.log("Reverse WebSocket Received Event Report")
              console.log("Type: Message")

              this.ev.emit("message", <Event.Message>data)
              break;

            case EventEnum.EventType.messageSent:
              console.log("=======================================")
              console.log("Reverse WebSocket Received Event Report")
              console.log("Type: MessageSent")
            
              this.ev.emit("message", <Event.Message>data)
              break;
          
            case EventEnum.EventType.notice:
              console.log("=======================================")
              console.log("Reverse WebSocket Received Event Report")
              console.log("Type: Notice")

              this.ev.emit("notice", <Event.Notice>data)
              break;

            case EventEnum.EventType.request:
              console.log("=======================================")
              console.log("Reverse WebSocket Received Event Report")
              console.log("Type: Request")

              this.ev.emit("request", <Event.Request>data)
              break;
            
            case EventEnum.EventType.meta:
              this.ev.emit("meta", <Event.MetaEvent>data)
          
            default:
              this.ev.emit("unknown", <Event.Unknown>data)
              break;
          }
        }
      }))
      socket.on("close", () => {
        this.clientAddresses.forEach((address, i) => {
          if (address.includes(req.socket.remoteAddress!)) {
            this.clientAddresses.splice(i, 1)
          }
        })
        console.log("===================================")
        console.log("Reverse WebSocket Connection Closed")
        console.log("Client:", `${req.socket.remoteAddress}:${req.socket.remotePort}`)
      })
      socket.on("error", err => {
        if (err) {
          throw err
        }
      })
    })

    return this
  }

  public connect(address: string): boolean {
    throw new Error("Method not implemented.");
  }
  public address(): string | undefined {
    return <string>this.server.address()
  }

  public send(action: ConnectionEnum.Action, data: Record<string, any> = {}, cb?: DataType.ResponseFunction, clientIndex: number = 0): void {
    const id: string = Utils.randomChar()
    if (cb) {
      this.messageCbs[id] = cb
    }

    let i: number = -1
    this.server.clients.forEach(socket => {
      i++
      if (i == clientIndex) {
        socket.send(Utils.dataToJson(<ConnectionContent.Connection.WsRequest<typeof data>>{
          action,
          params: data,
          echo: Utils.dataToJson(<ConnectionContent.Connection.WsRequestDetector>{
            platform: "Momoon Bot",
            id
          })
        }), err => {
          if (err) {
            console.log("There Is A Error In Sending WS Request")
            throw err
          }
        })
      }
    })
    
  }
  
  private receivePacket(data: ws.RawData, cb: (data: string) => void) {
    cb(data.toString("utf-8"))
  }
}