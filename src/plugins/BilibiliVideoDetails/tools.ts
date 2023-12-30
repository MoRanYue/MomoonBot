export class Tools {
  public static formatSecondTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000)

    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    const seconds = date.getSeconds().toString().padStart(2, "0")

    return year + "年" + month + "月" + day + "日 " + hours + ":" + minutes + ":" + seconds
  }
  public static formatSeconds(seconds: number): string {
    const h = Math.floor(seconds / 3600 % 24)
    const min = Math.floor(seconds / 60 % 60)
    const s = Math.floor(seconds % 60)

    return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }
}