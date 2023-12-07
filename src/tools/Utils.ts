import type { Connection } from "src/connections/Connection"
import { HttpConnection } from "../connections/HttpConnection"
import { ReverseWsConnection } from "../connections/ReverseWsConnection"
import { ConfigEnum, ListenerEnum } from "../types/enums"
import type { ConnectionContent } from "src/types/connectionContent"

export class Utils {
  public static splitToArray(data: string): string[] {
    return data.split(/, */)
  }

  public static dataToJson(data: any) {
    return JSON.stringify(data)
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

  public static generateConnectionId(conn: Connection): string {
    let type: ConfigEnum.ConnectionType | string
    if (conn instanceof HttpConnection) {
      type = ConfigEnum.ConnectionType.http
    }
    else if (conn instanceof ReverseWsConnection) {
      type = ConfigEnum.ConnectionType.reverseWs
    }
    else {
      type = "unknown"
    }
    return `${type}_${conn.address()}`
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
}