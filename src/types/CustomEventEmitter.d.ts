import type EventEmitter from "node:events";
import type { URLSearchParams } from "node:url";
import type { Event } from "./event";
import type { DataType } from "./dataType";
import type { MessageEvent } from "../events/MessageEvent";
import type { NoticeEvent } from "../events/NoticeEvent";
import type { RequestEvent } from "../events/RequestEvent";
import type { Event as Ev } from "../events/Event";
import type { ConnectionContent } from "./connectionContent";
import type { Client } from "src/connections/Client";
import type { HttpClient } from "src/connections/HttpClient";
import type { ReverseWsClient } from "src/connections/ReverseWsClient";

export namespace CustomEventEmitter {
  interface CustomEventEmitter extends EventEmitter {}

  interface AdapterEventEmitter {
    on(eventName: "report", listener: (ev: unknown, client: Client) => void): this
    on(eventName: "result", listener: (ev: Ev, client: Client) => void): this
    on(eventName: string | symbol, listener: DataType.AnyFunction): this

    once(eventName: "report", listener: (ev: unknown, client: Client) => void): this
    once(eventName: "result", listener: (ev: Ev, client: Client) => void): this
    once(eventName: string | symbol, listener: DataType.AnyFunction): this
    
    emit(eventName: "report", ev: unknown, client: Client): boolean
    emit(eventName: "result", ev: Ev, client: Client): boolean
    emit(eventName: string | symbol, ...args: any[]): boolean;
  }
  interface OneBotV11EventEmitter extends AdapterEventEmitter {
    on(eventName: "report", listener: (ev: Event.Unknown, client: Client) => void): this
    on(eventName: "result", listener: (ev: Ev, client: Client) => void): this
    on(eventName: string | symbol, listener: DataType.AnyFunction): this

    once(eventName: "report", listener: (ev: Event.Unknown, client: Client) => void): this
    once(eventName: "result", listener: (ev: Ev, client: Client) => void): this
    once(eventName: string | symbol, listener: DataType.AnyFunction): this
    
    emit(eventName: "report", ev: Event.Unknown, client: Client): boolean
    emit(eventName: "result", ev: Ev, client: Client): boolean
    emit(eventName: string | symbol, ...args: any[]): boolean;
  }
  interface KritorEventEmitter extends AdapterEventEmitter {}

  interface ConnectionEventEmitter {
    on(eventName: "message", listener: (ev: Event.Message, client: Client) => void): this
    on(eventName: "notice", listener: (ev: Event.Notice, client: Client) => void): this
    on(eventName: "request", listener: (ev: Event.Request, client: Client) => void): this
    on(eventName: "unknown", listener: (ev: Event.Unknown, client: Client) => void): this
    on(eventName: "response", listener: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): this
    on(eventName: "connect", listener: (address: string) => void): this
    on(eventName: string | symbol, listener: DataType.AnyFunction): this

    once(eventName: "message", listener: (ev: Event.Message, client: Client) => void): this
    once(eventName: "notice", listener: (ev: Event.Notice, client: Client) => void): this
    once(eventName: "request", listener: (ev: Event.Request, client: Client) => void): this
    once(eventName: "unknown", listener: (ev: Event.Unknown, client: Client) => void): this
    once(eventName: "response", listener: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): this
    once(eventName: "connect", listener: (address: string) => void): this
    once(eventName: string | symbol, listener: DataType.AnyFunction): this
    
    emit(eventName: "message", ev: Event.Message, client: Client): boolean
    emit(eventName: "notice", ev: Event.Notice, client: Client): boolean
    emit(eventName: "request", ev: Event.Request, client: Client): boolean
    emit(eventName: "unknown", ev: Event.Unknown, client: Client): boolean
    emit(eventName: "response", data: ConnectionContent.Connection.Response<any> | any): boolean
    emit(eventName: "connect", address: string): boolean
    emit(eventName: string | symbol, ...args: any[]): boolean;
  }

  interface HttpEventEmitter extends ConnectionEventEmitter {
    on(eventName: "message", listener: (ev: Event.Message, client: HttpClient) => void): this
    on(eventName: "notice", listener: (ev: Event.Notice, client: HttpClient) => void): this
    on(eventName: "request", listener: (ev: Event.Request, client: HttpClient) => void): this
    on(eventName: "unknown", listener: (ev: Event.Unknown, client: HttpClient) => void): this
    on(eventName: "response", listener: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): this
    on(eventName: "connect", listener: (address: string, port: number) => void): this
    on(eventName: string | symbol, listener: DataType.AnyFunction): this

    once(eventName: "message", listener: (ev: Event.Message, client: HttpClient) => void): this
    once(eventName: "notice", listener: (ev: Event.Notice, client: HttpClient) => void): this
    once(eventName: "request", listener: (ev: Event.Request, client: HttpClient) => void): this
    once(eventName: "unknown", listener: (ev: Event.Unknown, client: HttpClient) => void): this
    once(eventName: "response", listener: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): this
    once(eventName: "connect", listener: (address: string, port: number) => void): this
    once(eventName: string | symbol, listener: DataType.AnyFunction): this
    
    emit(eventName: "message", ev: Event.Message, client: HttpClient): boolean
    emit(eventName: "notice", ev: Event.Notice, client: HttpClient): boolean
    emit(eventName: "request", ev: Event.Request, client: HttpClient): boolean
    emit(eventName: "unknown", ev: Event.Unknown, client: HttpClient): boolean
    emit(eventName: "response", data: ConnectionContent.Connection.Response<any> | any): boolean
    emit(eventName: "connect", address: string, port: number): boolean
    emit(eventName: string | symbol, ...args: any[]): boolean;
  }
  interface ReverseWsEventEmitter extends ConnectionContent {
    on(eventName: "message", listener: (ev: Event.Message, client: ReverseWsClient) => void): this
    on(eventName: "notice", listener: (ev: Event.Notice, client: ReverseWsClient) => void): this
    on(eventName: "request", listener: (ev: Event.Request, client: ReverseWsClient) => void): this
    on(eventName: "unknown", listener: (ev: Event.Unknown, client: ReverseWsClient) => void): this
    on(eventName: "meta", listener: (ev: Event.MetaEvent, client: ReverseWsClient) => void): this
    on(eventName: "response", listener: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): this
    on(eventName: "connect", listener: (address: string) => void): this
    on(eventName: "_removeClient", listener: (client: ReverseWsClient) => void): this
    on(eventName: string | symbol, listener: DataType.AnyFunction): this

    once(eventName: "message", listener: (ev: Event.Message, client: ReverseWsClient) => void): this
    once(eventName: "notice", listener: (ev: Event.Notice, client: ReverseWsClient) => void): this
    once(eventName: "request", listener: (ev: Event.Request, client: ReverseWsClient) => void): this
    once(eventName: "unknown", listener: (ev: Event.Unknown, client: ReverseWsClient) => void): this
    once(eventName: "meta", listener: (ev: Event.MetaEvent, client: ReverseWsClient) => void): this
    once(eventName: "response", listener: DataType.ResponseFunction<any> | DataType.RawResponseFunction<any>): this
    once(eventName: "connect", listener: (address: string) => void): this
    once(eventName: "_removeClient", listener: (client: ReverseWsClient) => void): this
    once(eventName: string | symbol, listener: DataType.AnyFunction): this
    
    emit(eventName: "message", ev: Event.Message, client: ReverseWsClient): boolean
    emit(eventName: "notice", ev: Event.Notice, client: ReverseWsClient): boolean
    emit(eventName: "request", ev: Event.Request, client: ReverseWsClient): boolean
    emit(eventName: "unknown", ev: Event.Unknown, client: ReverseWsClient): boolean
    emit(eventName: "meta", ev: Event.MetaEvent, client: ReverseWsClient): boolean
    emit(eventName: "response", data: ConnectionContent.Connection.Response<any> | any): boolean
    emit(eventName: "connect", address: string): boolean
    emit(eventName: "_removeClient", client: ReverseWsClient): boolean
    emit(eventName: string | symbol, ...args: any[]): boolean
  }

  interface PluginLoaderEventEmitter extends CustomEventEmitter {
    on(eventName: "message", listener: (ev: MessageEvent) => void): this
    on(eventName: "notice", listener: (ev: NoticeEvent) => void): this
    on(eventName: "request", listener: (ev: RequestEvent) => void): this
    on(eventName: "unknown", listener: (ev: Ev) => void): this
    on(eventName: string | symbol, listener: DataType.AnyFunction): this

    once(eventName: "message", listener: (ev: MessageEvent) => void): this
    once(eventName: "notice", listener: (ev: NoticeEvent) => void): this
    once(eventName: "request", listener: (ev: RequestEvent) => void): this
    once(eventName: "unknown", listener: (ev: Ev) => void): this
    once(eventName: string | symbol, listener: DataType.AnyFunction): this

    emit(eventName: "message", ev: MessageEvent): boolean
    emit(eventName: "notice", ev: NoticeEvent): boolean
    emit(eventName: "request", ev: RequestEvent): boolean
    emit(eventName: "unknown", ev: Ev): boolean
    emit(eventName: string | symbol, ...args: any[]): boolean;
  }
  interface PluginEventEmitter extends CustomEventEmitter {
    on(eventName: "message", listener: (ev: MessageEvent) => void): this
    on(eventName: "notice", listener: (ev: NoticeEvent) => void): this
    on(eventName: "request", listener: (ev: RequestEvent) => void): this
    on(eventName: "unknown", listener: (ev: Ev) => void): this
    on(eventName: "load", listener: VoidFunction): this
    on(eventName: "unload", listener: (complete: () => void) => void): this
    on(eventName: string | symbol, listener: DataType.AnyFunction): this

    once(eventName: "message", listener: (ev: MessageEvent) => void): this
    once(eventName: "notice", listener: (ev: NoticeEvent) => void): this
    once(eventName: "request", listener: (ev: RequestEvent) => void): this
    once(eventName: "unknown", listener: (ev: Ev) => void): this
    once(eventName: "load", listener: VoidFunction): this
    once(eventName: "unload", listener: (complete: () => void) => void): this
    once(eventName: string | symbol, listener: DataType.AnyFunction): this

    emit(eventName: "message", ev: MessageEvent): boolean
    emit(eventName: "notice", ev: NoticeEvent): boolean
    emit(eventName: "request", ev: RequestEvent): boolean
    emit(eventName: "unknown", ev: Ev): boolean
    emit(eventName: "load", ...args: any[]): boolean
    emit(eventName: "unload", complete: () => void): boolean
    emit(eventName: string | symbol, ...args: any[]): boolean
  }
}