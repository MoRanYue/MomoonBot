enum ConnectionType {
  ws = "ws",
  reverseWs = "reversews",
  http = "http"
}

interface HttpMiddleware {
  api: string
  host: string
  port: number
}
interface WsMiddleware {
  api?: string
  universe: string
}
interface ReverseWsMiddleware {
  host: string
  port: number
}

interface ConnectionMiddlewareConfig {
  type: ConnectionType
  server: HttpMiddleware | WsMiddleware | ReverseWsMiddleware
  backupAccounts?: number[]
  switchAccountWhenUnavailable?: boolean
}

export interface Config {
  connections: ConnectionMiddlewareConfig[]
}
