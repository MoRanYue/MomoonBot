import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter";
import { CustomEventEmitter } from "src/types/CustomEventEmitter";
import { Plugin, Plugin_ } from "./Plugin";
import path from "node:path"
import fs from "node:fs"
import { FileUtils } from "../tools/FileUtils";

export class PluginLoader {
  public ev: CustomEventEmitter.PluginLoaderEventEmitter = new EventEmitter()

  private plugins: Plugin[] = []

  constructor() {
    this.ev.on("message", async (ev) => this.plugins.forEach(plugin => {
      plugin.ev.emit("message", ev)
    }))
    this.ev.on("notice", async (ev) => this.plugins.forEach(plugin => {
      plugin.ev.emit("notice", ev)
    }))
  }

  public load(pluginClass: typeof Plugin_): Plugin | undefined {
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];

      if (plugin instanceof pluginClass) {
        console.error(`插件“${plugin.name}”（类：${pluginClass.name}）可能重复加载或类名重复`)
        return
      }
    }

    const plugin = new pluginClass()
    plugin.ev.emit("load")
    console.log(`成功加载插件“${plugin.name}”（类：${pluginClass.name}）`)
    this.plugins.push(plugin)

    return plugin
  }

  public unload(name: string): Plugin | undefined {
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      
      if (plugin.name == name) {
        plugin.ev.emit("unload")
        console.log(`成功卸载插件“${plugin.name}”`)
        this.plugins.splice(i, 1)
        return plugin
      }
    }
  }

  public reload(name: string): Plugin | undefined {
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      
      if (plugin.name == name) {
        plugin.ev.emit("unload")
        plugin.ev.emit("load")
        console.log(`成功重载插件“${plugin.name}”`)
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
          console.log(`插件“${filePath}”加载错误：`)
          console.error(err)
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
  public loadFromFile(file: string): void {
    fs.lstat(file, async (err, stats) => {
      if (err) {
        console.log(`插件“${file}”加载错误：`)
        console.error(err)
      }

      if (stats.isFile() && file.endsWith(".js")) {
        const name = FileUtils.getFileName(path.basename(file))
        const filePath = path.relative(path.resolve("./src/processors"), file)
        const pluginClass = <typeof Plugin_>(await import(FileUtils.toSlash(filePath))).default.default
        this.load(pluginClass)
      }
      else if (stats.isDirectory()) {
        this.loadFromFolder(file)
      }
    })
  }

  public loadedPlugins() {
    return this.plugins
  }
}