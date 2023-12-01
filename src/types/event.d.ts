import type { MessageSegment } from "./message"

export namespace Event {
  enum EventType {
    message = "message",
    messageSent = "message_sent",
    notice = "notice",
    request = "request"
  }
  enum MessageType {
    private = "private",
    group = "group"
  }
  enum MessageSubType {
    friend = "friend",
    normal = "normal",
    anonymous = "anonymous",
    group = "group",
    groupSelf = "group_self",
    notice = "notice"
  }
  enum NoticeType {
    groupUpload = "group_upload",
    groupAdmin = "group_admin",
    groupDecrease = "group_decrease",
    groupIncrease = "group_increase",
    groupBan = "group_ban",
    groupRecall = "group_recall",
    groupCard = "group_card",
    essence = "essence",

    friendAdd = "friend_add",
    friendRecall = "friend_recall",
    offlineFile = "offline_file",
    clientStatus = "client_status",

    notify = "notify"
  }
  enum NotifySubType {
    honor = "honor",
    poke = "poke",
    luckyKing = "lucky_king",
    title = "title"
  }
  enum RequestType {
    friend = "friend",
    group = "group"
  }
  
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
    post_type: EventType
  }
  interface Message extends Reported {
    message_type: MessageType
    sub_type: MessageSubType
    message_id: number
    user_id: number
    message: MessageSegment[]
    raw_message: string
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

  type Notice = unknown
  type Request = unknown
  type Unknown = Reported
}