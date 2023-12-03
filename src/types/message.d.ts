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
      qq: number
    }
  }
  interface FaceSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.face
    data: {
      id: number
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
      file: string
      url?: string
    }
  }
  interface RecordSegment implements Segment {
    type: MessageSegmentEnum.SegmentType.record
    data: {
      file?: string
      url: string
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
      strength: number
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
      type: "qq" | "163"
      id: number
    }
  }
  interface CustomMusicSegment extends MusicSegment {
    type: MessageSegmentEnum.SegmentType.music
    data: {
      type: "custom"
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
      title?: string
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
}