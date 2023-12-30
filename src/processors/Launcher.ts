import { HttpConnection } from "../connections/HttpConnection"
import { ReverseWsConnection } from "../connections/ReverseWsConnection"
import type { Connection } from "../connections/Connection"
import type { HttpMiddleware, ReverseWsMiddleware, WsMiddleware } from "../types/config.d.ts"
import { ConfigEnum, EventEnum } from "../types/enums"
import config from "../config"
import { MessageEvent } from "../events/MessageEvent"
import { PluginLoader } from "./PluginLoader"
import { NoticeEvent } from "../events/NoticeEvent"
import type { Event } from "src/types/event"
import path from "node:path"
import { Logger } from "../tools/Logger"
import { Exit } from "./Exit"

export class Launcher {
  protected connections: Connection[] = []
  protected loader!: PluginLoader
  protected logger: Logger = new Logger()

  public launch() {
    process.on("unhandledRejection", (reason, promise) => {
      if (reason) {
        this.logger.error(`Promise错误：\n${reason}`)
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
      const savedLogFile = path.resolve(path.dirname(this.logger.file), this.logger.formatCurrentTime().replaceAll(" ", "_").replaceAll(":", "_") + ".log")
      this.logger.info(`正在保存日志“${savedLogFile}”`)
      this.logger._save(savedLogFile, complete)
    })
    
    this.logger.info("Momoon Bot")
    this.logger.info("正在尝试启动")

    this.loader = new PluginLoader()
    // 默认插件文件夹
    this.loader.loadFromFolder("./src/plugins/")
    config.plugins.files?.forEach(file => this.loader.loadPlugin(file))
    config.plugins.folders.forEach(folder => this.loader.loadFromFolder(folder))
    
    config.connections.forEach(conn => {
      this.logger.info(`尝试启动“${conn.type}”（协议：${conn.protocol}）服务器`)

      const inst = this.launchConnection(<ConfigEnum.ConnectionType>conn.type, (<HttpMiddleware | ReverseWsMiddleware>conn.server).port, 
      (<HttpMiddleware | ReverseWsMiddleware>conn.server).host ?? (<WsMiddleware>conn.server).universe, conn.server.token)
      if (conn.type == ConfigEnum.ConnectionType.http) {
        (<HttpConnection>inst).addClient((<HttpMiddleware>conn.server).api)
      }
      inst.ev.on("message", ev => this.loader.ev.emit("message", new MessageEvent(ev, inst)))
      inst.ev.on("notice", ev => {
        switch (ev.notice_type) {
          case EventEnum.NoticeType.groupIncrease:
            inst._addGroupMember(<Event.GroupMemberIncrease>ev)
            break;
          
          case EventEnum.NoticeType.groupDecrease:
            const event = <Event.GroupMemberDecrease>ev
            if (event.sub_type == "kick_me") {
              inst._removeGroup(event.group_id)
              break;
            }
            inst._removeGroupMember(event)
            break;

          case EventEnum.NoticeType.groupAdmin:
            inst._processGroupAdminChange(<Event.GroupAdminChange>ev)
            break;

          case EventEnum.NoticeType.groupCard:
            inst._processGroupMemberCardChange(<Event.GroupCardChange>ev)
            break;

          case EventEnum.NoticeType.friendAdd:
            inst._addFriend(<Event.FriendAdd>ev)
        }

        this.loader.ev.emit("notice", NoticeEvent.fromObject(ev, inst))
      })
      
      this.connections.push(inst)
    })
    
    this.logger.info("启动完毕")
  }

  public getConnections() {
    return this.connections
  }
  
  private launchConnection(type: ConfigEnum.ConnectionType, port?: number, host?: string, token?: string | null) {
    switch (type) {
      case ConfigEnum.ConnectionType.http:
        const http = new HttpConnection()
        http.createServer(port ?? 3006, host)
        
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