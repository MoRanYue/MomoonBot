export class WrongEventTypeError extends Error {}
export class WrongMessageTypeError extends Error {}
export class ConnectionIsClosedError extends Error {}

export class ActionFailedError extends Error {
  public action?: string
  public code?: number
  public reason?: string
  public isHttpError: boolean
  
  constructor(action?: string, code?: number, isHttpStatusCode: boolean = false, reason?: string) {
    let message = `动作请求失败：`
    if (action) {
      message += " 动作：" + action
    }
    if (code) {
      if (isHttpStatusCode) {
        message += " HTTP状态码：" + code.toString()
      }
      else {
        message += " 返回代码：" + code.toString()
      }
    }
    if (reason) {
      message += " 原因：" + reason
    }
    super(message)
    
    this.action = action
    this.code = code
    this.reason = reason
    this.isHttpError = isHttpStatusCode
  }
}