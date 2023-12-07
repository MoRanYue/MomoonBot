import type { Listener, MessageListener } from "src/processors/Listener"
import type { Event } from "../events/Event"
import type { MessageEvent } from "../events/MessageEvent"
import type { ConnectionContent } from "./connectionContent"

export namespace DataType {
  type AnyFunction = (...args: any[]) => any

  type ResponseFunction = (data: ConnectionContent.Connection.Response<number | object | object[]>) => void | Promise<void>

  interface ListenerList {
    message: Map<ListenedMessage, MessageListener[]>
    command: Map<ListenedMessage, Listener[]>
    request: Map<ListenedMessage, Listener[]>
    notice: Map<ListenedMessage, Listener[]>
  }
  type State = Record<string, any>
  type Checker = (ev: MessageEvent) => boolean
  type ListenedMessage = string | RegExp
  type ListenedMessageFunc = (ev: MessageEvent, state: DataType.State) => (void | Promise<void>)
  type ListenedCommandFunc = (ev: MessageEvent, state: DataType.State, args: string[]) => (void | Promise<void>)
}