import { MessageSegmentEnum } from "./enums"

export namespace MessageSegment {
  interface Segment {
    type: MessageSegmentEnum.SegmentType
    data: object
  }
  interface TextSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.text
    data: {
      text: string
    }
  }
  interface AtSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.at
    data: {
      qq: string
    }
  }
  interface FaceSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.face
    data: {
      id: number
      big?: boolean
    }
  }
  interface BubbleFaceSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.bubbleFace
    data: {
      id: number
      count: number
    }
  }
  interface ReplySegment implements Segment {
    type: MessageSegmentEnum.SegmentType.reply
    data: {
      id: number
    }
  }
  interface FileSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.file
    data: {
      sub: string
      biz: number
      size: number
      expire: number
      name: string
      id: string
      url: string
    }
  }
  interface ImageSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.image
    data: {
      file?: string
      url?: string
      type?: "show" | "flash" | "original"
      sub_type?: MessageSegmentEnum.ImageSubType
    }
  }
  interface RecordSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.record
    data: {
      file: string
      url?: string
      magic?: boolean
    }
  }
  interface VideoSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.video
    data: {
      file?: string
    }
  }
  interface PokeSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.poke
    data: {
      type: number
      id: number
      strength: 1 | 2 | 3 | 4 | 5
    }
  }
  interface TouchSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.touch
    data: {
      id: number
    }
  }
  interface MusicSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.music
    data: {
      type: Exclude<MessageSegmentEnum.MusicType, "custom">
      id: number
    }
  }
  interface CustomMusicSegment extends MusicSegment {
    type: MessageSegmentEnum.SegmentType.music
    data: {
      type: MessageSegmentEnum.MusicType.custom
      url: string
      audio: string
      title: string
      singer: string
      image: string
    }
  }
  interface WeatherSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.weather
    data: {
      city: string
      code: string
    }
  }
  interface LocationSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.location
    data: {
      lat: number
      lon: number
      title?: string
      content?: string
    }
  }
  interface ShareSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.share
    data: {
      url: string
      title: string
      content?: string
      image?: string
      file?: string
    }
  }
  interface GiftSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.gift
    data: {
      qq: number
      id: number
    }
  }
  interface JsonSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.json
    data: {
      data: string
    }
  }
  interface BasketballSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.basketball
    data: {
      id: MessageSegmentEnum.BasketballId
    }
  }
  interface NewRpsSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.newRps
    data: {
      id: MessageSegmentEnum.RpsId
    }
  }
  interface NewDiceSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.newDice
    data: {
      id: 6 | 5 | 4 | 3 | 2 | 1
    }
  }
  interface DeprecatedRpsSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.deprecatedRps
    data: {}
  }
  interface DeprecatedDiceSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.deprecatedDice
    data: {}
  }
  interface ForwardSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.forward
    data: {
      id: string
    }
  }
  interface ForwardNodeSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.forwardNode
    data: {
      id: number
    }
  }
  interface MarketFaceSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.marketFace
    data: {
      id: string
    }
  }
  interface MarkdownSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.markdown
    data: {
      content: string
    }
  }
}