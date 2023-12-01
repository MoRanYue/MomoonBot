export namespace MessageSegment {
  enum SegmentType {
    text = "text",
    at = "at",
    face = "face",
    reply = "reply",
    file = "file",
    image = "image",
    record = "record",
    video = "video",
    poke = "poke",
    touch = "touch",
    music = "music",
    weather = "weather",
    location = "location",
    share = "share",
    gift = "gift",
    json = "json",

    mergedForward = "",
    mergedForwardNode = "",
    xml = "",
    textToSpeech = ""
  }

  interface Segment {
    type: SegmentType
    data: object
  }
  interface TextSegment implements Segment {
    type: SegmentType.text
    data: {
      text: string
    }
  }
  interface AtSegment implements Segment {
    type: SegmentType.at
    data: {
      qq: number
    }
  }
  interface FaceSegment implements Segment {
    type: SegmentType.face
    data: {
      id: number
    }
  }
  interface ReplySegment implements Segment {
    type: SegmentType.reply
    data: {
      id: number
    }
  }
  interface FileSegment implements Segment {
    type: SegmentType.file
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
    type: SegmentType.image
    data: {
      file: string
      url?: string
    }
  }
  interface RecordSegment implements Segment {
    type: SegmentType.record
    data: {
      file?: string
      url: string
      magic?: boolean
    }
  }
  interface VideoSegment implements Segment {
    type: SegmentType.video
    data: {
      file?: string
    }
  }
  interface PokeSegment implements Segment {
    type: SegmentType.poke
    data: {
      type: number
      id: number
      strength: number
    }
  }
  interface TouchSegment implements Segment {
    type: SegmentType.touch
    data: {
      id: number
    }
  }
  interface MusicSegment implements Segment {
    type: SegmentType.music
    data: {
      type: "qq" | "163"
      id: number
    }
  }
  interface CustomMusicSegment extends MusicSegment {
    type: SegmentType.music
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
    type: SegmentType.weather
    data: {
      city: string
      code: string
    }
  }
  interface LocationSegment implements Segment {
    type: SegmentType.location
    data: {
      lat: number
      lon: number
      title?: string
      content?: string
    }
  }
  interface ShareSegment implements Segment {
    type: SegmentType.share
    data: {
      url: string
      title?: string
      content?: string
      image?: string
      file?: string
    }
  }
  interface GiftSegment implements Segment {
    type: SegmentType.gift
    data: {
      qq: number
      id: number
    }
  }
  interface JsonSegment implements Segment {
    type: SegmentType.json
    data: {
      data: string
    }
  }
}