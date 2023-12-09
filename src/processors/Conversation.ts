import { launcher } from "../app";
import { MessageEvent } from "../events/MessageEvent";
import type { Segment } from "src/events/messages/MessageSegment";
import { ConnectionEnum, EventEnum, ListenerEnum, MessageSegmentEnum } from "../types/enums";
import type { ConnectionContent } from "src/types/connectionContent";
import type { DataType } from "src/types/dataType";

export class Conversation {
  protected origin: number
  protected userId!: number
  public step: number = 0
  public lastStatus: void | ListenerEnum.ReceiverReturn = undefined
  public state: DataType.State = {}
  protected queue: MessageEvent[] = []

  constructor(origin: MessageEvent | number, connectionIndex: number = 0) {
    if (typeof origin == "object") {
      this.origin = origin.messageId
      this.userId = origin.userId
      this.queue.push(origin)
    }
    else {
      this.origin = origin

      const client = launcher.getConnections()[connectionIndex]
      client.send(ConnectionEnum.Action.getMsg, <ConnectionContent.Params.GetMsg>{
        message_id: origin
      }, data => {
        const result = <ConnectionContent.Connection.Response<ConnectionContent.ActionResponse.GetMsg>>data
        if (data.retcode != ConnectionEnum.ResponseCode.ok) {
          throw new Error(`消息“${origin}”无效`);
        }

        const message = result.data
        const isGroup = message.message_type == EventEnum.MessageType.group
        const inst = new MessageEvent({
          post_type: EventEnum.EventType.message,
          font: 0,
          time: message.time,
          message_type: message.message_type,
          message_id: message.message_id,
          message: message.message,
          raw_message: "",
          group_id: message.group_id,
          target_id: message.target_id,
          peer_id: message.peer_id,
          user_id: message.sender.user_id,
          sub_type: isGroup ? EventEnum.MessageSubType.normal : EventEnum.MessageSubType.friend,
          self_id: 0,
          temp_source: isGroup ? EventEnum.MessageTempSource.group : EventEnum.MessageTempSource.finding,
          sender: {
            nickname: message.sender.nickname,
            card: "",
            level: "",
            role: "member",
            title: "",
            user_id: message.sender.user_id
          }
        }, client)
        this.userId = message.sender.user_id
        this.queue.push(inst)
      })
    }
  }

  public append(...events: MessageEvent[]): number {
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