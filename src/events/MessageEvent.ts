import { Event as Ev } from "./Event";
import { Event } from "../types/event";
import { ConnectionEnum, EventEnum } from "../types/enums";
import MsgSegment, { Segment } from "./messages/MessageSegment";
import type { MessageSegment } from "../types/message";
import { MessageUtils } from "../tools/MessageUtils";
import type { Connection } from "../connections/Connection";
import type { DataType } from "src/types/dataType";

export class MessageEvent extends Ev {
  public conn: Connection;
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
  public sender: {
    nickname: string
    groupCard?: string
    role?: EventEnum.GroupMemberRole
  }
  public messageId: number
  
  public isSentBySelf: boolean

  constructor(ev: Event.Message, conn: Connection) {
    super();

    this.checkEventType(ev, [EventEnum.EventType.message, EventEnum.EventType.messageSent])

    this.isSentBySelf = ev.post_type == EventEnum.EventType.messageSent
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
    if (Object.hasOwn(ev.sender, "role")) {
      const senderInfo = <Event.GroupMessageSender>ev.sender
      this.sender = {
        nickname: senderInfo.nickname,
        groupCard: senderInfo.card,
        role: senderInfo.role,
      }
    }
    else {
      this.sender = {
        nickname: ev.sender.nickname
      }
    }
    if (ev.message_type == EventEnum.MessageType.group) {
      this.groupId = ev.group_id
    }
    else if (ev.message_type == EventEnum.MessageType.private) {
      this.targetId = ev.target_id
      this.tempSource = ev.temp_source
    }
  }

  public getPlainText(): string {
    return MessageUtils.segmentsToPlainText(this.message)
  }
  public getMessageContent(): string {
    let str: string = ""
    this.message.forEach(seg => str += seg.toPlainText())
    return str
  }
  public messageToObject(): MessageSegment.Segment[] {
    return MessageUtils.segmentsToObject(this.message)
  }

  public reply(message: DataType.SendingMessageContent): void
  public reply(message: DataType.SendingMessageContent, cb?: DataType.MessageEventOperationFunc): void
  public reply(message: DataType.SendingMessageContent, cb?: DataType.MessageEventOperationFunc, atSender?: boolean): void
  public reply(message: DataType.SendingMessageContent, cb?: DataType.MessageEventOperationFunc, atSender?: boolean, reply?: boolean): void
  public reply(message: DataType.SendingMessageContent, cb?: DataType.MessageEventOperationFunc, atSender: boolean = false, reply: boolean = false): void {
    let msg!: MessageSegment.Segment[]
    if (Array.isArray(message) && message.length != 0 && message[0] instanceof Segment) {
      msg = MessageUtils.segmentsToObject(<Segment[]>message)
    }
    else if (typeof message == "string") {
      msg = [new MsgSegment.Text(message).toObject()]
    }
    else if (message instanceof Segment) {
      msg = [message.toObject()]
    }
    else {
      throw new TypeError(`消息类型错误，应为“SendingMessageContent”而不是“${typeof message}”`)
    }
    
    if (atSender && this.messageType == EventEnum.MessageType.group) {
      msg.unshift(new MsgSegment.At(this.userId).toObject(), new MsgSegment.Text(" ").toObject())
    }
    if (reply) {
      msg.unshift(new MsgSegment.Reply(this.messageId).toObject())
    }

    this.conn!.send(ConnectionEnum.Action.sendMsg, {
      message_type: this.messageType,
      group_id: this.groupId,
      user_id: this.userId,
      message: msg,
      auto_escape: false
    }, cb)
  }

  public recall(): void
  public recall(cb?: DataType.ResponseFunction<null>): void {
    this.conn!.send(ConnectionEnum.Action.deleteMsg, {
      message_id: this.messageId
    }, cb)
  }

  public kickSender(reject?: boolean): void
  public kickSender(reject: boolean = false, cb?: DataType.ResponseFunction<null>): void {
    this.conn!.send(ConnectionEnum.Action.setGroupKick, {
      group_id: this.groupId,
      user_id: this.userId,
      reject_add_request: reject
    }, cb)
  }

  public muteSender(duration: number): void
  public muteSender(duration: number, cb?: DataType.ResponseFunction<null>): void {
    this.conn!.send(ConnectionEnum.Action.setGroupBan, {
      group_id: this.groupId,
      user_id: this.userId,
      duration
    }, cb)
  }
}