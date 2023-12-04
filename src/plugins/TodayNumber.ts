import type { DataType } from "src/types/dataType";
import { Plugin } from "../processors/Plugin";
import type { ConnectionContent } from "src/types/connectionContent";
import MessageSegment from "../events/messages/MessageSegment";
import { Utils } from "../tools/Utils";

export default class TodayNumber extends Plugin {
  name: string = "今日数字"
  description: string = "今日数字"
  instruction: string = "命令：今日数字、jrsz、todaynumber"
  version: string = "1.0.0"

  constructor() {
    super();

    let numbers: Record<string, number> = {}
    setInterval(() => numbers = {}, 863990000)

    const handle: DataType.ListenedCommandFunc = ev => {
      const id: string = ev.userId.toString()
      if (!Object.hasOwn(numbers, id)) {
        numbers[id] = Utils.randomInt(0, 100)
      }
      ev.quickReply([new MessageSegment.At(ev.userId), new MessageSegment.Text(` 今天的数字是：${numbers[id]}`)])
    }

    this.onCommand("今日数字", handle, -1)
    this.onCommand("jrsz", handle, -1)
    this.onCommand("todaynumber", handle, -1)
  }
}