import { EventEnum, ListenerEnum } from "../types/enums";
import { Plugin } from "../processors/Plugin";
import type { ConnectionContent } from "src/types/connectionContent";
import MessageSegment from "../events/messages/MessageSegment";
import type { Event } from "src/events/Event";
import type { MessageEvent } from "src/events/MessageEvent";
import { MessageUtils } from "../tools/MessageUtils";

export default class BuiltInPlugin extends Plugin {
  name: string = "内置插件"
  description: string = "内置插件"
  instruction: string = "内置插件"
  version: string = "1.0.0"

  constructor() {
    super();

    function reportEvent(type: string, ev: MessageEvent) {
      if (ev.messageType == EventEnum.MessageType.group) {
        const group = ev.conn!.getGroup(ev.groupId!)
        const member = group.members[ev.userId]
        console.log(`接收到${type}：${ev.raw} 来自群聊：${group.name}（${ev.groupId}） 发送者：${member.viewedName}（${ev.userId}）`)
      }
      else if (ev.messageType == EventEnum.MessageType.private) {
        const friend = ev.conn!.getFriend(ev.userId)
        console.log(`接收到${type}：${ev.raw} 来自私聊 发送者：${friend.viewedName}（${ev.userId}）`)
      }
    }

    this.onMessage("", ev => reportEvent("消息", ev), [], 999)
    this.onCommand("", ev => reportEvent("命令", ev), [], 999)

    this.onCommand("echo", (ev, state, args) => {
      ev.quickReply(args.join(" "))
    })
    this.onCommand("throw", (ev) => {
      throw new Error("手动抛出错误")
    })
    this.onCommand("conversation", (ev, state) => {
      console.log("Start Conversation:", ev.userId)
      state.key = "value"
      console.log("State:", state)
    }, undefined, undefined, EventEnum.MessageType.private).receive("needToStore", (ev, state, queue) => {
      state.needToStore = ev.getPlainText()
      state.shouldBeSkipped = true
      console.log("Receiver 0 Event:", ev)
      console.log("Receiver 0 State:", state)
      return ListenerEnum.ReceiverReturn.continue
    }).receive("shouldBeSkipped", () => {
      console.log("Receiver 1 Should Be Skipped")
    }).receive("shouldBeKeepExceptUserSendStop", (ev, state, queue) => {
        if (MessageUtils.matchMessage(ev.getPlainText(), "stop", true)) {
          return ListenerEnum.ReceiverReturn.finish
        }
        console.log("Receiver 2 Keeps Listening Until User Sending Stop")
        return ListenerEnum.ReceiverReturn.keep
    })
  }
}