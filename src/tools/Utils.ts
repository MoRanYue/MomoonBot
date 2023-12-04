export class Utils {
  public static splitToArray(data: string): string[] {
    return data.split(/, */)
  }

  public static dataToJson(data: any) {
    return JSON.stringify(data)
  }

  public static jsonToData(json: string) {
    return JSON.parse(json)
  }

  public static randomInt(min?: number, max?: number): number {
    if (min) {
      if (max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
      }

      return Math.floor(Math.random() * min + 1)
    }

    return 0
  }
}