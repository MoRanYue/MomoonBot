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
}