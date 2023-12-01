import type EventEmitter from "node:events";
import type { URLSearchParams } from "node:url";
import { Event } from "./event";

export namespace ConnectionEventEmitter {
  interface CustomEventEmitter extends EventEmitter {}

  interface HttpEventEmitter extends CustomEventEmitter {
    on(eventName: "message", listener: (ev: Event) => void): this
    on(eventName: string, listener: (...args: any[]) => void): this
  }
}