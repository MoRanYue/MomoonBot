import type { ConnectionContent } from "../types/connectionContent"

export class ResponseContent {
  public static httpClient(): ConnectionContent.HttpCallback {
    return {
      echo: 'echo'
    }
  }
}