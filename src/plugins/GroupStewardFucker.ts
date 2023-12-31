import { Plugin } from "../processors/Plugin"
import { EventEnum, ConnectionEnum } from "../types/enums"
import type { ConnectionContent } from "../types/connectionContent"
import type { GroupRecall } from "../events/NoticeEvent"
import { MessageUtils } from "../tools/MessageUtils"
import MessageSegment from "../events/messages/MessageSegment"
import { Logger } from "../tools/Logger"

export default class GroupStewardFucker extends Plugin {
  name: string = "Q群管家反制"
  description: string = "尝试对Q群管家的行为进行反制。\n重新发出被Q群管家撤回的消息"
  instruction: string = "无"
  version: string = "1.0.0"

  constructor() {
    super();
    this.logger.setPrefix("Q群管家反制")

    this.onNotice(EventEnum.NoticeType.groupRecall, event => {
      const ev = <GroupRecall>event
    
      if (ev.operatorId == 2854196310) {
        this.logger.info("检测到消息被Q群管家撤回")
      
        ev.conn!.send(ConnectionEnum.Action.sendGroupForwardMsg, {
          group_id: ev.groupId,
          messages: [
            {
              type: "node",
              data: {
                name: "信息",
                content: MessageUtils.segmentsToObject([new MessageSegment.Text(`检测到“${ev.conn!.getGroup(ev.groupId)!.members[ev.userId].viewedName}”（${ev.userId}）发送的消息“${ev.messageId}”被Q群管家撤回，以下为原始消息内容：`)])
              }
            },
            {
              type: "node",
              data: {
                id: ev.messageId.toString()
              }
            }
          ]
        })
      }
    })
  }
}