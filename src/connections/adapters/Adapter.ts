import { CustomEventEmitter as EventEmitter } from "../../tools/CustomEventEmitter";
import type { CustomEventEmitter } from "../../types/CustomEventEmitter"
import type { Client } from "../Client"

/**
 * 协议适配器
 * @todo
 * @since 0.9.0
 */
export abstract class Adapter {
  public readonly ev: CustomEventEmitter.AdapterEventEmitter = new EventEmitter()

  constructor() {
    this.ev.on("report", this.process)
  }

  /**
   * 处理事件，将结果发射至 result 事件
   * @param ev 由客户端传递而来的原始事件内容
   * @param client 客户端
   */
  protected abstract process(ev: unknown, client: Client): void
}