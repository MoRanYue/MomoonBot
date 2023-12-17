import { Event as Ev } from "./Event";
import { Event } from "../types/event";
import { ConnectionEnum, EventEnum, MessageSegmentEnum } from "../types/enums";
import { WrongEventTypeError } from "../exceptions/exceptions";
import { Segment } from "./messages/MessageSegment";
import type { MessageSegment } from "../types/message";
import { MessageUtils } from "../tools/MessageUtils";
import type { Connection } from "../connections/Connection";
import type { ConnectionContent } from "src/types/connectionContent";

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
  public isSelfSent: boolean

  constructor(ev: Event.Message, conn?: Connection) {
    super();

    this.checkEventType(ev, [EventEnum.EventType.message, EventEnum.EventType.messageSent])

    if (ev.post_type == EventEnum.EventType.messageSent) {
      this.isSelfSent = true
    }
    else {
      this.isSelfSent = false
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
    return MessageUtils.segmentsToObject(this.message)
  }

  public quickReply(message: string | MessageSegment.Segment | MessageSegment.Segment[] | Segment | Segment[]) {
    if (Array.isArray(message) && message.length != 0 && message[0] instanceof Segment) {
      message = MessageUtils.segmentsToObject(<Segment[]>message)
    }
    else if (message instanceof Segment) {
      message = message.toObject()
    }
    this.conn!.send(ConnectionEnum.Action.sendMsg, {
      message_type: this.messageType,
      group_id: this.groupId,
      user_id: this.userId,
      message,
      auto_escape: false
    })
  }
  public quickOperation() {}
}