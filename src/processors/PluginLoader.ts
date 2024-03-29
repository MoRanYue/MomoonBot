import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter";
import { CustomEventEmitter } from "src/types/CustomEventEmitter";
import { Plugin, Plugin_ } from "./Plugin";
import path from "node:path"
import fs from "node:fs"
import { FileUtils } from "../tools/FileUtils";
import { Logger } from "../tools/Logger";
import { FriendRequest, GroupRequest } from "../events/RequestEvent";
import { GroupMemberDecrease, GroupMemberIncrease } from "../events/NoticeEvent";
import config from "../config";

export class PluginLoader {
  public ev: CustomEventEmitter.PluginLoaderEventEmitter = new EventEmitter()
  private logger: Logger = new Logger("插件加载器")
  private plugins: Plugin[] = []

  /**
   * 无论如何设置配置文件，类名为其中的插件不应该被关闭
   */
  private builtInPluginClassNames: string[] = [
    "BuiltInPlugin"
  ]

  constructor() {
    this.ev.on("message", async (ev) => this.plugins.forEach(plugin => plugin.ev.emit("message", ev)))
    this.ev.on("notice", async (ev) => {
      // 将UID转为用户ID
      if ((ev instanceof GroupMemberIncrease || ev instanceof GroupMemberDecrease) && ev.userId < 1) {
        ev.client.getUserId([ev.userUid, ev.operatorUid], userIds => {
          ev.userId = userIds[ev.userUid]
          ev.operatorId = userIds[ev.operatorUid]
          this.ev.emit("notice", ev)
        })
      }
      else {
        this.plugins.forEach(plugin => plugin.ev.emit("notice", ev))
      }
    })
    this.ev.on("request", async (ev) => {
      // 将UID转为用户ID
      if ((ev instanceof FriendRequest || ev instanceof GroupRequest) && ev.userId < 1) {
        ev.client.getUserId(ev.userUid, userIds => {
          ev.userId = userIds[ev.userUid]
          this.ev.emit("request", ev)
        })
      }
      else {
        this.plugins.forEach(plugin => plugin.ev.emit("request", ev))
      }
    })
  }

  public load(pluginClass: typeof Plugin_): Plugin | undefined {
    const enabled: boolean | undefined | null = config.getPluginData(pluginClass.name, "_enable")
    if ((typeof enabled == "boolean" && !enabled) && !this.builtInPluginClassNames.includes(pluginClass.name)) {
      this.logger.warning(`插件“${pluginClass.name}”在配置文件中被关闭，将不会被加载`)
      return
    }

    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];

      if (plugin instanceof pluginClass) {
        this.logger.error(`插件“${plugin.name}”（类：${pluginClass.name}）可能重复加载或类名重复`)
        return
      }
    }

    const plugin = new pluginClass()
    plugin.ev.emit("load")
    this.logger.success(`成功加载插件“${plugin.name}”（类：${pluginClass.name}）`)
    this.plugins.push(plugin)

    return plugin
  }

  public unload(name: string): Plugin | undefined {
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      
      if (plugin.name == name) {
        plugin.ev.emit("unload", () => {})
        this.logger.success(`成功卸载插件“${plugin.name}”`)
        this.plugins.splice(i, 1)
        return plugin
      }
    }
  }
  public unloadAll(cb?: VoidFunction): void {
    let completedPluginCount: number = this.plugins.length
    const complete = () => {
      completedPluginCount--
      if (cb && completedPluginCount == 0) {
        cb()
      }
    }

    this.plugins.forEach(plugin => {
      if (!plugin.ev.emit("unload", complete)) {
        complete()
      }
    })
  }

  public reload(name: string): Plugin | undefined {
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      
      if (plugin.name == name) {
        plugin.ev.emit("unload")
        plugin.ev.emit("load")
        this.logger.success(`成功重载插件“${plugin.name}”`)
        return plugin
      }
    }
  }

  public loadFromFolder(folder: string): void {
    const folderPath = path.relative(path.resolve("./src/processors"), folder)
    fs.readdirSync(folder).forEach(plugin => {
      const filePath = path.join(folder, plugin)
      fs.lstat(filePath, async (err, stats) => {
        if (err) {
          this.logger.failure(`插件“${filePath}”加载错误：`)
          this.logger.error(err)
        }

        if (stats.isFile() && plugin.endsWith(".js")) {
          const name = FileUtils.getFileName(plugin)
          const pluginClass = <typeof Plugin_>(await import(FileUtils.toSlash(path.join(folderPath, plugin)))).default.default
          this.load(pluginClass)
        }
        else if (stats.isDirectory()) {
          const pluginClass = <typeof Plugin_>(await import(FileUtils.toSlash(path.join(folderPath, plugin, "index.js")))).default.default
          this.load(pluginClass)
        }
      })
    })
  }
  public loadPlugin(pluginPath: string): void {
    fs.lstat(pluginPath, async (err, stats) => {
      if (err) {
        this.logger.failure(`插件“${pluginPath}”加载错误：`)
        this.logger.error(err)
      }

      if (stats.isFile() && pluginPath.endsWith(".js")) {
        const name = FileUtils.getFileName(path.basename(pluginPath))
        const filePath = path.relative(path.resolve("./src/processors"), pluginPath)
        const pluginClass = <typeof Plugin_>(await import(FileUtils.toSlash(filePath))).default.default
        this.load(pluginClass)
      }
      else if (stats.isDirectory()) {
        this.loadFromFolder(pluginPath)
      }
    })
  }

  public loadedPlugins() {
    return this.plugins
  }
}