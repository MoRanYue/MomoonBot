import { MessageSegmentEnum } from "../../types/enums"
import { MessageSegment } from "../../types/message";
import { WrongMessageTypeError } from "../../exceptions/exceptions"
import { Utils } from "../../tools/Utils";

export abstract class Segment {
  protected static verify(seg: MessageSegment.Segment, type: MessageSegmentEnum.SegmentType) {
    if (seg.type != type) {
      throw new WrongMessageTypeError(`错误的消息片段类型，应为“${type}”而不是“${seg.type}”`)
    }
  }

  public abstract toPlainText(): string
  public abstract toObject(): MessageSegment.Segment
}

class File extends Segment {
  public id: string
  public name: string
  public url: string
  public expire: number
  public sub: string
  public biz: number
  public size: number

  constructor(id: string, name: string, url: string, expire: number, sub: string, biz: number, size: number) {
    super();

    this.id = id
    this.name = name
    this.url = url
    this.expire = expire
    this.sub = sub
    this.size = size
    this.biz = biz
  }

  public toPlainText(): string {
    return `(文件 ID：“${this.id}” 名称：“${this.name}” URL：“${this.url}” 到期时间：“${this.expire}” 大小：“${this.size}” Sub：“${this.sub}” Biz；“${this.biz}”)`
  }
  public toObject(): MessageSegment.FileSegment {
    return {
      type: MessageSegmentEnum.SegmentType.file,
      data: {
        sub: this.sub,
        biz: this.biz,
        expire: this.expire,
        id: this.id,
        name: this.name,
        size: this.size,
        url: this.url
      }
    }
  }
  public static fromObject(seg: MessageSegment.FileSegment): File {
    this.verify(seg, MessageSegmentEnum.SegmentType.file)
    return new File(seg.data.id, seg.data.name, seg.data.url, seg.data.expire, seg.data.sub, seg.data.biz, seg.data.size)
  }
}

class Json extends Segment {
  public data: any

  constructor(data: any | undefined) {
    super();

    if (data) {
      this.data = Utils.jsonToData(data)
    }
    else {
      this.data = undefined
    }
  }

  public toPlainText(): string {
    return `(JSON 数据：“${Utils.dataToJson(this.data)}”)`
  }
  public toObject(): MessageSegment.JsonSegment {
    return {
      type: MessageSegmentEnum.SegmentType.json,
      data: {
        data: Utils.dataToJson(this.data)
      }
    }
  }
  public static fromObject(seg: MessageSegment.JsonSegment): Json {
    this.verify(seg, MessageSegmentEnum.SegmentType.json)
    return new Json(seg.data.data)
  }
}

class ForwardNode extends Segment {
  public id: number

  constructor(id: number) {
    super();

    this.id = id
  }

  public toPlainText(): string {
    return `(合并转发节点 ID：“${this.id}”)`
  }
  public toObject(): MessageSegment.ForwardNodeSegment {
    return {
      type: MessageSegmentEnum.SegmentType.forwardNode,
      data: {
        id: this.id
      }
    }
  }
  public static fromObject(seg: MessageSegment.ForwardNodeSegment): ForwardNode {
    this.verify(seg, MessageSegmentEnum.SegmentType.forwardNode)
    return new ForwardNode(seg.data.id)
  }
}

class Forward extends Segment {
  public id: string

  constructor(id: string) {
    super();

    this.id = id
  }

  public toPlainText(): string {
    return `(合并转发 ID：“${this.id}”)`
  }
  public toObject(): MessageSegment.ForwardSegment {
    return {
      type: MessageSegmentEnum.SegmentType.forward,
      data: {
        id: this.id
      }
    }
  }
  public static fromObject(seg: MessageSegment.ForwardSegment): Forward {
    this.verify(seg, MessageSegmentEnum.SegmentType.forward)
    return new Forward(seg.data.id)
  }
}

class Gift extends Segment {
  public target: number
  public id: number

  constructor(target: number, id: number) {
    super();

    this.target = target
    this.id = id
  }

  public toPlainText(): string {
    return `(礼物 ID：“${this.id}” 目标用户：“${this.target}”)`
  }
  public toObject(): MessageSegment.GiftSegment {
    return {
      type: MessageSegmentEnum.SegmentType.gift,
      data: {
        qq: this.target,
        id: this.id
      }
    }
  }
  public static fromObject(seg: MessageSegment.GiftSegment): Gift {
    this.verify(seg, MessageSegmentEnum.SegmentType.gift)
    return new Gift(seg.data.qq, seg.data.id)
  }
}

class Share extends Segment {
  public url: string
  public title: string
  public content?: string
  public image?: string
  public file?: string

  constructor(url: string, title: string, content?: string, image?: string, file?: string) {
    super();

    this.url = url
    this.title = title
    this.content = content
    this.image = image
    this.file = file
  }

  public toPlainText(): string {
    return `(分享链接 URL：“${this.url}” 标题：“${this.title}” 内容：“${this.content}” 图片：“${this.image}” 文件：“${this.file}”)`
  }
  public toObject(): MessageSegment.ShareSegment {
    return {
      type: MessageSegmentEnum.SegmentType.share,
      data: {
        url: this.url,
        title: this.title,
        content: this.content,
        image: this.image,
        file: this.file
      }
    }
  }
  public static fromObject(seg: MessageSegment.ShareSegment): Share {
    this.verify(seg, MessageSegmentEnum.SegmentType.share)
    return new Share(seg.data.url, seg.data.title, seg.data.content, seg.data.image, seg.data.file)
  }
}

class Location extends Segment {
  public lat: number
  public lon: number
  public title?: string
  public content?: string

  constructor(lat: number, lon: number, title?: string, content?: string) {
    super();

    this.lat = lat
    this.lon = lon
    this.title = title
    this.content = content
  }

  public toPlainText(): string {
    return `(分享位置 经度：“${this.lon}” 纬度：“${this.lat}” 标题：“${this.title}” 内容：“${this.content}”)`
  }
  public toObject(): MessageSegment.LocationSegment {
    return {
      type: MessageSegmentEnum.SegmentType.location,
      data: {
        lat: this.lat,
        lon: this.lon,
        title: this.title,
        content: this.content
      }
    }
  }
  public static fromObject(seg: MessageSegment.LocationSegment): Location {
    this.verify(seg, MessageSegmentEnum.SegmentType.location)
    return new Location(seg.data.lat, seg.data.lon, seg.data.title, seg.data.content)
  }
}

class Weather extends Segment {
  public city?: string
  public code?: string

  constructor(city?: string, code?: string) {
    super();

    this.city = city
    this.code = code
  }

  public toPlainText(): string {
    return `(天气 城市代码：“${this.code}” 城市：“${this.city}”)`
  }
  public toObject(): MessageSegment.WeatherSegment {
    return {
      type: MessageSegmentEnum.SegmentType.weather,
      data: {
        city: this.city!,
        code: this.code!
      }
    }
  }
  public static fromObject(seg: MessageSegment.WeatherSegment): Weather {
    this.verify(seg, MessageSegmentEnum.SegmentType.weather)
    return new Weather(seg.data.city, seg.data.code)
  }
}

class Music extends Segment {
  public type: Exclude<MessageSegmentEnum.MusicType, "custom">
  public id: number

  constructor(type: Exclude<MessageSegmentEnum.MusicType, "custom">, id: number) {
    super();

    this.type = type
    this.id = id
  }

  public toPlainText(): string {
    return `(音乐 类型：“${this.type}” ID：“${this.id}”)`
  }
  public toObject(): MessageSegment.MusicSegment {
    return {
      type: MessageSegmentEnum.SegmentType.music,
      data: {
        type: <Exclude<MessageSegmentEnum.MusicType, "custom">>this.type,
        id: this.id
      }
    }
  }
  public static fromObject(seg: MessageSegment.MusicSegment | MessageSegment.CustomMusicSegment): Music | CustomMusic {
    this.verify(seg, MessageSegmentEnum.SegmentType.music)
    if (seg.data.type == MessageSegmentEnum.MusicType.custom) {
      return new CustomMusic(seg.data.url, seg.data.audio, seg.data.title, seg.data.singer, seg.data.image)
    }
    return new Music(seg.data.type, seg.data.id)
  }
}

class CustomMusic extends Segment {
  public type: MessageSegmentEnum.MusicType.custom = MessageSegmentEnum.MusicType.custom
  public url: string
  public audio: string
  public title: string
  public singer: string
  public image: string

  constructor(url: string, audio: string, title: string, singer: string, image: string) {
    super();

    this.url = url
    this.audio = audio
    this.title = title
    this.singer = singer
    this.image = image
  }

  public toPlainText(): string {
    return `(自定义音乐 URL：“${this.url}” 音频URL：“${this.audio}” 标题：“${this.title}” 歌手：“${this.singer}” 图片：“${this.image}”)`
  }
  public toObject(): MessageSegment.CustomMusicSegment {
    return {
      type: MessageSegmentEnum.SegmentType.music,
      data: {
        type: this.type,
        url: this.url,
        audio: this.audio,
        title: this.title,
        singer: this.singer,
        image: this.image
      }
    }
  }
  public static fromObject(seg: MessageSegment.CustomMusicSegment | MessageSegment.MusicSegment): CustomMusic | Music {
    this.verify(seg, MessageSegmentEnum.SegmentType.music)
    if (seg.data.type == MessageSegmentEnum.MusicType.custom) {
      return new CustomMusic(seg.data.url, seg.data.audio, seg.data.title, seg.data.singer, seg.data.image)
    }
    return Music.fromObject(<MessageSegment.MusicSegment>seg)
  }
}

class Touch extends Segment {
  public id: number

  constructor(id: number) {
    super();

    this.id = id
  }

  public toPlainText(): string {
    return `(头像戳一戳 ID：“${this.id}”)`
  }
  public toObject(): MessageSegment.TouchSegment {
    return {
      type: MessageSegmentEnum.SegmentType.touch,
      data: {
        id: this.id
      }
    }
  }
  public static fromObject(seg: MessageSegment.TouchSegment): Touch {
    this.verify(seg, MessageSegmentEnum.SegmentType.touch)
    return new Touch(seg.data.id)
  }
}

class Poke extends Segment {
  public type: number
  public id: number
  public strength: 1 | 2 | 3 | 4 | 5

  constructor(type: number, id: number, strength: 1 | 2 | 3 | 4 | 5) {
    super();

    this.type = type
    this.id = id
    this.strength = strength
  }

  public toPlainText(): string {
    return `(戳一戳 类型：“${this.type}” ID：“${this.id}” 强度：“${this.strength}”)`
  }
  public toObject(): MessageSegment.PokeSegment {
    return {
      type: MessageSegmentEnum.SegmentType.poke,
      data: {
        type: this.type,
        id: this.id,
        strength: this.strength
      }
    }
  }
  public static fromObject(seg: MessageSegment.PokeSegment): Poke {
    this.verify(seg, MessageSegmentEnum.SegmentType.poke)
    return new Poke(seg.data.type, seg.data.id, seg.data.strength)
  }
}

class DeprecatedRps extends Segment {
  constructor() {
    super();
  }

  public toPlainText(): string {
    return ""
  }
  public toObject(): MessageSegment.DeprecatedRpsSegment {
    return {
      type: MessageSegmentEnum.SegmentType.deprecatedRps,
      data: {}
    }
  }
  public static fromObject(seg: MessageSegment.DeprecatedRpsSegment): DeprecatedRps {
    this.verify(seg, MessageSegmentEnum.SegmentType.deprecatedRps)
    return new DeprecatedRps()
  }
}

class DeprecatedDice extends Segment {
  constructor() {
    super();
  }

  public toPlainText(): string {
    return ""
  }
  public toObject(): MessageSegment.DeprecatedDiceSegment {
    return {
      type: MessageSegmentEnum.SegmentType.deprecatedDice,
      data: {}
    }
  }
  public static fromObject(seg: MessageSegment.DeprecatedDiceSegment): DeprecatedDice {
    this.verify(seg, MessageSegmentEnum.SegmentType.deprecatedDice)
    return new DeprecatedDice()
  }
}

class NewDice extends Segment {
  public id: 6 | 5 | 4 | 3 | 2 | 1

  constructor(id: 6 | 5 | 4 | 3 | 2 | 1) {
    super();

    this.id = id
  }

  public toPlainText(): string {
    return `(骰子 点数：“${this.id}”)`
  }
  public toObject(): MessageSegment.NewDiceSegment {
    return {
      type: MessageSegmentEnum.SegmentType.newDice,
      data: {
        id: this.id
      }
    }
  }
  public static fromObject(seg: MessageSegment.NewDiceSegment): NewDice {
    this.verify(seg, MessageSegmentEnum.SegmentType.newDice)
    return new NewDice(seg.data.id)
  }
}

class NewRps extends Segment {
  public id: MessageSegmentEnum.RpsId

  constructor(id: MessageSegmentEnum.RpsId) {
    super();

    this.id = id
  }

  public toPlainText(): string {
    let result: string
    if (this.id == MessageSegmentEnum.RpsId.rock) {
      result = "石头"
    }
    else if (this.id == MessageSegmentEnum.RpsId.scissor) {
      result = "剪刀"
    }
    else if (this.id == MessageSegmentEnum.RpsId.paper) {
      result = "布"
    }
    else {
      result = String(this.id)
    }
    return `(猜拳 结果：“${result}”)`
  }
  public toObject(): MessageSegment.NewRpsSegment {
    return {
      type: MessageSegmentEnum.SegmentType.newRps,
      data: {
        id: this.id
      }
    }
  }
  public static fromObject(seg: MessageSegment.NewRpsSegment): NewRps {
    this.verify(seg, MessageSegmentEnum.SegmentType.newRps)
    return new NewRps(seg.data.id)
  }
}

class Basketball extends Segment {
  public id: MessageSegmentEnum.BasketballId

  constructor(id: MessageSegmentEnum.BasketballId) {
    super();

    this.id = id
  }

  public toPlainText(): string {
    let result: string
    if (this.id == MessageSegmentEnum.BasketballId.missed) {
      result = "未投中"
    }
    else if (this.id == MessageSegmentEnum.BasketballId.closeMissed) {
      result = "擦边未投中"
    }
    else if (this.id == MessageSegmentEnum.BasketballId.stuck) {
      result = "卡住"
    }
    else if (this.id == MessageSegmentEnum.BasketballId.closeHit) {
      result = "擦边投中"
    }
    else if (this.id == MessageSegmentEnum.BasketballId.hit) {
      result = "投中"
    }
    else {
      result = String(this.id)
    }
    return `(篮球 结果：“${result}”)`
  }
  public toObject(): MessageSegment.BasketballSegment {
    return {
      type: MessageSegmentEnum.SegmentType.basketball,
      data: {
        id: this.id
      }
    }
  }
  public static fromObject(seg: MessageSegment.BasketballSegment): Basketball {
    this.verify(seg, MessageSegmentEnum.SegmentType.basketball)
    return new Basketball(seg.data.id)
  }
}

class Record extends Segment {
  public file: string
  public url?: string
  public magic?: boolean

  constructor(file: string, url?: string, magic?: boolean) {
    super();

    this.file = file
    this.url = url
    this.magic = magic
  }

  public toPlainText(): string {
    return `(语音 文件：”${this.file}“ URL：“${this.url}” 魔法语音：“${this.magic}”)`
  }
  public toObject(): MessageSegment.RecordSegment {
    return {
      type: MessageSegmentEnum.SegmentType.record,
      data: {
        file: this.file,
        url: this.url,
        magic: this.magic
      }
    }
  }
  public static fromObject(seg: MessageSegment.RecordSegment): Record {
    this.verify(seg, MessageSegmentEnum.SegmentType.record)
    return new Record(seg.data.file, seg.data.url, seg.data.magic)
  }
}

class Video extends Segment {
  public file?: string

  constructor(file?: string) {
    super();

    this.file = file
  }

  public toPlainText(): string {
    return `(视频 文件：“${this.file}”)`
  }
  public toObject(): MessageSegment.VideoSegment {
    return {
      type: MessageSegmentEnum.SegmentType.video,
      data: {
        file: this.file
      }
    }
  }
  public static fromObject(seg: MessageSegment.VideoSegment): Video {
    this.verify(seg, MessageSegmentEnum.SegmentType.video)
    return new Video(seg.data.file)
  }
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
  public file?: string
  public url?: string
  public imageType?: "show" | "flash" | "original"
  public subType?: MessageSegmentEnum.ImageSubType

  constructor(file?: string | Buffer, url?: string, type?: "show" | "flash" | "original", subType?: MessageSegmentEnum.ImageSubType) {
    super();

    if (typeof file == "string") {
      this.file = file
    }
    else if (file instanceof Buffer) {
      this.file = "base64://" + file.toString("base64")
    }
    this.url = url
    this.imageType = type
    this.subType = subType
  }

  public toPlainText(): string {
    return `(图片 文件：“${this.file}” URL：“${this.url}” 类型：${this.imageType} 子类型：${this.subType})`
  }
  public toObject(): MessageSegment.ImageSegment {
    const obj: MessageSegment.ImageSegment = {
      type: MessageSegmentEnum.SegmentType.image,
      data: {}
    }
    if (this.file) {
      obj.data.file = this.file
    }
    if (this.url) {
      obj.data.url = this.url
    }
    if (this.imageType && this.subType) {
      obj.data.type = this.imageType
      obj.data.sub_type = this.subType
    }
    return obj
  }
  public static fromObject(seg: MessageSegment.ImageSegment): Image {
    this.verify(seg, MessageSegmentEnum.SegmentType.image)
    return new Image(seg.data.file, seg.data.url, seg.data.type, seg.data.sub_type)
  }
}

class At extends Segment {
  public qq: string

  constructor(id: number | string) {
    super();

    this.qq = String(id)
  }

  public toPlainText(): string {
    return `@${this.qq}`
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
    return `(回复 目标消息：“${this.id}”)`
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
  public big: boolean

  constructor(id: number, big: boolean = false) {
    super();

    this.id = id
    this.big = big
  }

  public toPlainText(): string {
    return `(表情符号 ID：“${this.id}” 大型：${this.big ? "是" : "否"})`
  }
  public toObject(): MessageSegment.FaceSegment {
    return {
      type: MessageSegmentEnum.SegmentType.face,
      data: {
        id: this.id,
        big: this.big
      }
    }
  }
  public static fromObject(seg: MessageSegment.FaceSegment): Face {
    this.verify(seg, MessageSegmentEnum.SegmentType.face)
    return new Face(seg.data.id, seg.data.big)
  }
}

class BubbleFace extends Segment {
  public id: number
  public count: number

  constructor(id: number, count: number) {
    super();

    this.id = id
    this.count = count
  }

  public toPlainText(): string {
    return `(弹射表情 ID：“${this.id}” 次数：${this.count})`
  }
  public toObject(): MessageSegment.BubbleFaceSegment {
    return {
      type: MessageSegmentEnum.SegmentType.bubbleFace,
      data: {
        id: this.id,
        count: this.count
      }
    }
  }
  public static fromObject(seg: MessageSegment.BubbleFaceSegment): BubbleFace {
    this.verify(seg, MessageSegmentEnum.SegmentType.bubbleFace)
    return new BubbleFace(seg.data.id, seg.data.count)
  }
}

class MarketFace extends Segment {
  public id: string

  constructor(id: string) {
    super();

    this.id = id
  }

  public toPlainText(): string {
    return `(市场表情符号 ID："${this.id}")`
  }
  public toObject(): MessageSegment.MarketFaceSegment {
    return {
      type: MessageSegmentEnum.SegmentType.marketFace,
      data: {
        id: this.id
      }
    }
  }
  public static fromObject(seg: MessageSegment.MarketFaceSegment): MarketFace {
    this.verify(seg, MessageSegmentEnum.SegmentType.marketFace)
    return new MarketFace(seg.data.id)
  }
}

class Unknown extends Segment {
  public data: object

  constructor(seg: MessageSegment.Segment) {
    super();

    this.data = seg.data
  }

  public toPlainText(): string {
    return `(未知 数据：“${Utils.dataToJson(this.data)}”)`
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
  Segment, Text, Image, At, Reply, Face, BubbleFace, MarketFace, Unknown, 
  Json, Video, Record, Weather, Music, CustomMusic, Poke, Touch,
  Share, Basketball, DeprecatedDice, DeprecatedRps, NewDice, NewRps, 
  Forward, ForwardNode, Location, Gift, File
}