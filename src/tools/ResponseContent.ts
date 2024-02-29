import type { ConnectionContent } from "../types/connectionContent"

/**
 * 响应内容类
 * @since 0.1.0
 */
export class ResponseContent {
  /**
   * 生成响应HTTP事件上报的内容
   * @returns HTTP响应内容
   */
  public static httpClient(): ConnectionContent.Response.HttpCallback {
    return {
      echo: 'echo'
    }
  }
}