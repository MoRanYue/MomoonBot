import type { IncomingMessage } from "node:http";
import type { URLSearchParams } from 'url'

export interface CustomIncomingMessage extends IncomingMessage {
  body?: any
  query?: URLSearchParams
}

