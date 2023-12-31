import type { ConfigEnum, LoggerEnum } from "./enums"

export interface HttpMiddleware {
  api: string
  host: string
  port: number
  token: string | null
}
export interface WsMiddleware {
  api?: string
  universe: string
  token: string | null
}
export interface ReverseWsMiddleware {
  host: string
  port: number
  token: string | null
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
  triggerBySelf: boolean
  superusers: number[]
}
interface ListenerConfig {
  settings: ListenerSettingsConfig
  command: CommandListenerConfig
}

interface BotConfig {}

interface PluginConfig {
  files?: string[]
  folders: string[]
  data: Record<string, object | string[]>
}

interface LoggerConfig {
  level: LoggerEnum.LogLevel
  debug: boolean
  path: string
}

export interface Configuration {
  configVersion: number
  connections: ConnectionMiddlewareConfig[]
  listener: ListenerConfig
  plugins: PluginConfig
  log: LoggerConfig
  bot: BotConfig
}
