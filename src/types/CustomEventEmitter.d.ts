import type EventEmitter from "node:events";
import type { URLSearchParams } from "node:url";
import { Event } from "./event";

export namespace ConnectionEventEmitter {
  interface CustomEventEmitter extends EventEmitter {}

  interface HttpEventEmitter extends CustomEventEmitter {
    on(eventName: "message", listener: (ev: Event.Message) => void): this
    on(eventName: "notice", listener: (ev: Event.Notice) => void): this
    on(eventName: "request", listener: (ev: Event.Request) => void): this
    on(eventName: "unknown", listener: (ev: Event.Unknown) => void): this
    on(eventName: string, listener: (...args: any[]) => void): this
  }
}