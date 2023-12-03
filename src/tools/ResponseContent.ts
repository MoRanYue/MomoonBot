import type { ConnectionContent } from "../types/connectionContent"

export class ResponseContent {
  public static httpClient(): ConnectionContent.Response.HttpCallback {
    return {
      echo: 'echo'
    }
  }
}