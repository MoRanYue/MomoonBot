import { HttpConnection } from "../connections/HttpConnection"
import type { Connection } from "../connections/Connection"
import type { SupportedProtocol, ConnectionType } from "../types/config.d.ts"
import config from "../config"

export class Launcher {
  protected connections: Connection[] = []

  public launch() {
    console.log("正在尝试启动")
    
    config.connections.forEach(conn => {
      console.log(`尝试启动 ${conn.type} 服务器`)
      
      this.connections.push(this.launchConnection(<ConnectionType>conn.type, conn.server.port, conn.server.host))
    })
    
    console.log("启动完毕")
  }
  
  private launchConnection(type: ConnectionType, port: number, host?: string) {
    switch (type) {
      case "http":
        const connection = new HttpConnection()
        connection.createServer(port, host)
        
        return connection
      
      default:
        throw new Error("不支持的连接类型")
    }
  }
}