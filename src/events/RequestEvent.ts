import type { Connection } from "src/connections/Connection";
import { EventEnum } from "../types/enums";
import { Event as Ev } from "./Event";
import type { Event } from "src/types/event";

export class RequestEvent extends Ev {
  public conn: Connection;
  public selfId: number;
  public time: number;
  public requestType: EventEnum.RequestType

  constructor(ev: Event.Request, conn: Connection) {
    super();

    this.checkEventType(ev, EventEnum.EventType.request)

    this.conn = conn
    this.selfId = ev.self_id
    this.time = ev.time
    this.requestType = ev.request_type
  }

  public static fromObject(ev: Event.ReportedRequest, conn: Connection): RequestEvent {
    switch (ev.request_type) {
      case EventEnum.RequestType.friend:
        return new FriendRequest(<Event.FriendRequest>ev, conn)

      case EventEnum.RequestType.group:
        return new GroupRequest(<Event.GroupRequest>ev, conn)
    
      default:
        return new Unknown(ev, conn)
    }
  }
}

export class FriendRequest extends RequestEvent {
  public userId: number
  public comment: string
  public flag: string

  constructor(ev: Event.FriendRequest, conn: Connection) {
    super(ev, conn);

    this.userId = ev.user_id
    this.comment = ev.comment
    this.flag = ev.flag
  }
}

export class GroupRequest extends RequestEvent {
  public groupId: number
  public userId: number
  public comment: string
  public flag: string
  public joiningType: "add" | "invite"

  constructor(ev: Event.GroupRequest, conn: Connection) {
    super(ev, conn);

    this.groupId = ev.group_id
    this.userId = ev.user_id
    this.comment = ev.comment
    this.flag = ev.flag
    this.joiningType = ev.sub_type
  }
}

export class Unknown extends RequestEvent {
  public data: object

  constructor(ev: Event.ReportedRequest, conn: Connection) {
    super(ev, conn);

    this.data = ev
  }
}