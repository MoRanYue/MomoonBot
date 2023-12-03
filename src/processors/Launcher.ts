import { HttpConnection } from "../connections/HttpConnection"
import { ReverseWsConnection } from "../connections/ReverseWsConnection"
import type { Connection } from "../connections/Connection"
import type { HttpMiddleware, ReverseWsMiddleware, WsMiddleware } from "../types/config.d.ts"
import { ConfigEnum } from "../types/enums"
import config from "../config"
import { MessageEvent } from "../events/MessageEvent"
import { Plugin, type Plugin_ } from "./Plugin"
import { PluginLoader } from "./PluginLoader"
import path from "node:path"

export class Launcher {
  protected connections: Connection[] = []
  protected loader!: PluginLoader

  public launch() {
    console.log("正在尝试启动")

    process.on("uncaughtException", err => {
      if (err) {
        console.error(`错误：${err.name}\n调用堆栈：\n${err.stack}`)
      }
    })

    this.loader = new PluginLoader()
    this.loadFromFolder()
    
    config.connections.forEach(conn => {
      console.log(`尝试启动“${conn.type}”（协议：“${conn.protocol}”）服务器`)

      const inst = this.launchConnection(<ConfigEnum.ConnectionType>conn.type, (<HttpMiddleware | ReverseWsMiddleware>conn.server).port, (<HttpMiddleware | ReverseWsMiddleware>conn.server).host ?? (<WsMiddleware>conn.server).universe)
      inst.ev.on("message", ev => this.loader.ev.emit("message", new MessageEvent(ev, inst)))
      
      this.connections.push(inst)
    })
    
    console.log("启动完毕")
  }

  private async loadFromFolder() {
    const a: unknown = (await import("../plugins/BuiltInPlugin.js")).default.default
    this.loader.load(<typeof Plugin_>a)
    // path.resolve("./")
  }
  
  private launchConnection(type: ConfigEnum.ConnectionType, port?: number, host?: string) {
    switch (type) {
      case ConfigEnum.ConnectionType.http:
        const http = new HttpConnection()
        http.createServer(port ?? 3006, host)
        
        return http

      case ConfigEnum.ConnectionType.reverseWs:
        const reverseWs = new ReverseWsConnection()
        reverseWs.createServer(port ?? 3007, host)

        return reverseWs
      
      default:
        throw new Error("不支持的连接类型")
    }
  }
}