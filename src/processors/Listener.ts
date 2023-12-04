import type { DataType } from "src/types/dataType";
import type { Event } from "src/events/Event";
import type { MessageEvent } from "src/events/MessageEvent";

abstract class Listener {
  public priority!: number
  public block!: boolean
  protected abstract callback: Function

  public abstract trigger(ev: Event, state: DataType.State, args: string[]): void | Promise<void>
}

class MessageListener extends Listener {
  protected callback: DataType.ListenedMessageFunc;
  protected messageGetters: DataType.ListenedMessageFunc[] = []
  protected usage?: string
  protected ignoreCase?: boolean

  constructor(cb: DataType.ListenedMessageFunc, priority: number = 0, block: boolean = false, ignoreCase: boolean = true, usage?: string) {
    super()

    this.callback = cb
    this.priority = priority
    this.block = block
    this.usage = usage
    this.ignoreCase = ignoreCase
  }

  public trigger(ev: MessageEvent, state: DataType.State) {
    return this.callback(ev, state)
  }

  public get(): this {
    return this
  }

  public get instruction(): string | undefined {
    return this.usage
  }
}

class CommandListener extends Listener {
  protected callback: DataType.ListenedCommandFunc;
  protected messageGetters: DataType.ListenedCommandFunc[] = []
  protected usage?: string
  protected ignoreCase?: boolean

  constructor(cb: DataType.ListenedCommandFunc, priority: number = 0, block: boolean = false, ignoreCase: boolean = true, usage?: string) {
    super()

    this.callback = cb
    this.priority = priority
    this.block = block
    this.usage = usage
    this.ignoreCase = ignoreCase
  }

  public trigger(ev: MessageEvent, state: DataType.State, args: string[]) {
    return this.callback(ev, state, args)
  }
  
  public get instruction(): string | undefined {
    return this.usage
  }
  
}

export {
  Listener, MessageListener, CommandListener
}