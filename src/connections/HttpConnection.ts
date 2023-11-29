import { Connection } from "./Connection";
import http from "node:http"
import url from "node:url"

export class HttpConnection extends Connection {
  declare protected server: http.Server
  public clientAddresses: string[] = []

  public createServer(port: number): this
  public createServer(port: number, host?: string): this
  public createServer(port: number, host?: string, cb?: () => void): this {
    this.server = http.createServer()
    
    const self = this
    this.server.on("request", (req: http.IncomingMessage, res: http.Response) => self.receiveRequest(req, res, async (req, res) => {
      console.log("Received Req", JSON.stringify(JSON.parse(req.body))))
      
      self.ev.emit("nessage", JSON.parse(req.body))
    }))
    
    this.server.listen(port, host ?? "0.0.0.0", cb ?? undefined)

    return this
  }

  public connect(): never {
    throw new Error('未实现')
  }

  public send(): void {
    this.clientAddresses.forEach(address => {
      http.request(address, this.receivePacket)
    })
  }
  
  private receiveRequest(req: http.IncomingMessage, res: http.Response, cb: (req: http.IncomingMessage, res: http.Response) => void) {
    req.query = new url.URL(req.url).searchParams
  
    if (req.method.toLowerCase() == "post") {
      let data: string = ""
      req.on("data", async (chunk: string) => data += chunk)
      req.on("end", () => {
        req.body = data
        cb(req, res)
      })
    }
    else {
      cb(req, res)
    }
  }

  private async receivePacket(res: http.IncomingMessage): Promise<void> {
    res.setEncoding('utf-8')

    const data: any[] = []

    res.on('data', chunk => data.push(chunk))
    res.on('error', err => {
      throw err
    })
    res.on('end', () => this.ev.emit('data', data))
  }
}
