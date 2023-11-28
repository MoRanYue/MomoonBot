export class Utils {
  public static splitToArray(data: string): string[] {
    return data.split(/, */)
  }
}