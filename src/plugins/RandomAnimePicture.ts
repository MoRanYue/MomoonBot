import MessageSegment, { Segment } from "../events/messages/MessageSegment";
import type { MessageEvent } from "src/events/MessageEvent";
import { Plugin } from "../processors/Plugin";
import { ConnectionEnum, EventEnum, ListenerEnum } from "../types/enums";
import { Utils } from "../tools/Utils";
import axios from "axios";
import path from "node:path"
import { FileUtils } from "../tools/FileUtils";
import type { ConnectionContent } from "src/types/connectionContent";
import { MessageUtils } from "../tools/MessageUtils";
import type { IncomingMessage } from "node:http";
import type { Client } from "src/connections/Client";

export default class RandomAnimePicture extends Plugin {
  readonly name: string = "随机动漫图片";
  readonly description: string = "调用多个 API 来获取动漫图片";
  readonly instruction: string = "命令：randomPic、rdpic、anime";
  readonly version: string = "1.0.0";

  readonly dataFolder: string = "./data/anime/"
  readonly apiServers: ((client: Client, msgType: EventEnum.MessageType, userId: number, groupId?: number, num?: number) => void)[] = [
    (client: Client, msgType: EventEnum.MessageType, userId: number, groupId?: number, num: number = 1): void => {
      const apis = [
        "https://t.mwm.moe/moe",
        "https://t.mwm.moe/ys",
        "https://t.mwm.moe/ysmp",
        "https://t.mwm.moe/pc",
        "https://t.mwm.moe/mp",
        "https://t.mwm.moe/moemp",

        "https://api.yimian.xyz/img?type=moe",

        "https://api.vvhan.com/api/acgimg",

        "https://api.dujin.org/pic",
        "https://api.dujin.org/pic/yuanshen",

        "https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E8%B5%9B%E9%A9%AC%E5%A8%98%E6%A8%AA%E5%B1%8F%E7%B3%BB%E5%88%971",
        "https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E4%B8%BA%E7%BE%8E%E5%A5%BD%E4%B8%96%E7%95%8C%E7%8C%AE%E4%B8%8A%E7%A5%9D%E7%A6%8F%E6%A8%AA%E5%B1%8F%E7%B3%BB%E5%88%971",
        "https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E5%8E%9F%E7%A5%9E%E6%A8%AA%E5%B1%8F%E7%B3%BB%E5%88%971",
        "https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E6%98%8E%E6%97%A5%E6%96%B9%E8%88%9F1",
        "https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E5%B0%91%E5%A5%B3%E5%89%8D%E7%BA%BF1",
        "https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=P%E7%AB%99%E7%B3%BB%E5%88%973",
        "https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=P%E7%AB%99%E7%B3%BB%E5%88%974",
        "https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=CG%E7%B3%BB%E5%88%971",

        "https://image.anosu.top/pixiv/direct?r18=0&proxy=i.pixiv.re&size=original",

        "https://api.oick.cn/api/random?type=pc",
        "https://api.oick.cn/api/random?type=pe",

        "https://www.loliapi.com/acg/pc",
        "https://www.loliapi.com/acg/pe",
        "https://www.loliapi.com/bg",

        "https://tuapi.eees.cc/api.php?type=302&px=m&category=dongman",
        "https://tuapi.eees.cc/api.php?type=302&px=pc&category=dongman",

        "https://api.likepoems.com/img/pc",
        "https://api.likepoems.com/img/pe",

        "https://api.suyanw.cn/api/ys",
        "https://api.suyanw.cn/api/comic",
        "https://api.suyanw.cn/api/comic2",
        "https://api.suyanw.cn/api/mao",
      ]
      const messages: ConnectionContent.Params.CustomForwardMessageNode[] = []
      let index: number = 0
      const get = () => {
        const url = Utils.randomChoice(apis)
        this.httpGet(url, (data, res) => {
          this.logger.info(`正在处理第 ${index + 1} 张图片：${url}`)
          let format = "png"
          if (Object.prototype.hasOwnProperty.call(res.headers, "Content-Type")) {
            format = res.headers["Content-Type"]!.toString().split("/").pop()!
          }

          messages.push(this.buildForwardNode([new MessageSegment.Image(data)]))
          index++
          if (index == num) {
            this.ev.emit("finishCollecting", client, msgType, userId, groupId, messages)
          }

          const stream = FileUtils.writeFileWithStream(path.join(this.dataFolder, Utils.randomChar(7) + "." + format))
          stream.write(data)
        }, (err, res) => {
          this.logger.error(`请求“${url}”时出错，正在重试`)
          this.logger.error(err)
          get()
        })
      }

      for (let i = 0; i < num; i++) {
        get()
      }
    }
  ]

  constructor() {
    super();
    this.logger.setPrefix("随机动漫图片")

    FileUtils.createFolderIfNotExists(this.dataFolder)

    this.ev.on("finishCollecting", (client: Client, msgType: EventEnum.MessageType, userId: number, groupId: number, messages: ConnectionContent.Params.CustomForwardMessageNode[]) => {
      this.logger.info("正在发送图片中")
      if (msgType == EventEnum.MessageType.group) {
        client.send(ConnectionEnum.Action.sendGroupForwardMsg, {
          group_id: groupId,
          messages
        }, data => {
          if (data.retcode != ConnectionEnum.ResponseCode.ok) {
            client.send(ConnectionEnum.Action.sendGroupMsg, {
              group_id: groupId,
              message: MessageUtils.segmentsToObject([new MessageSegment.At(userId), new MessageSegment.Text(" 消息发送失败")])
            })
          }
        })
      }
      else if (msgType == EventEnum.MessageType.private) {
        client.send(ConnectionEnum.Action.sendPrivateForwardMsg, {
          user_id: userId,
          messages
        })
      }
    })
    
    this.onCommand("randomPic", (ev, state, args) => {
      if (args.length == 1) {
        if (this.resolveCount(ev, args[0])) {
          state.count = parseInt(args[0])
          this.getPictures(ev, state.count)
          return true
        }
        return false
      }
      this.getPictures(ev)
      return true
    }, ["rdpic", "anime", "随机图片"], 1, undefined, undefined, undefined, undefined, undefined, undefined, "randomPic <数量>").receive("count", (ev, state) => {
      const count = ev.getPlainText().trim()
      if (this.resolveCount(ev, count)) {
        state.count = parseInt(count)
        this.getPictures(ev, state.count)
        return ListenerEnum.ReceiverReturn.finish
      }
      if (!Object.hasOwn(state, "retryTimes")) {
        state.retryTimes = 0
      }
      state.retryTimes++
      if (state.retryTimes >= 3) {
        return ListenerEnum.ReceiverReturn.finish
      }
      return ListenerEnum.ReceiverReturn.keep
    })
  }

  public getPictures(ev: MessageEvent, count: number = 1): void {
    ev.reply("正在获取中", undefined, true)
    Utils.randomChoice(this.apiServers)(ev.client, ev.messageType, ev.userId, ev.groupId, count)
  }

  public resolveCount(ev: MessageEvent, num: string): boolean {
    try {
      const count = parseInt(num)
      if (count < 1) {
        ev.reply([new MessageSegment.At(ev.userId), new MessageSegment.Text("1以下，是什么意思？")])
        return false
      }
      else if (count > 10) {
        ev.reply([new MessageSegment.At(ev.userId), new MessageSegment.Text("太多啦")])
        return false
      }

      return true
    }
    catch {
      ev.reply([new MessageSegment.At(ev.userId), new MessageSegment.Text("数量错误，需要指定范围为1-10的数字。")])
      return false
    }
  }

  public httpGet(target: string, cb?: (data: Buffer, res: axios.AxiosResponse) => (void | Promise<void>), catchCb?: (err: Error, res?: axios.AxiosResponse) => (void | Promise<void>)): void {
    try {
      const req = axios.get(target, {
        timeout: 20000,
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
        }
      }).then(res => {
        if (cb) {
          cb(res.data, res)
        }
      }).catch(catchCb)
    }
    catch (err) {
      if (catchCb) {
        catchCb(<Error>err)
      }
    }
  }

  public buildForwardNode(messages: Segment[]): ConnectionContent.Params.CustomForwardMessageNode {
    return {
      type: "node",
      data: {
        name: "图片",
        content: MessageUtils.segmentsToObject(messages)
      }
    }
  }
}