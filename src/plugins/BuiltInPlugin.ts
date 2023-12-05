import { ConnectionEnum } from "../types/enums";
import { Plugin } from "../processors/Plugin";
import type { ConnectionContent } from "src/types/connectionContent";
import MessageSegment from "../events/messages/MessageSegment";

export default class BuiltInPlugin extends Plugin {
  name: string = "内置插件"
  description: string = "内置插件"
  instruction: string = "内置插件"
  version: string = "1.0.0"

  constructor() {
    super();

    this.onMessage("", (ev, state) => {
      console.log(`接收到信息：${ev.raw} 发送者：${ev.userId}`)
    }, 100)
    this.onCommand("", (ev, state, args) => {
      console.log(`接收到命令：${ev.raw} 发送者：${ev.userId}`)
    }, 100)

    this.onCommand("echo", (ev, state, args) => {
      ev.quickReply(args.join(" "))
    }, -1)
  }
}