import type { ConfigEnum } from "./enums"

export interface HttpMiddleware {
  api: string
  host: string
  port: number
}
export interface WsMiddleware {
  api?: string
  universe: string
}
export interface ReverseWsMiddleware {
  host: string
  port: number
}

interface ConnectionMiddlewareConfig {
  type: ConfigEnum.ConnectionType
  server: HttpMiddleware | WsMiddleware | ReverseWsMiddleware
  protocol: ConfigEnum.SupportedProtocol
  backupAccounts?: number[]
  switchAccountWhenUnavailable?: boolean
}

interface CommandListenerConfig {
  separator: string[]
  prompt: string[]
  ignoreBlanks: boolean
}
interface ListenerSettingsConfig {
  superusers: number[]
}
interface ListenerConfig {
  settings: ListenerSettingsConfig
  command: CommandListenerConfig
}

interface BotConfig {
  friendListRefreshInterval: number
  groupListRefreshInterval: number
}

export interface Config {
  connections: ConnectionMiddlewareConfig[]
  listener: ListenerConfig
  bot: BotConfig
}
