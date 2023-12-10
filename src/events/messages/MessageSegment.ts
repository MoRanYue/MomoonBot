import { MessageSegmentEnum } from "../../types/enums"
import { MessageSegment } from "../../types/message";
import { WrongMessageTypeError } from "../../exceptions/exceptions"

export abstract class Segment {
  protected static verify(seg: MessageSegment.Segment, type: MessageSegmentEnum.SegmentType) {
    if (seg.type != type) {
      throw new WrongMessageTypeError(`错误的消息片段类型，应为“${type}”而不是“${seg.type}”`)
    }
  }

  public abstract toPlainText(): string
  public abstract toObject(): MessageSegment.Segment
  // public abstract fromObject(seg: MessageSegment.Segment): void
}

class Text extends Segment {
  public text: string

  constructor(text: string) {
    super();

    this.text = text
  }

  public toPlainText(): string {
    return this.text
  }
  public toObject(): MessageSegment.TextSegment {
    return {
      type: MessageSegmentEnum.SegmentType.text,
      data: {
        text: this.text
      }
    }
  }
  public static fromObject(seg: MessageSegment.TextSegment): Text {
    this.verify(seg, MessageSegmentEnum.SegmentType.text)
    return new Text(seg.data.text)
  }
}

class Image extends Segment {
  public file!: string
  public url?: string

  constructor(file: string | Buffer, url?: string) {
    super();

    if (typeof file == "string") {
      this.file = file
    }
    else if (file instanceof Buffer) {
      this.file = "base64://" + file.toString("base64")
    }
    this.url = url
  }

  public toPlainText(): string {
    return ""
  }
  public toObject(): MessageSegment.ImageSegment {
    return {
      type: MessageSegmentEnum.SegmentType.image,
      data: {
        file: this.file,
        url: this.url
      }
    }
  }
  public static fromObject(seg: MessageSegment.ImageSegment): Image {
    this.verify(seg, MessageSegmentEnum.SegmentType.image)
    return new Image(seg.data.file, seg.data.url)
  }
}

class At extends Segment {
  public qq: number

  constructor(id: number) {
    super();

    this.qq = id
  }

  public toPlainText(): string {
    return ""
  }
  public toObject(): MessageSegment.AtSegment {
    return {
      type: MessageSegmentEnum.SegmentType.at,
      data: {
        qq: this.qq
      }
    }
  }
  public static fromObject(seg: MessageSegment.AtSegment): At {
    this.verify(seg, MessageSegmentEnum.SegmentType.at)
    return new At(seg.data.qq)
  }
}

class Reply extends Segment {
  public id: number
  
  constructor(id: number) {
    super();

    this.id = id
  }

  public toPlainText(): string {
    return ""
  }
  public toObject(): MessageSegment.ReplySegment {
    return {
      type: MessageSegmentEnum.SegmentType.reply,
      data: {
        id: this.id
      }
    }
  }
  public static fromObject(seg: MessageSegment.ReplySegment): Reply {
    this.verify(seg, MessageSegmentEnum.SegmentType.reply)
    return new Reply(seg.data.id)
  }
}

class Face extends Segment {
  public id: number

  constructor(id: number) {
    super();

    this.id = id
  }

  public toPlainText(): string {
    return ""
  }
  public toObject(): MessageSegment.FaceSegment {
    return {
      type: MessageSegmentEnum.SegmentType.face,
      data: {
        id: this.id
      }
    }
  }
  public static fromObject(seg: MessageSegment.FaceSegment): Face {
    this.verify(seg, MessageSegmentEnum.SegmentType.face)
    return new Face(seg.data.id)
  }
}

class Unknown extends Segment {
  public data: object

  constructor(seg: MessageSegment.Segment) {
    super();

    this.data = seg.data
  }

  public toPlainText(): string {
    return ""
  }
  public toObject(): MessageSegment.Segment {
    return {
      type: MessageSegmentEnum.SegmentType.text,
      data: {
        text: `[${this.data}]`
      }
    }
  }
  public static fromObject(seg: MessageSegment.Segment): Unknown {
    return new Unknown(seg)
  }
}

export default {
  Segment, Text, Image, At, Reply, Face, Unknown
}