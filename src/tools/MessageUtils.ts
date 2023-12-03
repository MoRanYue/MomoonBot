import { MessageSegmentEnum } from "../types/enums";
import { MessageSegment } from "../types/message";
import MsgSegment, { type Segment } from "../events/messages/MessageSegment"

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
    
      default:
        return MsgSegment.Unknown.fromObject(seg)
    }
  }
}