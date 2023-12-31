import { FileUtils } from './tools/FileUtils'
import { Logger } from './tools/Logger'
import { Utils } from './tools/Utils'
import { Configuration } from './types/configuration'
import { ConfigEnum, LoggerEnum } from './types/enums'
import fs from "node:fs"
import path from 'node:path'

type Validation = Record<string, string | string[]>
export class Config {
  private readonly version: number = 1
  private filePath: string
  private config: Configuration

  constructor(filePath: string = "./config.json") {
    if (FileUtils.getExtendedName(filePath)?.toLowerCase() != ".json") {
      console.error("文件类型不正确，应为JSON文件")
      process.exit()
    }
    this.filePath = path.resolve(filePath)
    let fileContent: string
    try {
      fileContent = fs.readFileSync(this.filePath, { encoding: "utf-8" })
      if (!fileContent) {
        throw new Error()
      }
    } catch (err) {
      console.log(`配置文件不存在，将在“${this.filePath}”位置创建配置文件`)
      this.config = this.getDefaultConfig()
      this._save(() => {
        console.log("请填写配置文件后重新开启")
        process.exit()
      })
      return
    }
    const config = Utils.jsonToData(fileContent!)
    if (this.validateConfig(config)) {
      this.config = <Configuration>config
    }
    else {
      console.error("配置文件校验失败")
      process.exit()
    }
  }

  private validateConfig(config: Record<string, unknown> | Partial<Configuration> | undefined): boolean {
    if (!config) {
      console.log("配置文件不存在")
      return false
    }
    
    const rootKeys: Validation = {
      configVersion: "number",
      connections: "array", 
      listener: "object", 
      log: "object", 
      plugins: "object", 
      bot: "object"
    }
    if (!this.validateOne(config, rootKeys)) {
      console.log("“根”错误")
      return false
    }

    const configRootIsCorrect = <Configuration><unknown>config

    const connectionKeys: Validation = {
      type: "string",
      protocol: "string",
      server: "object"
    }
    const httpServerKeys: Validation = {
      host: "string",
      port: "number",
      api: "string",
      token: ["string", "null"]
    }
    const wsServerKeys: Validation = {
      universe: "string",
      token: ["string", "null"]
    }
    const reverseWsServerKeys: Validation = {
      host: "string",
      port: "number",
      token: ["string", "null"]
    }
    for (let i = 0; i < configRootIsCorrect.connections.length; i++) {
      const conn = configRootIsCorrect.connections[i];
      
      if (!this.validateOne(<Record<string, unknown>><unknown>conn, connectionKeys)) {
        console.log(`“connections[${i}]”错误`)
        return false
      }
      switch (conn.type) {
        case ConfigEnum.ConnectionType.http:
          if (this.validateOne(<Record<string, unknown>><unknown>conn.server, httpServerKeys)) {
            break
          }
          console.log(`“connections[${i}].server”错误`)
          return false

        case ConfigEnum.ConnectionType.ws:
          if (this.validateOne(<Record<string, unknown>><unknown>conn.server, wsServerKeys)) {
            break
          }
          console.log(`“connections[${i}].server”错误`)
          return false

        case ConfigEnum.ConnectionType.reverseWs:
          if (this.validateOne(<Record<string, unknown>><unknown>conn.server, reverseWsServerKeys)) {
            break
          }
          console.log(`“connections[${i}].server”错误`)
          return false

        default:
          console.log(`“connections[${i}].type”错误`)
          return false
      }
    }

    const listenerKeys: Validation = {
      command: "object",
      settings: "object"
    }
    const listenerCommandKeys: Validation = {
      prompt: "array",
      separator: "array",
      ignoreBlanks: "boolean"
    }
    const listenerSettingsKeys: Validation = {
      superusers: "array",
      triggerBySelf: "boolean"
    }
    if (!this.validateOne(<Record<string, unknown>><unknown>configRootIsCorrect.listener, listenerKeys)) {
      console.log(`“listener”错误`)
      return false
    }
    if (!this.validateOne(<Record<string, unknown>><unknown>configRootIsCorrect.listener.command, listenerCommandKeys)) {
      console.log(`“listener.command”错误`)
      return false
    }
    if (!this.validateOne(<Record<string, unknown>><unknown>configRootIsCorrect.listener.settings, listenerSettingsKeys)) {
      console.log(`“listener.settings”错误`)
      return false
    }

    const logKeys: Validation = {
      level: "string",
      debug: "boolean",
      path: "string"
    }
    if (!this.validateOne(<Record<string, unknown>><unknown>configRootIsCorrect.log, logKeys)) {
      console.log(`“log”错误`)
      return false
    }

    const pluginsKeys: Validation = {
      files: ["array", "undefined"],
      folders: "array",
      data: "object"
    }
    if (!this.validateOne(<Record<string, unknown>><unknown>configRootIsCorrect.plugins, pluginsKeys)) {
      console.log(`“plugins”错误`)
      return false
    }

    const botKeys: Validation = {}
    if (!this.validateOne(<Record<string, unknown>><unknown>configRootIsCorrect.bot, botKeys)) {
      console.log(`“bot”错误`)
      return false
    }

    return true
  }
  private validateOne(target: Record<string, unknown> | undefined, keys: Validation): boolean {
    if (!target) {
      return false
    }
    for (const k in keys) {
      if (Object.prototype.hasOwnProperty.call(keys, k)) {
        const type = keys[k]
        const v = target[k]
        if (typeof type == "string" && !this.validateFactor(v, type)) {
          return false
        }
        else if (Array.isArray(type)) {
          let isCorrect: boolean = false
          for (let i = 0; i < type.length; i++) {
            const oneType = type[i];
            
            if (this.validateFactor(v, oneType)) {
              isCorrect = true
              break
            }
          }
          if (!isCorrect) {
            return false
          }
        }
      }
    }
    return true
  }
  private validateFactor(target: unknown, type: string): boolean {
    if (type == "null" && typeof target == "object" && !target) {
      return true
    }
    else if (type == "array" && Array.isArray(target)) {
      return true
    }
    if (typeof target == type) {
      return true
    }
    return false
  }

  public _save(cb?: () => void): void {
    fs.writeFile(this.filePath, Utils.dataToJson(this.config, 2), {
      encoding: "utf-8",
      flag: "w"
    }, err => {
      if (err) {
        console.log("配置文件保存时出现错误")
        console.error(err)
      }
      if (cb) {
        cb()
      }
    })
  }

  public getConfig(): Configuration {
    return this.config
  }
  public getDefaultConfig(): Configuration {
    return {
      configVersion: this.version,
      connections: [
        {
          type: ConfigEnum.ConnectionType.http,
          protocol: ConfigEnum.SupportedProtocol.shamrock,
          server: {
            host: "0.0.0.0",
            port: 3006,
            api: "http://127.0.0.1:3002",
            token: null
          }
        },
        {
          type: ConfigEnum.ConnectionType.reverseWs,
          protocol: ConfigEnum.SupportedProtocol.shamrock,
          server: {
            host: "0.0.0.0",
            port: 3007,
            token: null
          }
        }
      ],
      listener: {
        command: {
          prompt: [" "],
          separator: ["!", "！", ".", "。", "#"],
          ignoreBlanks: true
        },
        settings: {
          superusers: [],
          triggerBySelf: false
        }
      },
      log: {
        level: LoggerEnum.LogLevel.info,
        debug: false,
        path: "./logs/"
      },
      plugins: {
        folders: [],
        files: [],
        data: {}
      },
      bot: {}
    }
  }

  public getPluginData(pluginClassName: string): any | undefined
  public getPluginData(pluginClassName: string, key?: string): any | Record<string, any> | undefined {
    if (Object.hasOwn(this.config.plugins.data, pluginClassName)) {
      if (key) {
        return this.config.plugins.data[pluginClassName][key]
      }
      return this.config.plugins.data[pluginClassName]
    }
    return undefined
  }
  public setPluginData(pluginClassName: string, data: Record<string, any>): void
  public setPluginData(pluginClassName: string, key: string | Record<string, any>, value?: any): void {
    if (!Object.hasOwn(this.config.plugins.data, pluginClassName)) {
      this.config.plugins.data[pluginClassName] = {}
    }
    if (typeof key == "string") {
      this.config.plugins.data[pluginClassName][key] = value
    }
    else if (typeof key == "object") {
      this.config.plugins.data[pluginClassName] = key
    }
    this._save()
  }
}

const config: Config = new Config("./config.json")
export default config