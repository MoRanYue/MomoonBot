import { WrongEventTypeError } from "../exceptions/exceptions";
import type { Connection } from "../connections/Connection";
import type { Event as Ev } from "src/types/event";
import { EventEnum } from "../types/enums";

export abstract class Event {
  type!: EventEnum.EventType;
  conn?: Connection
  
  abstract selfId: number
  abstract time: number

  protected checkEventType(ev: Ev.Reported, expectedType: EventEnum.EventType | EventEnum.EventType[]): never | void {
    if ((Array.isArray(expectedType) && !expectedType.includes(ev.post_type)) || 
    (typeof expectedType == "string" && expectedType != ev.post_type)) {
      throw new WrongEventTypeError(`错误的事件类型，应为“${expectedType}”而不是“${ev.post_type}”`)
    }
  }
}