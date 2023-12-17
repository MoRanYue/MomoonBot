import type EventEmitter from "node:events";
import type { URLSearchParams } from "node:url";
import type { Event } from "./event";
import type { DataType } from "./dataType";
import type { MessageEvent } from "../events/MessageEvent";
import type { NoticeEvent } from "../events/NoticeEvent";
import type { Event as Ev } from "../events/Event";
import type { ConnectionContent } from "./connectionContent";

export namespace CustomEventEmitter {
  interface CustomEventEmitter extends EventEmitter {}

  interface ConnectionEventEmitter {
    on(eventName: "message", listener: (ev: Event.Message) => void): this
    on(eventName: "notice", listener: (ev: Event.Notice) => void): this
    on(eventName: "request", listener: (ev: Event.Request) => void): this
    on(eventName: "unknown", listener: (ev: Event.Unknown) => void): this
    on(eventName: "response", listener: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): this
    on(eventName: "connect", listener: VoidFunction): this
    on(eventName: string | symbol, listener: DataType.AnyFunction): this

    once(eventName: "message", listener: (ev: Event.Message) => void): this
    once(eventName: "notice", listener: (ev: Event.Notice) => void): this
    once(eventName: "request", listener: (ev: Event.Request) => void): this
    once(eventName: "unknown", listener: (ev: Event.Unknown) => void): this
    once(eventName: "response", listener: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): this
    once(eventName: "connect", listener: VoidFunction): this
    once(eventName: string | symbol, listener: DataType.AnyFunction): this
    
    emit(eventName: "message", ev: Event.Message): boolean
    emit(eventName: "notice", ev: Event.Notice): boolean
    emit(eventName: "request", ev: Event.Request): boolean
    emit(eventName: "unknown", ev: Event.Unknown): boolean
    emit(eventName: "response", data: ConnectionContent.Connection.Response<any> | any): boolean
    emit(eventName: "connect"): boolean
    emit(eventName: string | symbol, ...args: any[]): boolean;
  }

  interface HttpEventEmitter extends ConnectionEventEmitter {}
  interface ReverseWsEventEmitter extends ConnectionContent {
    on(eventName: "message", listener: (ev: Event.Message) => void): this
    on(eventName: "notice", listener: (ev: Event.Notice) => void): this
    on(eventName: "request", listener: (ev: Event.Request) => void): this
    on(eventName: "unknown", listener: (ev: Event.Unknown) => void): this
    on(eventName: "meta", listener: (ev: Event.MetaEvent) => void): this
    on(eventName: "response", listener: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): this
    on(eventName: "connect", listener: VoidFunction): this
    on(eventName: string | symbol, listener: DataType.AnyFunction): this

    once(eventName: "message", listener: (ev: Event.Message) => void): this
    once(eventName: "notice", listener: (ev: Event.Notice) => void): this
    once(eventName: "request", listener: (ev: Event.Request) => void): this
    once(eventName: "unknown", listener: (ev: Event.Unknown) => void): this
    once(eventName: "meta", listener: (ev: Event.MetaEvent) => void): this
    once(eventName: "response", listener: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): this
    once(eventName: "connect", listener: VoidFunction): this
    once(eventName: string | symbol, listener: DataType.AnyFunction): this
    
    emit(eventName: "message", ev: Event.Message): boolean
    emit(eventName: "notice", ev: Event.Notice): boolean
    emit(eventName: "request", ev: Event.Request): boolean
    emit(eventName: "unknown", ev: Event.Unknown): boolean
    emit(eventName: "meta", ev: Event.MetaEvent): boolean
    emit(eventName: "response", data: ConnectionContent.Connection.Response<any> | any): boolean
    emit(eventName: "connect"): boolean
    emit(eventName: string | symbol, ...args: any[]): boolean
  }

  interface PluginLoaderEventEmitter extends CustomEventEmitter {
    on(eventName: "message", listener: (ev: MessageEvent) => void): this
    on(eventName: "notice", listener: (ev: NoticeEvent) => void): this
    on(eventName: "request", listener: (ev: Ev) => void): this
    on(eventName: "unknown", listener: (ev: Ev) => void): this
    on(eventName: string | symbol, listener: DataType.AnyFunction): this

    once(eventName: "message", listener: (ev: MessageEvent) => void): this
    once(eventName: "notice", listener: (ev: NoticeEvent) => void): this
    once(eventName: "request", listener: (ev: Ev) => void): this
    once(eventName: "unknown", listener: (ev: Ev) => void): this
    once(eventName: string | symbol, listener: DataType.AnyFunction): this

    emit(eventName: "message", ev: MessageEvent): boolean
    emit(eventName: "notice", ev: NoticeEvent): boolean
    emit(eventName: "request", ev: Ev): boolean
    emit(eventName: "unknown", ev: Ev): boolean
    emit(eventName: string | symbol, ...args: any[]): boolean;
  }
  interface PluginEventEmitter extends CustomEventEmitter {
    on(eventName: "message", listener: (ev: MessageEvent) => void): this
    on(eventName: "notice", listener: (ev: NoticeEvent) => void): this
    on(eventName: "request", listener: (ev: Ev) => void): this
    on(eventName: "unknown", listener: (ev: Ev) => void): this
    on(eventName: "load", listener: VoidFunction)
    on(eventName: "unload", listener: VoidFunction)
    on(eventName: string | symbol, listener: DataType.AnyFunction): this

    once(eventName: "message", listener: (ev: MessageEvent) => void): this
    once(eventName: "notice", listener: (ev: NoticeEvent) => void): this
    once(eventName: "request", listener: (ev: Ev) => void): this
    once(eventName: "unknown", listener: (ev: Ev) => void): this
    once(eventName: "load", listener: VoidFunction)
    once(eventName: "unload", listener: VoidFunction)
    once(eventName: string | symbol, listener: DataType.AnyFunction): this

    emit(eventName: "message", ev: MessageEvent): boolean
    emit(eventName: "notice", ev: NoticeEvent): boolean
    emit(eventName: "request", ev: Ev): boolean
    emit(eventName: "unknown", ev: Ev): boolean
    emit(eventName: "load", ...args: any[])
    emit(eventName: "unload", ...args: any[])
    emit(eventName: string | symbol, ...args: any[]): boolean;
  }
}