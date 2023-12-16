import fs from "node:fs"

export class FileUtils {
  public static createFolderIfNotExists(path: string) {
    fs.stat(path, (err, stats) => {
      if (!stats) {
        fs.mkdir(path, {
          recursive: true
        }, err => {
          if (err) {
            throw err
          }
        })
      }
    })
  }

  public static writeFileWithStream(path: string, flags: string = "w", encoding?: BufferEncoding, mode?: number): fs.WriteStream {
    return fs.createWriteStream(path, {
      encoding,
      flags,
      mode
    })
  }
  public static readFileWithStream(path: string, flags: string = "r", encoding?: BufferEncoding, mode?: number): fs.ReadStream {
    return fs.createReadStream(path, {
      encoding,
      flags,
      mode
    })
  }

  public static getFileName(path: string): string {
    return path.substring(0, path.lastIndexOf("."))
  }
  public static toSlash(path: string): string {
    return path.replaceAll("\\", "/")
  }
}