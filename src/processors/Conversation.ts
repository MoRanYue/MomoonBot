import { launcher } from "../app";
import { MessageEvent } from "../events/MessageEvent";
import type { Segment } from "src/events/messages/MessageSegment";
import { ConnectionEnum, EventEnum, ListenerEnum, MessageSegmentEnum } from "../types/enums";
import type { ConnectionContent } from "src/types/connectionContent";
import type { DataType } from "src/types/dataType";

/**
 * 连续对话类
 * @since 0.7.0
 */
export class Conversation {
  protected origin: number
  protected userId!: number
  public step: number = 0
  public lastStatus: void | ListenerEnum.ReceiverReturn = undefined
  public state: DataType.State = {}
  protected queue: MessageEvent[] = []

  constructor(origin: MessageEvent) {
    this.origin = origin.messageId
    this.userId = origin.userId
    this.queue.push(origin)
  }

  public push(...events: MessageEvent[]): number {
    return this.queue.push(...events)
  }
  public pop(): MessageEvent | undefined {
    return this.queue.pop()
  }

  
  public get originMessage(): number {
    return this.origin
  }

  public get initiatorId(): number {
    return this.userId
  }
  
  public get messageQueue(): MessageEvent[] {
    return this.queue
  }
  
  
}