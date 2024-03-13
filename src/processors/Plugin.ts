import { CommandListener, Listener, MessageListener, NoticeListener, RequestListener } from "./Listener"
import type { DataType } from "../types/dataType"
import config from "../config"
import { CustomEventEmitter } from "src/types/CustomEventEmitter"
import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter"
import { ListenerEnum } from "../types/enums"
import { Logger } from "../tools/Logger"
import { Segment } from "../events/messages/MessageSegment"

/**
 * 插件抽象类
 * @since 0.0.1
 */
export abstract class Plugin {
  public readonly abstract name: string
  public readonly abstract description: string
  public readonly abstract instruction: string
  public readonly abstract version: string
  protected logger: Logger = new Logger("插件")

  /**
   * 该插件注册的所有监听器
   * @property {Map} message 消息监听器映射
   * @property {Map} command 命令监听器映射
   * @property {Map} notice 通知监听器映射
   * @property {Map} request 请求监听器映射
   */
  protected listeners: DataType.ListenerList = {
    message: new Map(),
    command: new Map(),
    notice: new Map(),
    request: new Map()
  }
  public readonly ev: CustomEventEmitter.PluginEventEmitter = new EventEmitter()

  constructor() {
    if (!config.getPluginData(this, "_enable")) {
      config.setPluginData(this, "_enable", true)
    }

    this.ev.on("message", ev => {
      const messageListeners = this.listeners.message
      for (const message of messageListeners.keys()) {
        if (messageListeners.has(message)) {
          const listeners = messageListeners.get(message)!
          
          for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            
            try {
              listener.trigger(ev)
            }
            catch (err) {
              this.logger.error(`在触发消息监听器“${message}”（优先级：${listener.priority}，执行顺序：${i + 1}）时捕获到错误`)
              this.logger.error(err)
            }

            if (listener.block) {
              break
            }
          }
        }
      }

      const commandListeners = this.listeners.command
      for (const command of commandListeners.keys()) {
        if (commandListeners.has(command)) {
          const listeners = commandListeners.get(command)!
          
          for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            
            try {
              listener.trigger(ev)
            }
            catch (err) {
              this.logger.error(`在触发命令监听器“${command}”（优先级：${listener.priority}，执行顺序：${i + 1}）时捕获到错误`)
              this.logger.error(err)
            }

            if (listener.block) {
              break
            }
          }
        }
      }
    })
    
    this.ev.on("notice", ev => {
      const noticeListeners = this.listeners.notice
      for (const notice of noticeListeners.keys()) {
        if (noticeListeners.has(notice)) {
          const listeners = noticeListeners.get(notice)!
          
          for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            
            try {
              listener.trigger(ev)
            }
            catch (err) {
              this.logger.error(`在触发通知监听器“${notice}”（优先级：${listener.priority}，执行顺序：${i + 1}）时捕获到错误`)
              this.logger.error(err)
            }

            if (listener.block) {
              break
            }
          }
        }
      }
    })

    this.ev.on("request", ev => {
      const requestListeners = this.listeners.request
      for (const request of requestListeners.keys()) {
        if (requestListeners.has(request)) {
          const listeners = requestListeners.get(request)!
          
          for (let i = 0; i < listeners.length; i++) {
            const listener = listeners[i];
            
            try {
              listener.trigger(ev)
            }
            catch (err) {
              this.logger.error(`在触发请求监听器“${request}”（优先级：${listener.priority}，执行顺序：${i + 1}）时捕获到错误`)
              this.logger.error(err)
            }

            if (listener.block) {
              break
            }
          }
        }
      }
    })
  }

  public onMessage(message: DataType.ListenedMessageArgument, cb: DataType.ListenedMessageFunc, aliases: DataType.ListenedMessageArgument[] | DataType.ListenedMessageArgument = [], priority: number = 0, messageType: DataType.MessageTypeChecker = "all", 
  permission: ListenerEnum.Permission = ListenerEnum.Permission.user, checkers: DataType.Checker[] | DataType.Checker = [], 
  block: boolean = false, ignoreCase: boolean = true, triggerBySelf: boolean = config.getConfig().listener.settings.triggerBySelf, usage?: string): MessageListener {
    let patterns: DataType.ListenedMessageArgument[] = [message]
    if (Array.isArray(aliases)) {
      patterns.push(...aliases)
    }
    else {
      patterns.push(aliases)
    }
    const msg: DataType.ListenedMessage = this.processSingleSegment(message)
    const listener = new MessageListener(this.processSegments(patterns), cb, priority, permission, messageType, checkers, block, ignoreCase, triggerBySelf, usage)

    const messageListeners = this.listeners.message

    if (messageListeners.has(msg)) {
      messageListeners.get(msg)!.push(listener)
    }
    else {
      messageListeners.set(msg, [listener])
    }
    messageListeners.get(msg)!.sort((a, b) => {
      if (a.priority > b.priority) {
        return 1
      }
      else if (a.priority < b.priority) {
        return -1
      }
      return 0
    })

    return listener
  }
  public onCommand(command: DataType.ListenedCommand, cb: DataType.ListenedCommandFunc, aliases: DataType.ListenedCommand[] | DataType.ListenedCommand = [], priority: number = 0, messageType: DataType.MessageTypeChecker = "all", 
  permission: ListenerEnum.Permission = ListenerEnum.Permission.user, checkers: DataType.Checker[] | DataType.Checker = [], 
  block: boolean = false, ignoreCase: boolean = true, triggerBySelf: boolean = config.getConfig().listener.settings.triggerBySelf, usage?: string): CommandListener {
    let patterns: DataType.ListenedCommand[] = [command]
    if (Array.isArray(aliases)) {
      patterns.push(...aliases)
    }
    else {
      patterns.push(aliases)
    }
    const listener = new CommandListener(patterns, cb, priority, permission, messageType, checkers, block, ignoreCase, triggerBySelf, usage)

    const commandListeners = this.listeners.command

    if (commandListeners.has(command)) {
      commandListeners.get(command)!.push(listener)
    }
    else {
      commandListeners.set(command, [listener])
    }
    commandListeners.get(command)!.sort(this.sortListeners)

    return listener
  }
  public onNotice(notices: DataType.ListenedNotice | DataType.ListenedNotice[] | "", cb: DataType.ListenedNoticeFunc, priority: number = 0, 
  checkers: DataType.NoticeChecker | DataType.NoticeChecker[] = [], block: boolean = false): NoticeListener {
    const listener = new NoticeListener(notices, cb, priority, checkers, block)

    const noticeListeners = this.listeners.notice

    const noticeStr = Array.isArray(notices) ? notices.join("、") : notices
    if (noticeListeners.has(noticeStr)) {
      noticeListeners.get(noticeStr)!.push(listener)
    }
    else {
      noticeListeners.set(noticeStr, [listener])
    }
    noticeListeners.get(noticeStr)!.sort(this.sortListeners)

    return listener
  }
  public onRequest(requests: DataType.ListenedRequest | DataType.ListenedRequest[] | "", cb: DataType.ListenedRequestFunc, priority: number = 0,
  checkers: DataType.RequestChecker | DataType.RequestChecker[] = [], block: boolean = false): RequestListener {
    const listener = new RequestListener(requests, cb, priority, checkers, block)

    const requestListeners = this.listeners.request

    const requestStr = Array.isArray(requests) ? requests.join("、") : requests
    if (requestListeners.has(requestStr)) {
      requestListeners.get(requestStr)!.push(listener)
    }
    else {
      requestListeners.set(requestStr, [listener])
    }
    requestListeners.get(requestStr)!.sort(this.sortListeners)

    return listener
  }

  private sortListeners(a: Listener, b: Listener): number {
    if (a.priority > b.priority) {
      return 1
    }
    else if (a.priority < b.priority) {
      return -1
    }
    return 0
  }

  private processSingleSegment(messageArg: DataType.ListenedMessageArgument): DataType.ListenedMessage {
    return messageArg instanceof Segment ? [messageArg] : messageArg
  }
  private processSegments(messageArgs: DataType.ListenedMessageArgument[]): DataType.ListenedMessage[] {
    const messages: DataType.ListenedMessage[] = []
    for (let i = 0; i < messageArgs.length; i++) {
      const message = messageArgs[i];

      messages.push(this.processSingleSegment(message))
    }
    return messages
  }
}

export class Plugin_ extends Plugin {
  readonly name: string = "Plugin_"
  readonly description: string = "Plugin_"
  readonly instruction: string = "Plugin_"
  readonly version: string = "Plugin_"
}