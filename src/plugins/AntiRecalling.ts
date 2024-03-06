import { Plugin } from "../processors/Plugin"
import { EventEnum, ConnectionEnum, MessageSegmentEnum } from "../types/enums"
import type { GroupRecall } from "../events/NoticeEvent"

export default class AntiRecalling extends Plugin {
  name: string = "防撤回"
  description: string = "重新发出群聊中被撤回的消息。"
  instruction: string = ""
  version: string = "1.0.0"

  constructor() {
    super();
    this.logger.setPrefix("防撤回")

    this.onNotice(EventEnum.NoticeType.groupRecall, event => {
      const ev = <GroupRecall>event
      const group = ev.client.groups[ev.groupId!]
      if (!group) {
        return
      }
      ev.client.send(ConnectionEnum.Action.getMsg, { message_id: ev.messageId }, data => {
        const userName: string = `${group.members[ev.userId].viewedName}（${ev.userId}）`
        if (data.data.message) {
          data.data.message.unshift({
            type: MessageSegmentEnum.SegmentType.text,
            data: {
              text: `检测到 ${userName}撤回1条消息，以下为原消息内容：\n\n`
            }
          })
          group.sendMessage(data.data.message)
          this.logger.info("已发出被 " + userName + "撤回的消息")
        }
      })
    })
  }
}