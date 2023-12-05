import { launcher } from "../app";
import { MessageEvent } from "../events/MessageEvent";
import type { Segment } from "src/events/messages/MessageSegment";
import { ConnectionEnum, EventEnum, MessageSegmentEnum } from "../types/enums";
import type { ConnectionContent } from "src/types/connectionContent";

export class Conversation {
  protected origin: number
  protected queue: MessageEvent[] = []

  constructor(origin: MessageEvent | number, connectionIndex: number = 0) {
    if (typeof origin == "object") {
      this.origin = origin.messageId
      this.queue.push(origin)
    }
    else {
      this.origin = origin

      const client = launcher.getConnections()[connectionIndex]
      client.ev.once("response", (data: ConnectionContent.Connection.Response<ConnectionContent.ActionResponse.GetMsg>) => {
        if (data.retcode != ConnectionEnum.ResponseCode.ok) {
          throw new Error(`消息“${origin}”无效`);
        }

        const message = data.data
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
            card: message.sender.nickname,
            level: "0",
            role: "",
            title: "",
            user_id: message.sender.user_id
          }
        }, client)
        this.queue.push(inst)
      })
      client.send(ConnectionEnum.Action.getMsg, <ConnectionContent.Params.GetMsg>{
        message_id: origin
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
  
  public get messageQueue(): MessageEvent[] {
    return this.messageQueue
  }
  
  
}