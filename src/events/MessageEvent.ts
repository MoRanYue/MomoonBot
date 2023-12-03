import { Event as Ev } from "./Event";
import { Event } from "../types/event";
import { EventEnum, MessageSegmentEnum } from "../types/enums";
import { WrongEventTypeError } from "../exceptions/exceptions";
import { type Segment } from "./messages/MessageSegment";
import type { MessageSegment } from "../types/message";
import { MessageUtils } from "../tools/MessageUtils";
import type { Connection } from "../connections/Connection";

export class MessageEvent extends Ev {
  public time: number
  public selfId: number
  public peerId: number
  public userId: number
  public targetId?: number
  public groupId?: number
  public tempSource?: EventEnum.MessageTempSource
  public messageType: EventEnum.MessageType
  public messageSubType: EventEnum.MessageSubType
  public message: Segment[]
  public raw: string
  public sender: Event.MessageSender
  public messageId: number

  constructor(ev: Event.Message, conn: Connection) {
    super();

    if (Object.hasOwn(ev, "post_type") && ev.post_type != EventEnum.EventType.message) {
      throw new WrongEventTypeError(`错误的事件类型，应为“${EventEnum.EventType.message}”而不是“${ev.post_type}”`)
    }

    this.type = EventEnum.EventType.message
    this.conn = conn
    this.selfId = ev.self_id
    this.time = ev.time

    this.peerId = ev.peer_id
    this.userId = ev.user_id
    this.messageType = ev.message_type
    this.messageSubType = ev.sub_type
    this.message = MessageUtils.classify(ev.message)
    this.messageId = ev.message_id
    this.raw = ev.raw_message
    this.sender = ev.sender
    if (ev.message_type == EventEnum.MessageType.group) {
      this.groupId = ev.group_id
    }
    else if (ev.message_type == EventEnum.MessageType.private) {
      this.targetId = ev.target_id
      this.tempSource = ev.temp_source
    }
  }

  public getPlainText(): string {
    let text: string = ""
    this.message.forEach(seg => {
      text += seg.toPlainText()
    })
    return text
  }
  public messageToObject(): MessageSegment.Segment[] {
    let message: MessageSegment.Segment[] = []
    this.message.forEach(seg => {
      message.push(seg.toObject())
    })
    return message
  }

  public quickReply() {}
  public quickOperation() {}
}