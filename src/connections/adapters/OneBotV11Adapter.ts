import type { CustomEventEmitter } from "../../types/CustomEventEmitter";
import type { Event } from "../../types/event";
import type { Client } from "../Client";
import { Adapter } from "./Adapter";

/**
 * OneBot/v11 协议适配器
 * @todo
 * @since 0.9.0
 */
export class OneBotV11Adapter extends Adapter {
  public readonly ev: CustomEventEmitter.OneBotV11EventEmitter

  protected process(ev: Event.Unknown, client: Client): void {
    throw new Error("Method not implemented.");
  }
}