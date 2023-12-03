import { CommandListener, Listener, MessageListener } from "./Listener"
import type { DataType } from "../types/dataType"
import config from "../config"
import { CustomEventEmitter } from "src/types/CustomEventEmitter"
import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter"

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
      const plainText = ev.getPlainText()
      
      const messageListeners = this.listeners.message
      for (const message of messageListeners.keys()) {
        if (this.matchMessage(plainText, message)) {
          if (messageListeners.has(message)) {
            const listeners = messageListeners.get(message)!
            
            listeners.forEach(listener => {
              // const state: DataType.State = {}
              listener.trigger(ev, {})
            })
          }
        }
      }

      const commandListeners = this.listeners.command
      for (const command of commandListeners.keys()) {
        const maybeArgs = this.matchCommand(plainText, command)

        if (maybeArgs) {
          console.log("Args:", maybeArgs)

          if (commandListeners.has(command)) {
            const listeners = commandListeners.get(command)!
            
            listeners.forEach(listener => {
              // const state: DataType.State = {}
              listener.trigger(ev, {}, maybeArgs)
            })
          }
        }
      }
    })
  }

  public onMessage(message: DataType.ListenedMessage, cb: DataType.ListenedMessageFunc, priority: number = 0, block: boolean = false, usage?: string): Listener {
    const listener = new MessageListener(cb, priority, block)

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

    console.log("onMessage Registered A New Listener:\n", messageListeners)
    console.log("All Listeners:\n", this.listeners)

    return listener
  }
  public onCommand(command: DataType.ListenedMessage, cb: DataType.ListenedCommandFunc, priority: number = 0, block: boolean = false, usage?: string): Listener {
    const listener = new CommandListener(cb, priority, block)

    const commandListeners = this.listeners.command

    if (commandListeners.has(command)) {
      commandListeners.get(command)!.push(listener)
    }
    else {
      commandListeners.set(command, [listener])
    }
    commandListeners.get(command)!.sort(this.sortListeners)

    console.log("onCommand Registered A New Listener:\n", commandListeners)
    console.log("All Listeners:\n", this.listeners)

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

  private matchMessage(str: string, pattern: DataType.ListenedMessage): boolean {
    return (typeof pattern == "string" && str.includes(<string>pattern)) || (pattern instanceof RegExp && pattern.test(str))
  }
  private matchCommand(str: string, command: DataType.ListenedMessage): string[] | undefined {
    let i: number = -1
    let char: string | undefined
    function advance() {
      i++
      char = str[i]
    }
    function skipBlanks() {
      while (char && [" ", "\t", "\n", "\r"].includes(char)) {
        advance()
      }
    }
    function isSeparator() {
      return commandConfig.separator.includes(char!)
    }
    advance()

    const commandConfig = config.listener.command
    if (commandConfig.ignoreBlanks) {
      skipBlanks()
    }

    if (commandConfig.prompt.includes(char!)) {
      const segments: string[] = []

      advance()
      while (char) {
        if (isSeparator()) {
          advance()
        }
        else {
          let segment: string = ""
          while (char && !isSeparator()) {
            segment += char
            advance()
          }
          advance()

          if (commandConfig.ignoreBlanks) {
            segment = segment.trim()
          }

          segments.push(segment)
        }
      }

      const cmd = segments.shift()
      if (cmd && this.matchMessage(cmd, command)) {
        return segments
      }
    }

    return undefined
  }
}

export class Plugin_ extends Plugin {}