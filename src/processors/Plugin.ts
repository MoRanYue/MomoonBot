import { CommandListener, Listener, MessageListener, NoticeListener } from "./Listener"
import type { DataType } from "../types/dataType"
import config from "../config"
import { CustomEventEmitter } from "src/types/CustomEventEmitter"
import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter"
import { ListenerEnum } from "../types/enums"
import { MessageUtils } from "../tools/MessageUtils"

export abstract class Plugin {
  readonly abstract name: string
  readonly abstract description: string
  readonly abstract instruction: string
  readonly abstract version: string

  protected listeners: DataType.ListenerList = {
    message: new Map(),
    command: new Map(),
    notice: new Map(),
    request: new Map()
  }
  readonly ev: CustomEventEmitter.PluginEventEmitter = new EventEmitter()

  constructor() {
    this.ev.on("message", ev => {
      if (ev.isSelfSent && !config.listener.settings.triggerBySelf) {
        return
      }

      const plainText = ev.getPlainText()
      
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
              console.error(`在触发消息监听器“${message}”（优先级：${listener.priority}，执行顺序：${i + 1}）时捕获到错误`)
              console.error(err)
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
              console.error(`在触发命令监听器“${command}”（优先级：${listener.priority}，执行顺序：${i + 1}）时捕获到错误`)
              console.error(err)
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
              console.error(`在触发通知监听器“${notice}”（优先级：${listener.priority}，执行顺序：${i + 1}）时捕获到错误`)
              console.error(err)
            }

            if (listener.block) {
              break
            }
          }
        }
      }
    })
  }

  public onMessage(message: DataType.ListenedMessage, cb: DataType.ListenedMessageFunc, aliases: DataType.ListenedMessage[] | DataType.ListenedMessage = [], priority: number = 0, messageType: DataType.MessageTypeChecker = "all", 
  permission: ListenerEnum.Permission = ListenerEnum.Permission.user, checkers: DataType.Checker | DataType.Checker[] = [], 
  block: boolean = false, ignoreCase: boolean = true, usage?: string): MessageListener {
    let patterns: DataType.ListenedMessage[] = [message]
    if (Array.isArray(aliases)) {
      patterns.push(...aliases)
    }
    else {
      patterns.push(aliases)
    }
    const listener = new MessageListener(patterns, cb, priority, permission, messageType, checkers, block, ignoreCase, usage)

    const messageListeners = this.listeners.message

    if (messageListeners.has(message)) {
      messageListeners.get(message)!.push(listener)
    }
    else {
      messageListeners.set(message, [listener])
    }
    messageListeners.get(message)!.sort((a, b) => {
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
  public onCommand(command: DataType.ListenedMessage, cb: DataType.ListenedCommandFunc, aliases: DataType.ListenedMessage[] | DataType.ListenedMessage = [], priority: number = 0, messageType: DataType.MessageTypeChecker = "all", 
  permission: ListenerEnum.Permission = ListenerEnum.Permission.user, checkers: DataType.Checker | DataType.Checker[] = [], 
  block: boolean = false, ignoreCase: boolean = true, usage?: string): CommandListener {
    let patterns: DataType.ListenedMessage[] = [command]
    if (Array.isArray(aliases)) {
      patterns.push(...aliases)
    }
    else {
      patterns.push(aliases)
    }
    const listener = new CommandListener(patterns, cb, priority, permission, messageType, checkers, block, ignoreCase, usage)

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
  public onNotice(notices: DataType.ListenedNotice | DataType.ListenedNotice[], cb: DataType.ListenedNoticeFunc, priority: number = 0, 
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

  private sortListeners(a: Listener, b: Listener) {
    if (a.priority > b.priority) {
      return 1
    }
    else if (a.priority < b.priority) {
      return -1
    }
    return 0
  }
}

export class Plugin_ extends Plugin {
  readonly name: string = "Plugin_"
  readonly description: string = "Plugin_"
  readonly instruction: string = "Plugin_"
  readonly version: string = "Plugin_"
}