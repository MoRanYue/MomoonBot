import { CustomEventEmitter as EventEmitter } from "../tools/CustomEventEmitter";
import { CustomEventEmitter } from "src/types/CustomEventEmitter";
import { Plugin, Plugin_ } from "./Plugin";

export class PluginLoader {
  public ev: CustomEventEmitter.PluginLoaderEventEmitter = new EventEmitter()

  private plugins: Plugin[] = []

  constructor() {
    this.ev.on("message", async (ev) => this.plugins.forEach(plugin => {
      plugin.ev.emit("message", ev)
    }))
  }

  public load(pluginClass: typeof Plugin_): Plugin | undefined {
    const plugin = new pluginClass()
    plugin.ev.emit("load")
    this.plugins.push(plugin)

    return plugin
  }

  public unload(name: string): Plugin | undefined {
    for (let i = 0; i < this.plugins.length; i++) {
      const plugin = this.plugins[i];
      
      if (plugin.name == name) {
        plugin.ev.emit("unload")
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
        return plugin
      }
    }
  }

  public loadedPlugins() {
    return this.plugins
  }
}