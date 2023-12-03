import { ConnectionEnum } from "../types/enums";
import { Plugin } from "../processors/Plugin";
import type { ConnectionContent } from "src/types/connectionContent";
import MessageSegment from "../events/messages/MessageSegment";

export default class BuiltInPlugin extends Plugin {
  name: string = "内置插件"
  description: string = "内置插件"
  instruction: string = "没有帮助信息"
  version: string = "1.0.0"

  constructor() {
    super();

    this.onMessage("", (ev, state) => {
      console.log(`接收到信息：${ev.raw} 发送者：${ev.userId}`)
    }, 100, false)
    this.onCommand("", (ev, state, args) => {
      console.log(`接收到命令：${ev.raw} 发送者：${ev.userId}`)
    }, 100)

    this.onCommand("echo", (ev, state, args) => {
      ev.conn!.send(ConnectionEnum.Action.sendMsg, <ConnectionContent.Params.SendMsg>{
        message_type: ev.messageType,
        group_id: ev.groupId,
        user_id: ev.userId,
        message: new MessageSegment.Text(`回显字符串：${args[0] ?? ""}`).toObject()
      })
    })
  }
}