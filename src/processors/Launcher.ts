import { HttpConnection } from "../connections/HttpConnection"
import { ReverseWsConnection } from "../connections/ReverseWsConnection"
import type { Connection } from "../connections/Connection"
import type { HttpMiddleware, ReverseWsMiddleware, WsMiddleware } from "../types/configuration"
import { ConfigEnum, EventEnum } from "../types/enums"
import cfg from "../config"
import { MessageEvent } from "../events/MessageEvent"
import { RequestEvent } from "../events/RequestEvent"
import { NoticeEvent } from "../events/NoticeEvent"
import { PluginLoader } from "./PluginLoader"
import type { Event } from "src/types/event"
import path from "node:path"
import { Logger } from "../tools/Logger"
import { Exit } from "./Exit"

export class Launcher {
  protected connections: Connection[] = []
  protected loader!: PluginLoader
  protected logger: Logger = new Logger()
  
  public readonly version = "0.8.0"

  public launch() {
    process.on("unhandledRejection", (reason: Error, promise: Promise<unknown>) => {
      if (reason && reason instanceof Error) {
        this.logger.error(`在进行 Promise ${promise} 时出现错误：`)
        if (reason instanceof AggregateError) {
          this.logger.error(`多个错误未捕获，以下为错误信息：`)
          reason.errors.forEach(err => {
            if (err) {
              this.logger.error(err)
            }
          })
          return
        }
        this.logger.error(reason)
      }
    })
    process.on("uncaughtException", err => {
      if (err) {
        this.logger.error(err)
      }
    })

    const exit = new Exit()
    exit.register()
    exit.addTask(complete => {
      this.logger.info("正在关闭服务器")
      this.connections.forEach(conn => conn.stopServer())
      complete()
    })
    exit.addTask(complete => {
      this.logger.info("正在卸载所有插件")
      this.loader.unloadAll(complete)
    })
    exit.addTask(complete => {
      const savedLogFile = path.resolve(path.dirname(this.logger.file), Logger.formatCurrentTime().replaceAll(" ", "_").replaceAll(":", "_") + ".log")
      this.logger.info(`正在保存日志“${savedLogFile}”`)
      this.logger._save(savedLogFile, complete)
    })
    
    const config = cfg.getConfig()
    
    this.logger.info(`Momoon Bot v${this.version}`)
    this.logger.info("正在尝试启动")

    this.loader = new PluginLoader()
    // 默认插件文件夹
    this.loader.loadFromFolder("./src/plugins/")
    config.plugins.files?.forEach(file => this.loader.loadPlugin(file))
    config.plugins.folders.forEach(folder => this.loader.loadFromFolder(folder))
    
    config.connections.forEach(conn => {
      this.logger.info(`尝试启动“${conn.type}”（协议：${conn.protocol}）服务器`)

      const inst = this.launchConnection(<ConfigEnum.ConnectionType>conn.type, (<HttpMiddleware | ReverseWsMiddleware>conn.server).port, 
      (<HttpMiddleware | ReverseWsMiddleware>conn.server).host ?? (<WsMiddleware>conn.server).universe, (<HttpMiddleware>conn.server).api, conn.server.token)
      if (conn.type == ConfigEnum.ConnectionType.http) {
        (<HttpConnection>inst).addClient((<HttpMiddleware>conn.server).api)
      }
      inst.ev.on("message", (ev, client) => this.loader.ev.emit("message", new MessageEvent(ev, client)))
      inst.ev.on("notice", (ev, client) => {
        switch (ev.notice_type) {
          case EventEnum.NoticeType.groupIncrease:
            client._addGroupMember(<Event.GroupMemberIncrease>ev)
            break;
          
          case EventEnum.NoticeType.groupDecrease:
            const event = <Event.GroupMemberDecrease>ev
            if (event.sub_type == "kick_me") {
              client._removeGroup(event.group_id)
              break;
            }
            client._removeGroupMember(event)
            break;

          case EventEnum.NoticeType.groupAdmin:
            client._processGroupAdminChange(<Event.GroupAdminChange>ev)
            break;

          case EventEnum.NoticeType.groupCard:
            client._processGroupMemberCardChange(<Event.GroupCardChange>ev)
            break;

          case EventEnum.NoticeType.friendAdd:
            client._addFriend(<Event.FriendAdd>ev)
        }

        this.loader.ev.emit("notice", NoticeEvent.fromObject(ev, client))
      })
      inst.ev.on("request", (ev, client) => this.loader.ev.emit("request", RequestEvent.fromObject(ev, client)))
      
      this.connections.push(inst)
    })
    
    this.logger.info("启动完毕")
  }

  public getConnections() {
    return this.connections
  }
  
  private launchConnection(type: ConfigEnum.ConnectionType, port?: number, host?: string, api?: string, token?: string | null) {
    switch (type) {
      case ConfigEnum.ConnectionType.http:
        const http = new HttpConnection()
        http.createServer(port ?? 3006, host, token, api)
        
        return http

      case ConfigEnum.ConnectionType.reverseWs:
        const reverseWs = new ReverseWsConnection()
        reverseWs.createServer(port ?? 3007, host, token)

        return reverseWs
      
      default:
        throw new Error("不支持的连接类型")
    }
  }
}