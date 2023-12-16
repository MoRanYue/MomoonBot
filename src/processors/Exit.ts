import { Logger } from "../tools/Logger"

export class Exit {
  private tasks: ((complete?: () => void) => void | Promise<void>)[] = []
  private isExiting: boolean = false
  private hasExited: boolean = false
  private logger: Logger = new Logger()

  public register() {
    process.on("exit", code => this.handle(code))
    process.on("SIGHUP", () => this.handle(129))
    process.on("SIGINT", () => this.handle(130))
    process.on("SIGTERM", () => this.handle(143))
    process.on("SIGBREAK", () => this.handle(149))
  }

  public addTask(cb: ((complete?: () => void) => void | Promise<void>)): void {
    this.tasks.push(cb)
  }
  
  private exit(code: number) {
    if (this.hasExited) {
      return
    }
    this.hasExited = true
    process.nextTick(() => process.exit(code))
  }
  private handle(code: number): void {
    if (this.isExiting) {
      return
    }
    this.isExiting = true

    let asyncTaskCount: number = 0
    const asyncTaskCb = () => {
      process.nextTick(() => {
        asyncTaskCount--
        if (asyncTaskCount == 0) {
          this.exit(code)
        }
      })
    }

    this.tasks.forEach(task => {
      if (task.length != 0) {
        asyncTaskCount++
        task(asyncTaskCb)
      }
      else {
        task()
      }
    })

    if (asyncTaskCount > 0) {
      this.logger.warning("等待以保证正常退出")
      setTimeout(() => this.exit(code), 10000)
      return
    }
    this.exit(code)
  }
}