import type { CommandListener, Listener, MessageListener, NoticeListener } from "src/processors/Listener"
import type { Event } from "../events/Event"
import type { MessageEvent } from "../events/MessageEvent"
import type { NoticeEvent } from "../events/NoticeEvent";
import type { ConnectionContent } from "./connectionContent"
import type { EventEnum, ListenerEnum } from "./enums"

export namespace DataType {
  type AnyFunction = (...args: any[]) => any

  type ResponseFunction = (data: ConnectionContent.Connection.Response<number | object | object[]>) => void | Promise<void>

  interface GroupMemberParams {
    groupId: number
    id: number
  }

  interface ListenerList {
    message: Map<ListenedMessage, MessageListener[]>
    command: Map<ListenedMessage, CommandListener[]>
    request: Map<ListenedMessage, Listener[]>
    notice: Map<ListenedMessage, NoticeListener[]>
  }
  interface ListenerReceiverData<T extends Function> {
    storedKey: string
    cb: T
  }
  type State = Record<string, any>
  type Checker = (ev: MessageEvent) => boolean
  type NoticeChecker = (ev: NoticeEvent) => boolean
  type MessageTypeChecker = EventEnum.MessageType | "all"
  type ListenedMessage = string | RegExp
  type ListenedMessageFuncReturn = void | boolean | Promise<void | boolean>
  type ListenedMessageFunc = (ev: MessageEvent, state: DataType.State) => ListenedMessageFuncReturn
  type ListenedMessageReceiverFunc = (ev: MessageEvent, state: DataType.State, eventQueue: MessageEvent[]) => void | ListenerEnum.ReceiverReturn
  type ListenedCommandFunc = (ev: MessageEvent, state: DataType.State, args: string[]) => ListenedMessageFuncReturn
  type ListenedNotice = EventEnum.NoticeType | EventEnum.NotifySubType
  type ListenedNoticeFuncReturn = void | Promise<void>
  type ListenedNoticeFunc = (ev: NoticeEvent) => ListenedNoticeFuncReturn
}