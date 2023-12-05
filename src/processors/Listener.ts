import type { DataType } from "src/types/dataType";
import type { Event } from "src/events/Event";
import type { MessageEvent } from "src/events/MessageEvent";
import { ListenerEnum } from "../types/enums";
import { Conversation } from "./Conversation";
import { ListenerUtils } from "src/tools/ListenerUtils";

abstract class Listener {
  public priority!: number
  public block!: boolean
  protected abstract callback: Function

  public abstract trigger(ev: Event, state: DataType.State, args: string[]): void | Promise<void>
}

class MessageListener extends Listener {
  protected callback: DataType.ListenedMessageFunc;
  protected checkers: DataType.Checker[]
  protected permission: ListenerEnum.Permission
  protected usage?: string
  protected ignoreCase?: boolean

  protected conversations: Conversation[] = []

  constructor(cb: DataType.ListenedMessageFunc, priority: number = 0, permission: ListenerEnum.Permission = ListenerEnum.Permission.user, 
  checkers: DataType.Checker | DataType.Checker[] = [], block: boolean = false, ignoreCase: boolean = true, usage?: string) {
    super()

    this.callback = cb
    this.priority = priority
    this.permission = permission
    if (Array.isArray(checkers)) {
      this.checkers = checkers
    }
    else {
      this.checkers = [checkers]
    }
    this.block = block
    this.usage = usage
    this.ignoreCase = ignoreCase
  }

  public trigger(ev: MessageEvent, state: DataType.State) {
    for (let i = 0; i < this.checkers.length; i++) {
      if (!this.checkers[i](ev)) {
        return
      }
    }
    return this.callback(ev, state)
  }

  public get instruction(): string | undefined {
    return this.usage
  }
}

class CommandListener extends Listener {
  protected callback: DataType.ListenedCommandFunc;
  protected checkers: DataType.Checker[]
  protected permission: ListenerEnum.Permission
  protected usage?: string
  protected ignoreCase?: boolean

  protected conversations: Conversation[] = []

  constructor(cb: DataType.ListenedCommandFunc, priority: number = 0, permission: ListenerEnum.Permission = ListenerEnum.Permission.user, 
  checkers: DataType.Checker | DataType.Checker[] = [], block: boolean = false, ignoreCase: boolean = true, usage?: string) {
    super()

    this.callback = cb
    this.priority = priority
    this.permission = permission
    if (Array.isArray(checkers)) {
      this.checkers = checkers
    }
    else {
      this.checkers = [checkers]
    }
    this.block = block
    this.usage = usage
    this.ignoreCase = ignoreCase
  }

  public trigger(ev: MessageEvent, state: DataType.State, args: string[]) {
    for (let i = 0; i < this.checkers.length; i++) {
      if (!this.checkers[i](ev)) {
        return
      }
    }
    return this.callback(ev, state, args)
  }
  
  public get instruction(): string | undefined {
    return this.usage
  }
  
}

export {
  Listener, MessageListener, CommandListener
}