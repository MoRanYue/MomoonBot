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

  constructor(cb: DataType.ListenedMessageFunc, priority: number = 0, block: boolean = false) {
    super()

    this.callback = cb
    this.priority = priority
    this.block = block
  }

  public trigger(ev: MessageEvent, state: DataType.State) {
    return this.callback(ev, state)
  }

  public get(): this {
    return this
  }
}

class CommandListener extends Listener {
  protected callback: DataType.ListenedCommandFunc;
  protected messageGetters: DataType.ListenedCommandFunc[] = []

  constructor(cb: DataType.ListenedCommandFunc, priority: number = 0, block: boolean = false) {
    super()

    this.callback = cb
    this.priority = priority
    this.block = block
  }

  public trigger(ev: MessageEvent, state: DataType.State, args: string[]) {
    return this.callback(ev, state, args)
  }
}

export {
  Listener, MessageListener, CommandListener
}