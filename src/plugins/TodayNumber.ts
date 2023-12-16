import type { DataType } from "src/types/dataType";
import { Plugin } from "../processors/Plugin";
import type { ConnectionContent } from "src/types/connectionContent";
import MessageSegment from "../events/messages/MessageSegment";
import { Utils } from "../tools/Utils";
import { Logger } from "../tools/Logger";

export default class TodayNumber extends Plugin {
  name: string = "今日数字"
  description: string = "今日数字"
  instruction: string = "命令：今日数字、jrsz、todaynumber"
  version: string = "1.0.0"
  logPrefix: string = "今日数字"

  constructor() {
    super();
    this.logger = new Logger(this.logPrefix)

    let numbers: Record<number, number> = {}
    setInterval(() => numbers = {}, 863990000)

    const handle: DataType.ListenedCommandFunc = ev => {
      const id = ev.userId
      if (!Object.hasOwn(numbers, id)) {
        numbers[id] = Utils.randomInt(1, 100)
      }
      ev.quickReply([new MessageSegment.At(ev.userId), new MessageSegment.Text(` 今天的数字是：${numbers[id]}`)])
    }

    this.onCommand("今日数字", handle, ["jrsz", "todaynumber"])
  }
}