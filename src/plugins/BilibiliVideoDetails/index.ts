import MessageSegment, { type Segment } from "../../events/messages/MessageSegment";
import { Plugin } from "../../processors/Plugin"
import { Logger } from "../../tools/Logger";
import { MessageEvent } from "../../events/MessageEvent";
import { Api } from "./interfaces";
import https from "node:https"
import { Tools } from "./tools";
import AppMessage from "../../events/messages/AppMessage";
import type { ApiContent } from "./types/ApiContent";

export default class BilibiliVideoDetails extends Plugin {
  public readonly name: string = "哔哩哔哩视频详情获取";
  public readonly description: string = "在检测到哔哩哔哩视频分享链接与分享卡片时，获取并发送该视频的详情信息。";
  public readonly instruction: string = "发送哔哩哔哩视频短链接、普通链接或分享卡片";
  public readonly version: string = "1.0.0";

  private api: Api = new Api()
  
  constructor() {
    super();
    this.logger.setPrefix("哔哩哔哩视频详情")

    this.ev.on("init", () => {
      this.api.getWbiKey()  
    })

    const sendMessage = (ev: MessageEvent, data: ApiContent.Response.VideoDetails) => {
      const message: Segment[] = [
        new MessageSegment.Text(`====哔哩哔哩=视频解析====\n`),
        new MessageSegment.Image("", data.pic),
        new MessageSegment.Text(`\n${data.copyright == 1 ? "原创视频" : "转载视频"}
标题：${data.title}
投稿时间：${Tools.formatSecondTimestamp(data.ctime)}
发布时间：${Tools.formatSecondTimestamp(data.pubdate)}
时长：${Tools.formatSeconds(data.duration)}
UP主：${data.owner.name}  ID：${data.owner.mid}
AVID：av${data.aid}  BVID：${data.bvid}

简介：
${data.desc}

👍${data.stat.like}  📽${data.stat.view}
🪙${data.stat.coin}  🗨${data.stat.reply}
🎉${data.stat.share}  📂${data.stat.favorite}

`)
      ]
      ev.reply(message)
    }
    const getVideoDetails = (ev: MessageEvent, link: string): void => {
      if (link.includes("bilibili.com")) {
        const maybeId = (/av\d*|BV[1-9a-z]{10}/gi).exec(link)
        if (!maybeId) {
          return
        }
        const id = maybeId[0]

        this.logger.info("获取到视频ID：" + id)

        this.api.videoDetailsInfo(id, !id.startsWith("av"), result => {
          if (result.code != 0) {
            return
          }
          sendMessage(ev, result.data)
        })
      }
      else if (link.includes("b23.tv")) {
        
        this.logger.info(`正在获取短链接“${link}”的真实链接`)
        this.resolveShortLink(link, (realLink) => getVideoDetails(ev, realLink))
        return
      }
    }
    const processMessage = (ev: MessageEvent): void => {
      const message = ev.message[0]
      if (message instanceof MessageSegment.Text) {
        getVideoDetails(ev, message.text)
      }
      else if (message instanceof AppMessage.BilibiliVideoShare) {
        getVideoDetails(ev, message.url)
      }
    }

    this.onMessage(/((www\.|m\.)?bilibili\.com|b23\.tv)\/.*/, processMessage, [new MessageSegment.Json(undefined)])
  }

  private resolveShortLink(link: string, cb: (link: string) => void) {
    this.api.get(link, undefined, false, (_, res) => {
      if (res.statusCode?.toString().startsWith("3")) {
        cb(res.headers.location!)
      }
      else {
        this.logger.error("获取短链接的真实链接时，返回的状态码不是301或302跳转")
      }
    }, err => {
      this.logger.error("获取短链接的真实链接时出现错误")
      this.logger.error(link)
    }, false)
  }
}