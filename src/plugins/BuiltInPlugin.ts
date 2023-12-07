import { ConnectionEnum, EventEnum } from "../types/enums";
import { Plugin } from "../processors/Plugin";
import { launcher } from "../app";
import type { ConnectionContent } from "src/types/connectionContent";
import MessageSegment from "../events/messages/MessageSegment";
import type { Event } from "src/events/Event";
import type { MessageEvent } from "src/events/MessageEvent";

export default class BuiltInPlugin extends Plugin {
  name: string = "内置插件"
  description: string = "内置插件"
  instruction: string = "内置插件"
  version: string = "1.0.0"

  constructor() {
    super();

    function reportEvent(ev: MessageEvent) {
      if (ev.messageType = EventEnum.MessageType.group) {
        const group = launcher.getGroups()![ev.groupId!]
        const member = group.members[ev.userId]
        console.log(`接收到命令：${ev.raw} 来自群聊：${group.name}（${ev.groupId}） 发送者：${member.viewedName}（${ev.userId}）`)
      }
      else {
        const friend = launcher.getFriends()![ev.userId]
        console.log(`接收到命令：${ev.raw} 来自私聊 发送者：${friend.viewedName}（${ev.userId}）`)
      }
    }

    this.onMessage("", reportEvent, 100)
    this.onCommand("", reportEvent, 100)

    this.onCommand("echo", (ev, state, args) => {
      ev.quickReply(args.join(" "))
    }, -1)
  }
}