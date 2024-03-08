import type { CustomEventEmitter } from "../../types/CustomEventEmitter";
import type { Client } from "../Client";
import { Adapter } from "./Adapter";

/**
 * Kritor 协议适配器
 * @todo
 * @since 0.9.0
 */
export class KritorAdapter extends Adapter {
  public readonly ev: CustomEventEmitter.AdapterEventEmitter
  
  protected process(ev: unknown, client: Client): void {
    throw new Error("Method not implemented.");
  }
}