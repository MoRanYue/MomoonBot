import type { Plugin_ } from './processors/Plugin'
import { FileUtils } from './tools/FileUtils'
import { Logger } from './tools/Logger'
import { Utils } from './tools/Utils'
import { Configuration } from './types/configuration'
import { ConfigEnum, LoggerEnum } from './types/enums'
import fs from "node:fs"
import path from 'node:path'

type Validation = Record<string, string | string[]>
/**
 * 配置文件类
 * @since 0.7.0
 */
export class Config {
  private readonly version: number = 1
  private filePath: string
  private config: Configuration

  constructor(filePath: string = "./config.json") {
    if (FileUtils.getExtendedName(filePath)?.toLowerCase() != ".json") {
      throw new Error("文件类型不正确，应为 JSON 文件")
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

  /**
   * 检验配置文件内容
   * @param config 配置文件内容
   * @returns 是否完全检验成功
   */
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
  /**
   * 检验配置文件中的内容是否正确
   * @param target 被检验的内容
   * @param keys 将要检验的类型
   * @returns 检验是否成功
   */
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
  /**
   * 检验单个配置文件值
   * @param target 被检验的内容
   * @param type 将要检验的类型
   * @returns 检验是否成功
   */
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

  /**
   * 保存配置文件
   * @param cb 保存完成后将执行的回调函数
   */
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

  /**
   * 获取配置文件内容
   * @returns 配置文件内容
   */
  public getConfig(): Configuration {
    return this.config
  }
  /**
   * 获取默认配置文件内容
   * @returns 默认配置文件内容
   */
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
          prompt: ["!", "！", ".", "。", "#"],
          separator: [" "],
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

  /**
   * 获取插件数据
   * @param plugin 将获取数据的插件
   * @param key 配置文件中，该插件存储数据的键
   * @returns 若取得，则为数据，否则为未定义
   */
  public getPluginData(plugin: string | Plugin_): Record<string, any> | undefined
  public getPluginData(plugin: string | Plugin_, key: string): any | undefined
  public getPluginData(plugin: string | Plugin_, key?: string): any | Record<string, any> | undefined {
    if (typeof plugin == "object") {
      plugin = plugin.constructor.name
    }

    if (Object.hasOwn(this.config.plugins.data, plugin)) {
      if (key) {
        return this.config.plugins.data[plugin][key]
      }
      return this.config.plugins.data[plugin]
    }
    return undefined
  }

  /**
   * 设置插件数据
   * @param plugin 将获取数据的插件
   * @param data 插件数据
   * @returns 存储后，该插件的数据
   */
  public setPluginData(plugin: string | Plugin_, data: Record<string, any>): Record<string, any>
  /**
   * 设置插件数据
   * @param plugin 将获取数据的插件
   * @param key 将要存储的键
   * @param value 将要存储的值
   * @returns 存储后，该插件的数据
   */
  public setPluginData(plugin: string | Plugin_, key: string, value: any): Record<string, any>
  /**
   * 设置插件数据
   * @param plugin 将获取数据的插件
   * @param key 将要存储的键
   * @param value 将要存储的值
   * @returns 存储后，该插件的数据
   */
  public setPluginData(plugin: string | Plugin_, key: string | Record<string, any>, value?: any): Record<string, any> {
    if (typeof plugin == "object") {
      plugin = plugin.constructor.name
    }

    if (!Object.hasOwn(this.config.plugins.data, plugin)) {
      this.config.plugins.data[plugin] = {}
    }
    if (typeof key == "string") {
      this.config.plugins.data[plugin][key] = value
    }
    else if (typeof key == "object") {
      this.config.plugins.data[plugin] = key
    }
    this._save()

    return this.config.plugins.data[plugin]
  }
}

const config: Config = new Config("./config.json")
export default config