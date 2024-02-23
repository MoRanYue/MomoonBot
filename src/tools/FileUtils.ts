import fs from "node:fs"
import path from "node:path"

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

  public static getFileName(file: string): string {
    return file.substring(0, file.lastIndexOf("."))
  }
  public static getExtendedName(file: string): string | undefined {
    const fileName = path.basename(file)
    if (!fileName.includes(".")) {
      return undefined
    }
    return fileName.substring(fileName.lastIndexOf("."))
  }
  public static toSlash(path: string): string {
    return path.replaceAll("\\", "/")
  }
  public static toBase64(file: string | Buffer): string {
    let content: string
    if (typeof file == "string") {
      if (file.startsWith("base64://")) {
        content = file
      }
      else {
        content = Buffer.from(file, "utf-8").toString("base64url")
      }
    }
    else {
      content = file.toString("base64url")
    }
    return content
  }
}