import type { Connection } from "src/connections/Connection";
import { Event as Ev } from "./Event";
import type { Event } from "src/types/event";
import { EventEnum } from "../types/enums";

export class NoticeEvent extends Ev {
  public conn: Connection;
  public selfId: number;
  public time: number;
  public noticeType: EventEnum.NoticeType
  public notifyType?: EventEnum.NotifySubType

  constructor(ev: Event.Notice, conn: Connection) {
    super();

    this.checkEventType(ev, EventEnum.EventType.notice)

    this.conn = conn
    this.selfId = ev.self_id
    this.time = ev.time
    this.noticeType = ev.notice_type
    this.notifyType = (<Event.ReportedSystemNotice>ev).sub_type
  }

  public static fromObject(ev: Event.ReportedNotice, conn: Connection): NoticeEvent {
    switch (ev.notice_type) {
      case EventEnum.NoticeType.groupRecall:
        return new GroupRecall(<Event.GroupRecall>ev, conn)

      case EventEnum.NoticeType.friendRecall:
        return new PrivateRecall(<Event.PrivateRecall>ev, conn)

      case EventEnum.NoticeType.groupIncrease:
        return new GroupMemberIncrease(<Event.GroupMemberIncrease>ev, conn)

      case EventEnum.NoticeType.groupDecrease:
        return new GroupMemberDecrease(<Event.GroupMemberDecrease>ev, conn)

      case EventEnum.NoticeType.clientStatus:
        return new ClientStatus(<Event.ClientStatus>ev, conn)

      case EventEnum.NoticeType.essence:
        return new Essence(<Event.Essence>ev, conn)

      case EventEnum.NoticeType.friendAdd:
        return new FriendAdd(<Event.FriendAdd>ev, conn)

      case EventEnum.NoticeType.groupAdmin:
        return new GroupAdminChange(<Event.GroupAdminChange>ev, conn)

      case EventEnum.NoticeType.groupBan:
        return new GroupBan(<Event.GroupBan>ev, conn)

      case EventEnum.NoticeType.groupCard:
        return new GroupCardChange(<Event.GroupCardChange>ev, conn)

      case EventEnum.NoticeType.groupUpload:
        return new GroupFileUpload(<Event.GroupFileUpload>ev, conn)

      case EventEnum.NoticeType.notify:
        switch ((<Event.ReportedSystemNotice>ev).sub_type) {
          case EventEnum.NotifySubType.poke:
            return new Poke(<Event.Poke>ev, conn)

          case EventEnum.NotifySubType.luckyKing:
            return new LuckyKing(<Event.LuckyKing>ev, conn)

          case EventEnum.NotifySubType.honor:
            return new Honor(<Event.Honor>ev, conn)

          case EventEnum.NotifySubType.title:
            return new Title(<Event.Title>ev, conn)

          default:
            return new Unknown(ev, conn)
        }
    
      default:
        return new Unknown(ev, conn)
    }
  }
}

export class Title extends NoticeEvent {
  public userId: number
  public groupId: number
  public title: string

  constructor(ev: Event.Title, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.groupId = ev.group_id
    this.title = ev.title
  }
}
export class Honor extends NoticeEvent {
  public userId: number
  public groupId: number
  public honorType: string

  constructor(ev: Event.Honor, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.groupId = ev.group_id
    this.honorType = ev.honor_type
  }
}
export class LuckyKing extends NoticeEvent {
  public userId: number
  public targetId: number
  public groupId: number

  constructor(ev: Event.LuckyKing, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.groupId = ev.group_id
    this.targetId = ev.target_id
  }
}
export class Poke extends NoticeEvent {
  public userId: number
  public targetId: number
  public groupId: number
  public action: string
  public iconUrl: string
  public suffix: string

  constructor(ev: Event.Poke, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.groupId = ev.group_id
    this.targetId = ev.target_id
    this.action = ev.poke_detail.action
    this.iconUrl = ev.poke_detail.action_img_url
    this.suffix = ev.poke_detail.suffix
  }
}
export class ClientStatus extends NoticeEvent {
  public online: boolean
  public client: object

  constructor(ev: Event.ClientStatus, conn: Connection) {
    super(ev, conn);

    this.online = ev.online
    this.client = ev.client
  }
}
export class Essence extends NoticeEvent {
  public userId: number
  public operatorId: number
  public groupId: number
  public messageId: number
  public operation: "add" | "delete"

  constructor(ev: Event.Essence, conn: Connection) {
    super(ev, conn);

    this.userId = ev.sender_id
    this.operatorId = ev.operator_id
    this.groupId = ev.group_id
    this.messageId = ev.message_id
    this.operation = ev.sub_type
  }
}
export class OfflineFile extends NoticeEvent {
  public userId: number
  public name: string
  public size: number
  public url: string

  constructor(ev: Event.OfflineFile, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.name = ev.file.name
    this.size = ev.file.size
    this.url = ev.file.url
  }
}
export class FriendAdd extends NoticeEvent {
  public userId: number

  constructor(ev: Event.FriendAdd, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
  }
}
export class GroupCardChange extends NoticeEvent {
  public userId: number
  public groupId: number
  public old: string
  public new: string

  constructor(ev: Event.GroupCardChange, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.groupId = ev.group_id
    this.old = ev.card_old
    this.new = ev.card_new
  }
}
export class GroupBan extends NoticeEvent {
  public userId: number
  public operatorId: number
  public groupId: number
  public duration: number
  public status: "ban" | "lift_ban"

  constructor(ev: Event.GroupBan, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.operatorId = ev.operator_id
    this.groupId = ev.group_id
    this.duration = ev.duration
    this.status = ev.sub_type
  }
}
export class PrivateFileUpload extends NoticeEvent {
  public userId: number
  public id: string
  public name: string
  public size: number
  public url: string
  public expires: number

  constructor(ev: Event.PrivateFileUpload, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.id = ev.private_file.id
    this.name = ev.private_file.name
    this.size = ev.private_file.size
    this.url = ev.private_file.url
    this.expires = ev.private_file.exppire
  }
}
export class GroupFileUpload extends NoticeEvent {
  public userId: number
  public groupId: number
  public id: string
  public name: string
  public size: number
  public busid: number
  public url: string

  constructor(ev: Event.GroupFileUpload, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.groupId = ev.group_id
    this.id = ev.file.id
    this.name = ev.file.name
    this.size = ev.file.size
    this.busid = ev.file.busid
    this.url = ev.file.url
  }
}
export class GroupAdminChange extends NoticeEvent {
  public userId: number
  public groupId: number
  public status: "set" | "unset"

  constructor(ev: Event.GroupAdminChange, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.groupId = ev.group_id
    this.status = ev.sub_type
  }
}
export class GroupMemberDecrease extends NoticeEvent {
  public userId: number
  public operatorId: number
  public groupId: number
  public reason: "leave" | "kick" | "kick_me"

  constructor(ev: Event.GroupMemberDecrease, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.operatorId = ev.operator_id
    this.groupId = ev.group_id
    this.reason = ev.sub_type
  }
}
export class GroupMemberIncrease extends NoticeEvent {
  public userId: number
  public operatorId: number
  public groupId: number
  public entry: "approve" | "invite"

  constructor(ev: Event.GroupMemberIncrease, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.operatorId = ev.operator_id
    this.groupId = ev.group_id
    this.entry = ev.sub_type
  }
}
export class PrivateRecall extends NoticeEvent {
  public userId: number
  public operatorId: number
  public messageId: number

  constructor(ev: Event.PrivateRecall, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.operatorId = ev.operator_id
    this.messageId = ev.message_id
  }
}
export class GroupRecall extends NoticeEvent {
  public userId: number
  public operatorId: number
  public groupId: number
  public messageId: number

  constructor(ev: Event.GroupRecall, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.operatorId = ev.operator_id
    this.messageId = ev.message_id
    this.groupId = ev.group_id
  }
}
export class Unknown extends NoticeEvent {
  public data: object

  constructor(ev: Event.ReportedNotice, conn: Connection) {
    super(ev, conn);

    this.data = ev
  }
}

export default {
  NoticeEvent, 
  PrivateRecall, GroupRecall, GroupMemberIncrease, GroupMemberDecrease, 
  GroupAdminChange, GroupCardChange, GroupBan, GroupFileUpload, 
  PrivateFileUpload, OfflineFile, ClientStatus, FriendAdd, Essence, 
  Poke, LuckyKing, Honor, Title
}