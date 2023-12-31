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
    return config.getConfig().listener.settings.superusers.includes(id)
  }
  public static groupRoleToPermission(role: "owner" | "admin" | "member"): ListenerEnum.Permission {
    switch (role) {
      case "owner":
        return ListenerEnum.Permission.owner

      case "admin":
        return ListenerEnum.Permission.admin
    
      default:
        return ListenerEnum.Permission.user
    }
  }
  public static userToPermission(id: number, role: "owner" | "admin" | "member"): ListenerEnum.Permission {
    return ListenerUtils.isSuperuser(id) ? ListenerEnum.Permission.superuser : ListenerUtils.groupRoleToPermission(role)
  }
}