import { MessageSegmentEnum } from "../types/enums";
import { MessageSegment } from "../types/message";
import MsgSegment, { type Segment } from "../events/messages/MessageSegment"
import type { DataType } from "src/types/dataType";
import config from "../config";

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
        return MsgSegment.Json.fromObject(<MessageSegment.JsonSegment>seg)

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

  public static segmentsToObject(segments: Segment[]): MessageSegment.Segment[] {
    let message: MessageSegment.Segment[] = []
    segments.forEach(seg => message.push(seg.toObject()))
    return message
  }

  public static matchMessage(str: string, pattern: DataType.ListenedMessage, ignoreCase: boolean = true): boolean {
    return (typeof pattern == "string" && (ignoreCase ? str.toLowerCase().includes(<string>pattern.toLowerCase()) : str.includes(<string>pattern))) || 
    (pattern instanceof RegExp && pattern.test(str))
  }
  public static matchCommand(str: string, command: DataType.ListenedMessage, ignoreCase: boolean = true): string[] | undefined {
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

    const commandConfig = config.listener.command
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
      if (cmd && MessageUtils.matchMessage(cmd, command, ignoreCase)) {
        return segments
      }
    }

    return undefined
  }
}