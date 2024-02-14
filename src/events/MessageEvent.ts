import { Event as Ev } from "./Event";
import { Event } from "../types/event";
import { ConnectionEnum, EventEnum, MessageSegmentEnum } from "../types/enums";
import MsgSegment, { Segment } from "./messages/MessageSegment";
import type { MessageSegment } from "../types/message";
import { MessageUtils } from "../tools/MessageUtils";
import type { Connection } from "../connections/Connection";
import type { DataType } from "src/types/dataType";
import type { Client } from "src/connections/Client";
import type { ConnectionContent } from "src/types/connectionContent";

export class MessageEvent extends Ev {
  public client: Client;
  public time: number
  public selfId: number
  public peerId: number
  public userId: number
  public tinyId?: number
  public targetId?: number
  public groupId?: number
  public guildId?: number
  public channelId?: number
  public tempSource?: EventEnum.MessageTempSource
  public messageType: EventEnum.MessageType
  public messageSubType: EventEnum.MessageSubType
  public message: Segment[]
  public raw: string
  public sender!: {
    nickname: string
    groupCard?: string
    level?: number
    role?: EventEnum.GroupMemberRole
  }
  public messageId: number
  
  public isSentBySelf: boolean

  constructor(ev: Event.Message, client: Client) {
    super();

    this.checkEventType(ev, [EventEnum.EventType.message, EventEnum.EventType.messageSent])

    this.isSentBySelf = ev.post_type == EventEnum.EventType.messageSent
    this.client = client
    this.selfId = ev.self_id
    this.time = ev.time

    this.peerId = ev.peer_id
    this.userId = ev.user_id
    this.messageType = ev.message_type
    this.messageSubType = ev.sub_type
    this.message = MessageUtils.classify(ev.message)
    this.messageId = ev.message_id
    this.raw = ev.raw_message
    if (ev.message_type == EventEnum.MessageType.group) {
      this.groupId = ev.group_id
      const senderInfo = <Event.GroupMessageSender>ev.sender
      this.sender = {
        nickname: senderInfo.nickname,
        groupCard: senderInfo.card,
        level: parseInt(senderInfo.level || "0"),
        role: senderInfo.role
      }
    }
    else if (ev.message_type == EventEnum.MessageType.private) {
      this.targetId = ev.target_id
      this.tempSource = ev.temp_source
      this.sender = {
        nickname: ev.sender.nickname
      }
    }
    else if (ev.message_type == EventEnum.MessageType.guild) {
      this.tinyId = this.userId
      this.guildId = ev.guild_id
      this.channelId = ev.channel_id
      this.groupId = this.channelId
      const senderInfo = <Event.GuildChannelMessageSender>ev.sender
      this.sender = {
        nickname: senderInfo.nickname,
        groupCard: senderInfo.card,
        level: parseInt(senderInfo.level || "0"),
        role: senderInfo.role
      }
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
  public reply(message: DataType.SendingMessageContent, cb?: DataType.MessageEventOperationFunc, atSender?: boolean, reply?: boolean, recallingDelay?: number): void
  public reply(message: DataType.SendingMessageContent, cb?: DataType.MessageEventOperationFunc, atSender?: boolean, reply?: boolean, recallingDelay?: number, retryingCount?: number): void
  public reply(message: DataType.SendingMessageContent, cb?: DataType.MessageEventOperationFunc, atSender: boolean = false, reply: boolean = false, recallingDelay?: number, retryingCount?: number): void {
    const msg = MessageUtils.transferMessageSendingParameter(message)
    
    if (atSender && this.messageType == EventEnum.MessageType.group) {
      msg.unshift(new MsgSegment.At(this.userId).toObject(), new MsgSegment.Text(" ").toObject())
    }
    if (reply) {
      msg.unshift(new MsgSegment.Reply(this.messageId).toObject())
    }
    
    if (this.messageType == EventEnum.MessageType.guild) {
      const params: ConnectionContent.Params.SendGuildChannelMsg = {
        guild_id: this.guildId!, // 因数字ID过长，OpenShamrock的代码中，实际使用字符串
        channel_id: this.channelId!,
        message: msg,
        auto_escape: true
      }
      if (recallingDelay) {
        params.recall_duration = recallingDelay
      }
      if (retryingCount) {
        params.retry_cnt = retryingCount
      }
      
      this.client.send(ConnectionEnum.Action.sendGuildChannelMsg, params, cb)
    }
    else {
      const params: ConnectionContent.Params.SendMsg = {
        message_type: this.messageType,
        group_id: this.groupId,
        user_id: this.userId,
        message: msg,
        auto_escape: true
      }
      if (recallingDelay) {
        params.recall_duration = recallingDelay
      }
      
      this.client.send(ConnectionEnum.Action.sendMsg, params, cb)
    }
  }

  public recall(): void
  public recall(cb?: DataType.ResponseFunction<null>): void {
    this.client.send(ConnectionEnum.Action.deleteMsg, {
      message_id: this.messageId
    }, cb)
  }

  public kickSender(reject?: boolean): void
  public kickSender(reject: boolean = false, cb?: DataType.ResponseFunction<null>): void {
    this.client.send(ConnectionEnum.Action.setGroupKick, {
      group_id: this.groupId,
      user_id: this.userId,
      reject_add_request: reject
    }, cb)
  }

  public muteSender(duration: number): void
  public muteSender(duration: number, cb?: DataType.ResponseFunction<null>): void {
    this.client.send(ConnectionEnum.Action.setGroupBan, {
      group_id: this.groupId,
      user_id: this.userId,
      duration
    }, cb)
  }
}