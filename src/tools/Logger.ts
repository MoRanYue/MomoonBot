import { LoggerEnum } from "../types/enums"
import config from "../config"
import fs from "node:fs"
import path from "node:path"
import { FileUtils } from "./FileUtils"

const logLevels: Record<LoggerEnum.LogLevel, number> = {
  error: 0,
  warning: 1,
  failure: 2,
  success: 3,
  info: 4,
  debug: 100
}
const logLevelNames: Record<LoggerEnum.LogLevel, string> = {
  error: "错误",
  warning: "警告",
  failure: "失败",
  success: "成功",
  info: "信息",
  debug: "调试"
}

export class Logger {
  public readonly file: string = path.join(config.log.path, "latest.log")
  private readonly debugMode: boolean = config.log.debug ?? false
  private readonly level: number = logLevels[config.log.level ?? LoggerEnum.LogLevel.info]
  private prefix?: string

  constructor(prefix?: string) {
    this.prefix = prefix
    
    const folder = path.dirname(this.file)
    try {
      fs.accessSync(folder, fs.constants.F_OK)
    }
    catch (err) {
      if (err) {
        fs.mkdirSync(folder, { recursive: true })
      }
    }
    try {
      fs.accessSync(this.file, fs.constants.F_OK)
    }
    catch (err) {
      if (err) {
        fs.writeFileSync(this.file, "日志创建时间：" + this.formatCurrentTime() + "\n", {
          encoding: "utf-8",
          flag: "w"
        })
      }
    }
  }

  private writeToStdout(content: string): void {
    process.stdout.write(content)
  }
  private writeToFile(content: string, level: LoggerEnum.LogLevel = LoggerEnum.LogLevel.info): void {
    if (logLevels[level] <= this.level) {
      fs.writeFile(this.file, content, {
        encoding: "utf-8",
        flag: "a"
      }, err => {
        if (err) {
          throw err
        }
      })
    }
  }
  public _save(path: string, cb?: Function): void {
    const logFile = FileUtils.readFileWithStream(this.file, "r", "utf-8")
    const savedLogFile = FileUtils.writeFileWithStream(path, "w", "utf-8")
    logFile.pipe(savedLogFile)
    logFile.on("end", () => {
      fs.rmSync(this.file, { force: true })
      if (cb) {
        cb()
      }
    })
  }

  public log(...content: any[]) {
    this.print(content.join(" "))
  }
  public info(...content: any[]) {
    this.log(content.join(" "))
  }
  public warning(...content: any[]) {
    this.print(content.join(" "), LoggerEnum.LogLevel.warning)
  }
  public failure(...content: any[]) {
    this.print(content.join(" "), LoggerEnum.LogLevel.failure)
  }
  public success(...content: any[]) {
    this.print(content.join(" "), LoggerEnum.LogLevel.success)
  }
  public error(...content: any[]) {
    const err: unknown = content[0]
    if (content.length == 1 && err instanceof Error) {
      this.print(`错误：${err.message}\n调用堆栈：\n${err.stack}`, LoggerEnum.LogLevel.error)
      return
    }
    this.print(content.join(" "), LoggerEnum.LogLevel.error)
  }
  public debug(...content: any[]) {
    this.print(content.join(" "), LoggerEnum.LogLevel.debug)
  }
  public print(content: any, level: LoggerEnum.LogLevel = LoggerEnum.LogLevel.info): void {
    if (!this.debugMode && level == LoggerEnum.LogLevel.debug) {
      return
    }

    const time = "[" + this.formatCurrentTime() + "]"
    let log = "[" + logLevelNames[level] + "] "
    if (this.prefix) {
      log += "[" + this.prefix + "] "
    }
    log += content + "\n"
    this.writeToFile(time + log, level)
    switch (level) {
      case LoggerEnum.LogLevel.error:
        return this.writeToStdout(this.controlText(
          LoggerEnum.Color.fDarkGreen, LoggerEnum.Color.bBlue, time, LoggerEnum.Console.removeStyles, 
          LoggerEnum.Color.fRed, LoggerEnum.Color.bBlue, log
        ))

      case LoggerEnum.LogLevel.warning:
        return this.writeToStdout(this.controlText(
          LoggerEnum.Color.fPurple, time, LoggerEnum.Console.removeStyles, 
          LoggerEnum.Color.fYellow, log
        ))

      case LoggerEnum.LogLevel.failure:
        return this.writeToStdout(this.controlText(
          LoggerEnum.Color.bDarkRed, time, LoggerEnum.Console.removeStyles, 
          LoggerEnum.Color.fBlue, LoggerEnum.Color.bDarkRed, log
        ))

      case LoggerEnum.LogLevel.success:
        return this.writeToStdout(this.controlText(
          LoggerEnum.Color.fBlue, time, LoggerEnum.Console.removeStyles, 
          LoggerEnum.Color.fGreen, log
        ))

      case LoggerEnum.LogLevel.debug:
        return this.writeToStdout(this.controlText(
          LoggerEnum.Color.fYellow, time, LoggerEnum.Console.removeStyles, 
          LoggerEnum.Color.fBlue, log
        ))
    
      default:
        return this.writeToStdout(this.controlText(
          LoggerEnum.Color.fBlue, time, LoggerEnum.Console.removeStyles, 
          log
        ))
    }
  }

  public formatCurrentTime(): string {
    const date = new Date()

    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")
    const mileseconds = date.getMilliseconds().toString().padStart(3, "0")

    return year + "年" + month + "月" + day + "日 " + hours + ":" + minutes + ":" + seconds + "." + mileseconds
  }
  
  public cleanUp(): void {
    process.stdout.write(`\x1B[${LoggerEnum.Console.cleanUp}J`)
  }
  public controlText(...content: (string | LoggerEnum.Color | Exclude<LoggerEnum.Console, LoggerEnum.Console.cleanUp>)[]): string {
    let text: string = ""
    content.forEach(seg => {
      if (typeof seg == "number") {
        text += `\x1B[${seg}m`
      }
      else {
        text += seg
      }
    })
    text += `\x1B[${LoggerEnum.Console.removeStyles}m`
  
    return text
  }
}