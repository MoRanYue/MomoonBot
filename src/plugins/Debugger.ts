import { ListenerEnum } from "../types/enums";
import config from "../config";
import { Plugin } from "../processors/Plugin";
import { Utils } from "../tools/Utils";
import { ActionFailedError } from "../exceptions/exceptions";

export default class Debugger extends Plugin {
  public name: string = "调试器";
  public description: string = "用于对Momoon Bot进行调试";
  public instruction: string = "需要在配置文件中开启调试模式。\n命令：testApi";
  public version: string = "1";

  constructor() {
    super()
    this.logger.setPrefix("调试器")

    if (!config.getConfig().log.debug) {
      this.logger.failure("未启用调试模式，调试器将禁用")
      return
    }

    this.onCommand("testApi", (ev, _, args) => {
      if (args.length == 0) {
        ev.reply("需要提供接口\n命令规则：testApi <接口>[ <JSON数据>]")
        return
      }

      const action = args.shift()!
      const data = args.join(" ")
      this.logger.debug("正在调用接口：" + action)
      this.logger.debug("数据：" + (data ?? "空"))
      try {
        ev.client.send(action, data, (res: any) => {
          ev.reply(`返回数据：\n${Utils.dataToJson(res, 2)}`)
        })
      }
      catch (err) {
        if (err instanceof ActionFailedError) {
          ev.reply(`动作请求失败\n动作：${err.action}\n返回代码：${err.code}\n是HTTP返回代码：${err.isHttpError}\n原因：${err.reason}`)
        }
      }
    }, undefined, 999, undefined, ListenerEnum.Permission.superuser)

    this.logger.success("调试器已启用")
  }

}