import type { ConnectionContent } from "src/types/connectionContent"
import { isIPv4, isIPv6 } from "node:net"

/**
 * 实用函数类
 * @since 0.0.1
 */
export class Utils {
  public static splitToArray(data: string): string[] {
    return data.split(/, */)
  }

  public static dataToJson(data: any, spaces?: number) {
    return JSON.stringify(data, undefined, spaces)
  }

  public static jsonToData(json: string) {
    return JSON.parse(json)
  }

  public static randomInt(min?: number, max?: number): number {
    if (min) {
      if (max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
      }

      return Math.floor(Math.random() * min + 1)
    }

    return 0
  }

  public static randomChoice<T>(arr: ArrayLike<T>): T {
    return arr[Utils.randomInt(arr.length - 1)]
  }

  public static randomChar(length: number = 7, collection: string = "0123456789abcdef"): string {
    let chars: string = ""
    for (let i = 0; i < length; i++) {
      chars += Utils.randomChoice<string>(collection)
    }
    return chars
  }

  public static sexToId(sex: ConnectionContent.ActionResponse.Sex): ConnectionContent.ActionResponse.Gender {
    switch (sex) {
      case "male":
        return 1
      
      case "female":
        return 2
      
      default:
        return 0
    }
  }

  public static getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000)
  }

  public static isIpV4(host: string): boolean {
    return isIPv4(host)
  }
  public static isIpV6(host: string): boolean {
    return isIPv6(host)
  }
  public static showHostWithPort(host: string = "0.0.0.0", port?: number): string {
    if (this.isIpV4(host)) {
      if (port) {
        return `${host}:${port}`
      }
      return host
    }
    else if (this.isIpV6(host)) {
      if (port) {
        return `[${host}]:${port}`
      }
      return host
    }
    else {
      return `?:${port}`
    }
  }
}