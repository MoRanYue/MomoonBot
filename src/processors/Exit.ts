import { Logger } from "../tools/Logger"
import { Worker, isMainThread, MessageChannel, MessagePort, workerData, threadId, parentPort } from "node:worker_threads"

type Task = (complete: () => void) => void | Promise<void>

export class Exit {
  private tasks: Task[] = []
  private isExiting: boolean = false
  private hasExited: boolean = false
  private logger: Logger = new Logger()

  public register(): void {
    process.on("exit", code => this.handle(code))
    process.on("SIGHUP", () => this.handle(129))
    process.on("SIGINT", () => this.handle(130))
    process.on("SIGTERM", () => this.handle(143))
    process.on("SIGBREAK", () => this.handle(149))
  }

  public addTask(cb: Task): void {
    this.tasks.push(cb)
  }
  
  private exit(code: number): void {
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

    const callTasks = async () => {
      this.tasks.forEach(task => {
        if (task.length != 0) {
          asyncTaskCount++
          task(asyncTaskCb)
        }
        else {
          task(() => {})
        }
      })
    }

    this.logger.warning("至多等待10秒，以保证正常退出")
    setTimeout(() => {
      this.logger.warning("正在强制退出进程")
      this.exit(0)
    }, 10000)

    callTasks().then(() => {
      if (asyncTaskCount == 0) {
        this.exit(code)
        return
      }
    }).catch(reason => {
      if (reason) {
        this.logger.error("在退出时出现错误：")
        this.logger.error(reason)
      }
    })
  }
}