import { AppMessageEnum, MessageSegmentEnum } from "../types/enums";
import { MessageSegment } from "../types/message";
import MsgSegment, { type Segment } from "../events/messages/MessageSegment"
import type { DataType } from "src/types/dataType";
import config from "../config";
import { Utils } from "./Utils";
import AppMessage from "../events/messages/AppMessage"
import type { AppMessageContent } from "src/types/AppMessageContent";

export class MessageUtils {
  public static classify(message: MessageSegment.Segment[]) {
    const msg: Segment[] = []
    message.forEach(seg => msg.push(MessageUtils.classifyOne(seg)));
    return msg
  }

  public static classifyOne(seg: MessageSegment.Segment): Segment {
    switch (seg.type) {
      case MessageSegmentEnum.SegmentType.text:
        return MsgSegment.Text.fromObject(<MessageSegment.TextSegment>seg)

      case MessageSegmentEnum.SegmentType.image:
        return MsgSegment.Image.fromObject(<MessageSegment.ImageSegment>seg)

      case MessageSegmentEnum.SegmentType.at:
        return MsgSegment.At.fromObject(<MessageSegment.AtSegment>seg)

      case MessageSegmentEnum.SegmentType.reply:
        return MsgSegment.Reply.fromObject(<MessageSegment.ReplySegment>seg)

      case MessageSegmentEnum.SegmentType.face:
        return MsgSegment.Face.fromObject(<MessageSegment.FaceSegment>seg)

      case MessageSegmentEnum.SegmentType.marketFace:
        return MsgSegment.MarketFace.fromObject(<MessageSegment.MarketFaceSegment>seg)

      case MessageSegmentEnum.SegmentType.file:
        return MsgSegment.File.fromObject(<MessageSegment.FileSegment>seg)

      case MessageSegmentEnum.SegmentType.video:
        return MsgSegment.Video.fromObject(<MessageSegment.VideoSegment>seg)

      case MessageSegmentEnum.SegmentType.record:
        return MsgSegment.Record.fromObject(<MessageSegment.RecordSegment>seg)

      case MessageSegmentEnum.SegmentType.share:
        return MsgSegment.Share.fromObject(<MessageSegment.ShareSegment>seg)

      case MessageSegmentEnum.SegmentType.json:
        const data = Utils.jsonToData((<MessageSegment.JsonSegment>seg).data.data)
        if (data.app && data.app == AppMessageEnum.App.structuredMessage) {
          const metaContent: any = (<AppMessageContent.StructuredMessage<object>>data).meta
          if (Object.hasOwn(metaContent, "news")) {
            switch (metaContent.news.appid) {
              case AppMessageEnum.AppId.bilibiliVideoShare:
                return new AppMessage.BilibiliVideoShare(data)
            }
          }
          return new AppMessage.AppMessage(data)
        }
        return MsgSegment.Json.fromObject(data)

      case MessageSegmentEnum.SegmentType.basketball:
        return MsgSegment.Basketball.fromObject(<MessageSegment.BasketballSegment>seg)

      case MessageSegmentEnum.SegmentType.newDice:
        return MsgSegment.NewDice.fromObject(<MessageSegment.NewDiceSegment>seg)

      case MessageSegmentEnum.SegmentType.newRps:
        return MsgSegment.NewRps.fromObject(<MessageSegment.NewRpsSegment>seg)

      case MessageSegmentEnum.SegmentType.deprecatedDice:
        return MsgSegment.DeprecatedDice.fromObject(<MessageSegment.DeprecatedDiceSegment>seg)

      case MessageSegmentEnum.SegmentType.deprecatedRps:
        return MsgSegment.DeprecatedRps.fromObject(<MessageSegment.DeprecatedRpsSegment>seg)

      case MessageSegmentEnum.SegmentType.forward:
        return MsgSegment.Forward.fromObject(<MessageSegment.ForwardSegment>seg)

      case MessageSegmentEnum.SegmentType.forwardNode:
        return MsgSegment.ForwardNode.fromObject(<MessageSegment.ForwardNodeSegment>seg)

      case MessageSegmentEnum.SegmentType.gift:
        return MsgSegment.Gift.fromObject(<MessageSegment.GiftSegment>seg)

      case MessageSegmentEnum.SegmentType.location:
        return MsgSegment.Location.fromObject(<MessageSegment.LocationSegment>seg)

      case MessageSegmentEnum.SegmentType.music:
        return MsgSegment.Music.fromObject(<MessageSegment.MusicSegment | MessageSegment.CustomMusicSegment>seg)

      case MessageSegmentEnum.SegmentType.poke:
        return MsgSegment.Poke.fromObject(<MessageSegment.PokeSegment>seg)

      case MessageSegmentEnum.SegmentType.touch:
        return MsgSegment.Touch.fromObject(<MessageSegment.TouchSegment>seg)

      case MessageSegmentEnum.SegmentType.weather:
        return MsgSegment.Weather.fromObject(<MessageSegment.WeatherSegment>seg)
    
      default:
        return MsgSegment.Unknown.fromObject(seg)
    }
  }

  public static segmentsToPlainText(segments: Segment[]): string {
    let text: string = ""
    segments.forEach(seg => {
      if (seg instanceof MsgSegment.Text) {
        text += seg.text
      }
    })
    return text
  }
  public static segmentsToObject(segments: Segment[]): MessageSegment.Segment[] {
    let message: MessageSegment.Segment[] = []
    segments.forEach(seg => message.push(seg.toObject()))
    return message
  }

  public static matchMessage(message: Segment[], pattern: DataType.ListenedMessage, ignoreCase: boolean = true): boolean | never {
    if (typeof pattern == "string") {
      return MessageUtils.matchText(MessageUtils.segmentsToPlainText(message), pattern, ignoreCase)
    }
    else if (pattern instanceof RegExp) {
      return MessageUtils.matchText(MessageUtils.segmentsToPlainText(message), pattern, ignoreCase)
    }
    else if (Array.isArray(pattern)) {
      if (pattern.length == 0) {
        throw new Error("数组形式消息匹配类型的长度不可为0")
      }

      let firstItemPos: number | undefined = undefined
      let matchedItemsCount: number = 0
      for (let i = 0; i < message.length; i++) {
        const segment = message[i];
        const correspondingSegment: Segment | undefined = pattern[i - (firstItemPos ?? 0)]

        if (typeof firstItemPos == "number" && correspondingSegment && MessageUtils.matchMessageSegment(segment, correspondingSegment, ignoreCase)) {
          matchedItemsCount++
        }
        else if (typeof firstItemPos == "undefined" && MessageUtils.matchMessageSegment(segment, pattern[0], ignoreCase)) {
          firstItemPos = i
          matchedItemsCount++
        }
      }
      return matchedItemsCount == pattern.length
    }
    else {
      throw new TypeError("类型错误，消息的匹配类型应为 DataType.ListenedMessage")
    }
  }
  public static matchMessageSegment(a: Segment, b: Segment, ignoreCase: boolean = true): boolean {
    if (Object.getPrototypeOf(a) === Object.getPrototypeOf(b) || (a instanceof AppMessage.AppMessage && b instanceof MsgSegment.Json)) {
      if (a instanceof MsgSegment.Text && b instanceof MsgSegment.Text) {
        return MessageUtils.matchText(a.text, b.text, ignoreCase)
      }

      return true
    }
    return false
  }
  public static matchText(content: string, pattern: string | RegExp, ignoreCase: boolean = true): boolean {
    if (typeof pattern == "string") {
      if (ignoreCase) {
        content = content.toLowerCase()
        pattern = pattern.toLowerCase()
      }
      return content.includes(pattern)
    }
    else {
      if (ignoreCase) {
        pattern = new RegExp(pattern.source, "gi")
      }
      return pattern.test(content)
    }
  }
  public static matchCommand(str: string, command: DataType.ListenedCommand, ignoreCase: boolean = true): string[] | undefined {
    let i: number = -1
    let char: string | undefined
    function advance() {
      i++
      char = str[i]
    }
    function skipBlanks() {
      while (char && [" ", "\t", "\n", "\r"].includes(char)) {
        advance()
      }
    }
    function isSeparator() {
      return commandConfig.separator.includes(char!)
    }
    advance()

    const commandConfig = config.getConfig().listener.command
    if (commandConfig.ignoreBlanks) {
      skipBlanks()
    }

    if (commandConfig.prompt.includes(char!)) {
      const segments: string[] = []

      advance()
      while (char) {
        if (isSeparator()) {
          advance()
        }
        else {
          let segment: string = ""
          while (char && !isSeparator()) {
            segment += char
            advance()
          }
          advance()

          if (commandConfig.ignoreBlanks) {
            segment = segment.trim()
          }

          segments.push(segment)
        }
      }

      const cmd = segments.shift()
      if (cmd && MessageUtils.matchText(cmd, command, ignoreCase)) {
        return segments
      }
    }

    return undefined
  }
}