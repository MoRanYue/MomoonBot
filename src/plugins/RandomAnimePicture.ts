import MessageSegment, { Segment } from "../events/messages/MessageSegment";
import type { MessageEvent } from "src/events/MessageEvent";
import { Plugin } from "../processors/Plugin";
import { ConnectionEnum, EventEnum, ListenerEnum } from "../types/enums";
import { Utils } from "../tools/Utils";
import http from "follow-redirects"
import path from "node:path"
import { FileUtils } from "../tools/FileUtils";
import type { ConnectionContent } from "src/types/connectionContent";
import { MessageUtils } from "../tools/MessageUtils";
import type { Connection } from "src/connections/Connection";
import url from "node:url";
import fs from "node:fs"

export default class RandomAnimePicture extends Plugin {
  readonly name: string = "随机动漫图片";
  readonly description: string = "调用多个API来获取动漫图片";
  readonly instruction: string = "randomPic、rdpic、anime";
  readonly version: string = "1.0.0";

  readonly dataFolder: string = "./data/anime/"
  readonly apiServers = [
    (conn: Connection, msgType: EventEnum.MessageType, userId: number, groupId?: number, num: number = 1): void => {
      this.httpGet(`https://api.lolicon.app/setu/v2?num=${num}&r18=0&tag=萝莉|少女|原神|GenshinImpact&size=regular&size=original`, data => {
        const result = Utils.jsonToData(data.toString("utf-8"))
        const messages: ConnectionContent.Params.CustomForwardMessageNode[] = []
        if (!result.error) {
          let i: number = 0
          for (let i = 0; i < result.data.length; i++) {
            const item: { urls: { original: string, regular: string }, title: string, ext: string, pid: number, author: string } = result.data[i];
            
            http.https.get(item.urls.regular, async res => {
              const location = path.join(this.dataFolder, item.pid.toString() + "." + item.ext)
              const stream = FileUtils.writeFileWithStream(location, "w+")

              res.pipe(stream)
              res.on("error", err => {
                if (err) {
                  console.error(`请求图片${item.urls.regular}时遇到错误`)
                  console.error(err)

                  i++
                  if (i == result.data.length) {
                    this.ev.emit("finishCollecting", conn, msgType, userId, groupId, messages)
                  }
                }
              })
              res.on("end", () => {
                fs.readFile(location, (err, data) => {
                  if (err) {
                    throw err
                  }

                  console.log(`正在准备图片“${item.urls.regular}”`)
                  const node = this.buildForwardNode([new MessageSegment.Text(`标题：${item.title}\nPixiv ID：${item.pid}\n作者：${item.author}\n原图链接：${item.urls.original}`), new MessageSegment.Image(data)])
                  messages.push(node)

                  i++
                  if (i == result.data.length) {
                    this.ev.emit("finishCollecting", conn, msgType, userId, groupId, messages)
                  }
                })
              })
            })
          }
        }
      })
    }
  ]

  constructor() {
    super();

    FileUtils.createFolderIfNotExists(this.dataFolder)

    this.ev.on("finishCollecting", (conn: Connection, msgType: EventEnum.MessageType, userId: number, groupId: number, messages: ConnectionContent.Params.CustomForwardMessageNode[]) => {
      if (msgType == EventEnum.MessageType.group) {
        conn.send(ConnectionEnum.Action.sendGroupForwardMsg, <ConnectionContent.Params.SendGroupForwardMsg>{
          group_id: groupId,
          messages
        })
      }
      else if (msgType == EventEnum.MessageType.private) {
        conn.send(ConnectionEnum.Action.sendPrivateForwardMsg, <ConnectionContent.Params.SendPrivateForwardMsg>{
          user_id: userId,
          messages
        })
      }
    })
    
    this.onCommand("randomPic", (ev, state, args) => {
      if (args.length == 1) {
        if (this.resolveCount(ev, args[0])) {
          state.count = parseInt(args[0])
          this.getPictures(ev.conn!, ev.messageType, ev.userId, ev.groupId, state.count)
          return true
        }
        return false
      }
      this.getPictures(ev.conn!, ev.messageType, ev.userId, ev.groupId)
      return true
    }, ["rdpic", "anime", "随机图片"], 1, undefined, undefined, undefined, undefined, undefined, "<COMMAND_PROMPT>randomPic <数量>").receive("count", (ev, state) => {
      const count = ev.getPlainText().trim()
      if (this.resolveCount(ev, count)) {
        state.count = parseInt(count)

        this.getPictures(ev.conn!, ev.messageType, ev.userId, ev.groupId, state.count)
        return ListenerEnum.ReceiverReturn.finish
      }
      if (!Object.hasOwn(state, "retryTimes")) {
        state.retryTimes = 0
      }
      state.retryTimes++
      if (state.retryTimes >= 3) {
        ev.quickReply("停止接收参数")
        return ListenerEnum.ReceiverReturn.finish
      }
      return ListenerEnum.ReceiverReturn.keep
    })
  }

  public getPictures(conn: Connection, msgType: EventEnum.MessageType, userId: number, groupId?: number, count: number = 1): void {
    Utils.randomChoice(this.apiServers)(conn, msgType, userId, groupId, count)
  }

  public resolveCount(ev: MessageEvent, num: string): boolean {
    try {
      const count = parseInt(num)
      if (count < 1) {
        ev.quickReply([new MessageSegment.At(ev.userId), new MessageSegment.Text("1以下，是什么意思？")])
        return false
      }
      else if (count > 10) {
        ev.quickReply([new MessageSegment.At(ev.userId), new MessageSegment.Text("太多啦")])
        return false
      }

      return true
    }
    catch {
      ev.quickReply([new MessageSegment.At(ev.userId), new MessageSegment.Text("数量错误，需要指定范围为1-10的数字。")])
      return false
    }
  }

  public httpGet(target: string, cb?: (data: Buffer) => (void | Promise<void>), catchCb?: (err: Error) => (void | Promise<void>)): void {
    http.https.get(target, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0"
      }
    }, res => {
      if (catchCb) {
        res.on("error", err => {
          if (err) {
            catchCb(err)
          }
        })
      }
      if (cb) {
        let data: string = ""
        res.on("data", chunk => data += chunk)
        res.on("end", () => cb(Buffer.from(data)))
      }
    })
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