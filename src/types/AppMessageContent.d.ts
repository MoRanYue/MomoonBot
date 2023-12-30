import type { AppMessageEnum } from "./enums"

export namespace AppMessageContent {
  interface StructuredMessage<T extends object> {
    app: AppMessageEnum.App.structuredMessage
    desc: string
    prompt: string
    ver: string
    view: AppMessageEnum.View
    config: {
      ctime: number
      forward: number
      token: string
      type: string
    }
    extra?: {
      app_type: number
      appid: AppMessageEnum.AppId
      msg_seq: number
      uin: number
    }
    meta: T
  }
  interface BilibiliVideoShare {
    news: {
      action: string
      android_pkg_name: string
      app_type: 1
      appid: AppMessageEnum.AppId.bilibiliVideoShare
      ctime: number
      desc: string
      jumpUrl: string
      preview: string
      source_icon: string
      source_url: string
      uin: number
      tag: "哔哩哔哩"
      title: "哔哩哔哩"
    }
  }
  interface NeteaseMusicShare {
    music: {
      action: string
      android_pkg_name: string
      app_type: 1
      appid: AppMessageEnum.AppId.neteaseMusicShare
      ctime: number
      desc: string
      jumpUrl: string
      musicUrl: string
      preview: string
      sourceMsgId: 0
      source_icon: string
      source_url: string
      tag: "网易云音乐"
      title: string
      uin: number
    }
  }
}