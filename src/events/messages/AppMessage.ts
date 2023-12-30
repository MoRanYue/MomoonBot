import MsgSegment from "./MessageSegment"
import type { AppMessageContent } from "../../types/AppMessageContent"
import type { MessageSegment } from "src/types/message";
import { MessageSegmentEnum } from "../../types/enums";

class AppMessage extends MsgSegment.Json {
  declare public data: AppMessageContent.StructuredMessage<object>;
  public id: number
  public type: number
  public sendingTime: number
  public senderId: number
  public desc: string
  public tip: string
  public version: string

  constructor(data: AppMessageContent.StructuredMessage<object>) {
    super(data);

    const metaContent: Record<string, any> = data.meta
    const content = metaContent[Object.keys(metaContent)[0]]
    if (!content) {
      throw new Error("AppMessageContent.StructuredMessage<T>['meta'] 应该至少包含1个字段")
    }
    this.id = content.id
    this.type = content.app_type
    this.senderId = content.uin
    this.sendingTime = data.config.ctime
    this.desc = data.desc
    this.tip = data.prompt
    this.version = data.ver
  }
}

class BilibiliVideoShare extends AppMessage {
  declare public data: AppMessageContent.StructuredMessage<AppMessageContent.BilibiliVideoShare>;
  public url: string
  public title: string
  public preview: string

  constructor(data: AppMessageContent.StructuredMessage<AppMessageContent.BilibiliVideoShare>) {
    super(data);

    const result = data.meta.news
    this.url = result.jumpUrl
    this.title = result.desc
    this.preview = result.preview
  }
}

export default {
  AppMessage, BilibiliVideoShare
}