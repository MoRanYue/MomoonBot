import { ListenerEnum } from "../types/enums";
import config from "../config";

const permissionLevels: Record<ListenerEnum.Permission, number> = {
  superuser: 100,
  owner: 2,
  admin: 1,
  user: 0
}

export class ListenerUtils {
  public static comparePermission(a: ListenerEnum.Permission, b: ListenerEnum.Permission): boolean {
    return permissionLevels[a] >= permissionLevels[b]
  }
  public static isSuperuser(id: number): boolean {
    return config.listener.settings.superusers.includes(id)
  }
}