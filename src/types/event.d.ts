import type { MessageSegment } from "./message"
import { EventEnum, MessageSegmentEnum } from "./enums"

export namespace Event {
  interface PrivateMessageSender {
    user_id: number
    nickname: string
  }
  interface GroupMessageSender extends PrivateMessageSender {
    card: string
    level: string
    role: string
    title: string
  }
  type MessageSender = PrivateMessageSender | GroupMessageSender

  interface Reported {
    time: number
    self_id: number
    post_type: EventEnum.EventType
  }
  interface Message extends Reported {
    message_type: EventEnum.MessageType
    sub_type: EventEnum.MessageSubType
    message_id: number
    user_id: number
    message: MessageSegment.Segment[]
    raw_message: string
    temp_source: EventEnum.MessageTempSource
    font: number
    sender: MessageSender
    group_id: number
    target_id: number
    peer_id: number
  }
  interface MessageQuickReply {
    reply: string
    auto_escape: boolean
    auto_reply: boolean
  }
  interface MessageQuickOperation {
    reply: string
    auto_escape: boolean
    at_sender: boolean
    delete: boolean
    kick: boolean
    ban: boolean
    ban_duration: number
  }
  interface PrivateRecall extends Reported {
    user_id: number
    operator_id: number
    message_id: number
  }
  interface GroupRecall extends PrivateRecall {
    group_id: number
  }
  interface GroupMemberIncrease extends Reported {
    group_id: number
    user_id: number
    operator_id: number
    sub_type: "approve" | "invite"
  }
  interface GroupMemberDecrease extends Reported {
    group_id: number
    user_id: number
    operator_id: number
    sub_type: "leave" | "kick" | "kick_me"
  }
  interface GroupAdminChange extends Reported {
    group_id: number
    user_id: number
    sub_type: "set" | "unset"
  }
  interface PrivateFileMessage {
    id: string
    name: string
    size: number
    url: string
    sub_id: string
    exppire: number
  }
  interface PrivateFileUpload extends Reported {
    user_id: number
    sender: number
    private_file: PrivateFileMessage
  }
  interface GroupFileMessage {
    id: string
    name: string
    size: number
    busid: number
    url: string
  }
  interface GroupFileUpload extends Reported {
    group_id: number
    user_id: number
    file: GroupFileMessage
  }
  interface GroupBan extends Reported {
    group_id: number
    user_id: number
    operator_id: number
    duration: number
    sub_type: "ban" | "lift_ban"
  }
  interface GroupCardChange extends Reported {
    group_id: number
    user_id: number
    card_new: string
    card_old: string
  }
  interface Essence extends Reported {
    group_id: number
    sender_id: number
    operator_id: number
    message_id: number
    sub_type: "add" | "delete"
  }
  interface ClientStatusMessage {}
  interface ClientStatus extends Reported {
    client: ClientStatusMessage
    online: boolean
  }
  interface Poke extends Reported {
    group_id: number
    sender_id: number
    user_id: number
    target_id: number
  }
  interface LuckyKing extends Reported {
    group_id: number
    user_id: number
    target_id: number
  }
  interface Honor extends Reported {
    group_id: number
    user_id: number
    honor_type: string
  }
  interface Title extends Reported {
    group_id: number
    user_id: number
    title: string
  }
  interface FriendAdd extends Reported {
    user_id: number
  }
  interface OffileFileMessage {
    name: string
    size: number
    url: string
  }
  interface OfflineFile extends Reported {
    user_id: number
    file: OffileFileMessage
  }
  interface FriendRequest extends Reported {
    user_id: number
    comment: string
    flag: string
  }
  interface FriendRequestQuickOperation {
    approve: boolean
    remark: string
  }
  interface GroupRequest extends Reported {
    group_id: number
    user_id: number
    comment: string
    flag: string
    sub_type: "add" | "invite"
  }
  interface GroupRequestQuickOperation {
    approve: boolean
    reason: string
  }

  interface MetaEvent extends Reported {
    meta_event_type: EventEnum.MetaEventType
    sub_type: EventEnum.MetaEventSubType
    interval: number
    status: {
      self: {
        platform: string
        user_id: number
      }
      online: boolean
      good: boolean
      "qq.status": string
    }
  }

  type Notice = PrivateRecall | GroupRecall | GroupMemberIncrease | GroupMemberDecrease | GroupAdminChange | 
  GroupFileUpload | PrivateFileUpload | GroupBan | GroupCardChange | FriendAdd | OfflineFile | Title | 
  Essence | ClientStatus | Poke | LuckyKing | Honor
  type Request = FriendRequest | GroupRequest
  type Operation = MessageQuickOperation | MessageQuickReply | GroupRequestQuickOperation | FriendRequestQuickOperation
  type Unknown = Reported
}