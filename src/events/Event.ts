import type { Connection } from "../connections/Connection";
import { EventEnum } from "../types/enums";

export abstract class Event {
  type!: EventEnum.EventType;
  conn?: Connection
  
  abstract selfId: number
  abstract time: number
}