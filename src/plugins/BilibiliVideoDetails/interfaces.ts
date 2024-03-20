import axios from "axios"
import { Utils } from "../../tools/Utils"
import type { IncomingMessage } from "http"
import { createHash } from "node:crypto"
import url from "node:url"
import { Logger } from "../../tools/Logger"
import type { ApiContent } from "./types/ApiContent"

const mixinKeyEncryptMapping: number[] = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52
]
const logger: Logger = new Logger("哔哩哔哩视频详情→接口请求")

export class Api {
  protected imgKey?: string
  protected subKey?: string
  protected rawWbiKey?: string

  protected fakeUrlToToken(fakeUrl: string): string {
    return fakeUrl.substring(0, fakeUrl.lastIndexOf(".")).substring(fakeUrl.lastIndexOf("/") + 1)
  }

  public getWbiKey(cb?: VoidFunction): void {
    this.get("https://api.bilibili.com/x/web-interface/nav", undefined, false, data => {
      const result: any = Utils.jsonToData(data.toString("utf-8"))
      
      this.imgKey = this.fakeUrlToToken(<string>result.data.wbi_img.img_url)
      this.subKey = this.fakeUrlToToken(<string>result.data.wbi_img.sub_url)
      this.rawWbiKey = this.imgKey + this.subKey

      if (cb) {
        cb()
      }
    })
  }
  public wbiSign(params: Record<string, any> = {}, cb: (params: Record<string, string>) => any): void {
    if (!(this.imgKey && this.subKey && this.rawWbiKey)) {
      this.getWbiKey(() => this.wbiSign(params, cb))
      return
    }

    const mixinKey = mixinKeyEncryptMapping.map(num => this.rawWbiKey![num]).join("").substring(0, 32)
    params.wts = Utils.getCurrentTimestamp()
    const rawWRid = new url.URLSearchParams(params)
    rawWRid.sort()
    params.w_rid = createHash("md5").update(rawWRid.toString()).digest("hex")

    cb(params)
  }

  public objectToQueryString(obj: Record<string, any>): string {
    return new url.URLSearchParams(obj).toString()
  }
  public searchParamsToObject(searchParams: url.URLSearchParams): Record<string, string> {
    let obj: Record<string, string> = {}
    searchParams.forEach((value, name) => obj[name] = value)
    return obj
  }
  public queryStringToObject(query: string): Record<string, string> {
    return this.searchParamsToObject(new url.URLSearchParams(query))
  }

  public videoDetailsInfo(id: string, isBvId: boolean, cb?: (data: ApiContent.Response.Response<ApiContent.Response.VideoDetails>, res: axios.AxiosResponse) => (void | Promise<void>), catchCb?: (err: Error, res?: axios.AxiosResponse) => (void | Promise<void>)): void | never {
    if (cb) {
      const params: Record<string, string> = {}
      if (isBvId) {
        params.bvid = id
      }
      else {
        params.aid = id.substring(2)
      }

      logger.debug("尝试获取视频详细信息，视频ID：" + id)
      this.get("https://api.bilibili.com/x/web-interface/view", params, true, (data, res) => cb(Utils.jsonToData(data.toString("utf-8")), res), catchCb)
    }
  }

  public get(target: string | url.URL, params?: url.URLSearchParams | Record<string, any> | string, needSign: boolean = true, cb?: (data: Buffer, res: axios.AxiosResponse) => (void | Promise<void>), catchCb?: (err: Error, res?: axios.AxiosResponse) => (void | Promise<void>)): void {
    try {
      const target_: url.URL = typeof target == "string" ? new url.URL(target) : target
      let params_: Record<string, string> = {}
      if (params) {
        if (typeof params == "string") {
          params_ = this.queryStringToObject(params)
        }
        else if (params instanceof url.URLSearchParams) {
          params_ = this.searchParamsToObject(params)
        }
        else {
          params_ = params
        }
      }
      if (needSign) {
        logger.debug("正在生成 Wbi")
        this.wbiSign(params_, (params) => this.get(target_, params, false, cb, catchCb))
        return 
      }
      target_.search = this.objectToQueryString(params_)

      const req = axios.get(target_.toString(), {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
          "Referer": "https://www.bilibili.com"
        }
      }).then(res => {
        if (cb) {
          cb(res.data, res)
        }
      }).catch(catchCb)
    }
    catch (err) {
      if (catchCb) {
        catchCb(<Error>err)
      }
    }
  }
}