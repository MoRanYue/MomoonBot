import { EventEnum } from "../types/enums";
import { Event as Ev } from "./Event";
import type { Event } from "src/types/event";
import type { Client } from "src/connections/Client";

export class RequestEvent extends Ev {
  public client: Client;
  public selfId: number;
  public time: number;
  public requestType: EventEnum.RequestType

  constructor(ev: Event.Request, client: Client) {
    super();

    this.checkEventType(ev, EventEnum.EventType.request)

    this.client = client
    this.selfId = ev.self_id
    this.time = ev.time
    this.requestType = ev.request_type
  }

  public static fromObject(ev: Event.ReportedRequest, client: Client): RequestEvent {
    switch (ev.request_type) {
      case EventEnum.RequestType.friend:
        return new FriendRequest(<Event.FriendRequest>ev, client)

      case EventEnum.RequestType.group:
        return new GroupRequest(<Event.GroupRequest>ev, client)
    
      default:
        return new Unknown(ev, client)
    }
  }
}

export class FriendRequest extends RequestEvent {
  public userId: number
  public userUid: string
  public comment: string
  public flag: string

  constructor(ev: Event.FriendRequest, client: Client) {
    super(ev, client);

    this.userId = ev.user_id
    this.userUid = ev.user_uid
    this.comment = ev.comment
    this.flag = ev.flag
  }
}

export class GroupRequest extends RequestEvent {
  public groupId: number
  public userId: number
  public userUid: string
  public comment: string
  public flag: string
  public joiningType: "add" | "invite"

  constructor(ev: Event.GroupRequest, client: Client) {
    super(ev, client);

    this.groupId = ev.group_id
    this.userId = ev.user_id
    this.userUid = ev.user_uid
    this.comment = ev.comment
    this.flag = ev.flag
    this.joiningType = ev.sub_type
  }
}

export class Unknown extends RequestEvent {
  public data: object

  constructor(ev: Event.ReportedRequest, client: Client) {
    super(ev, client);

    this.data = ev
  }
}