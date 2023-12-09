import { CommandListener, Listener, MessageListener } from "./Listener"
import type { DataType } from "../types/dataType"
import config from "../config"
import { CustomEventEmitter } from "src/types/CustomEventEmitter"
import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter"
import { ListenerEnum } from "../types/enums"
import { MessageUtils } from "../tools/MessageUtils"

export abstract class Plugin {
  readonly name: string = "Plugin name"
  readonly description: string = "Plugin description"
  readonly instruction: string = "Plugin instruction"
  readonly version: string = "1.0.0"

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
          
          listeners.forEach((listener, i) => {
            try {
              listener.trigger(ev)
            }
            catch (err) {
              console.error(`在触发消息监听器“${message}”（优先级：${listener.priority}，执行顺序：${i + 1}）时捕获到错误`)
              console.error(err)
              return
            }
          })
        }
      }

      const commandListeners = this.listeners.command
      for (const command of commandListeners.keys()) {
        if (commandListeners.has(command)) {
          const listeners = commandListeners.get(command)!
          
          listeners.forEach((listener, i) => {
            try {
              listener.trigger(ev)
            }
            catch (err) {
              console.error(`在触发命令监听器“${command}”（优先级：${listener.priority}，执行顺序：${i + 1}）时捕获到错误`)
              console.error(err)
              return
            }
          })
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

export class Plugin_ extends Plugin {}