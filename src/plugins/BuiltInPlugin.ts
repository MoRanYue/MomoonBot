import { EventEnum } from "../types/enums";
import { Plugin } from "../processors/Plugin";
import type { MessageEvent } from "src/events/MessageEvent";
import type { 
  Essence,
  FriendAdd, 
  GroupAdminChange, 
  GroupBan, 
  GroupCardChange, 
  GroupMemberDecrease, 
  GroupMemberIncrease, 
  GroupRecall,
  PrivateRecall
} from "src/events/NoticeEvent";
import config from "../config";

export default class BuiltInPlugin extends Plugin {
  name: string = "内置插件"
  description: string = "内置插件，不应移除"
  instruction: string = ""
  version: string = "1.0.0"

  constructor() {
    super();
    this.logger.setPrefix("内置插件")

    config.setPluginData(this, {
      autoAddMissingGroupInfo: true,
      autoAddMissingGroupMemberInfo: true
    })
    
    const reportEvent = async (type: string, ev: MessageEvent) => {
      if (ev.isSentBySelf) {
        type = "自发送" + type
      }
      const messageContent: string = ev.getMessageContent()

      if (ev.messageType == EventEnum.MessageType.group) {
        const group = ev.conn!.getGroup(ev.groupId!)
        if (!group) {
          this.logger.info(`接收到${type}：${messageContent}（${ev.messageId}） 来自群聊：${ev.groupId} 发送者：${ev.userId}`)
          if (Object.keys(ev.conn!.getGroups()!).length != 0 && config.getPluginData(this, "autoAddMissingGroupInfo")) {
            ev.conn!._addGroup(ev.groupId!)
          }
          return
        }
        const member = group.members[ev.userId]
        if (member) {
          this.logger.info(`接收到${type}：${messageContent}（${ev.messageId}） 来自群聊：${group.name}（${ev.groupId}） 发送者：${member.viewedName}（${ev.userId}）`)
          return
        }
        if (config.getPluginData(this, "autoAddMissingGroupMemberInfo")) {
          ev.conn!._addGroupMember({
            groupId: group.id,
            id: ev.userId
          })
        }
        this.logger.info(`接收到${type}：${messageContent}（${ev.messageId}） 来自群聊：${group.name}（${ev.groupId}） 发送者：${ev.userId}`)
      }
      else if (ev.messageType == EventEnum.MessageType.private) {
        const friend = ev.conn!.getFriend(ev.userId)
        if (friend) {
          this.logger.info(`接收到${type}：${messageContent}（${ev.messageId}） 来自私聊 发送者：${friend.viewedName}（${ev.userId}）`)
          return 
        }
        this.logger.info(`接收到${type}：${messageContent}（${ev.messageId}） 来自私聊 发送者：${ev.userId}`)
      }
    }

    this.onMessage("", ev => reportEvent("消息", ev), undefined, 999, undefined, undefined, undefined, undefined, undefined, true)
    this.onCommand("", ev => reportEvent("命令", ev), undefined, 999, undefined, undefined, undefined, undefined, undefined, true)
    this.onNotice("", async (event) => {
      if (event.noticeType == EventEnum.NoticeType.groupRecall) {
        const ev = <GroupRecall>event
        const group = ev.conn!.getGroup(ev.groupId)!
        const user = group.members[ev.userId]
        if (ev.userId == ev.operatorId) {
          this.logger.info(`接收到群聊消息撤回通知：群聊：${group.name}（${ev.groupId}） ${user.viewedName}（${ev.userId}） 撤回消息 ${ev.messageId}`)
          return
        }
        const operator = group.members[ev.operatorId]
        this.logger.info(`接收到群聊消息撤回通知：群聊：${group.name}（${ev.groupId}） ${operator.viewedName}（${ev.operatorId}） 撤回 ${user.viewedName}（${ev.userId}） 的消息 ${ev.messageId}`)
      }

      else if (event.noticeType == EventEnum.NoticeType.friendRecall) {
        const ev = <PrivateRecall>event
        const user = ev.conn!.getFriend(ev.userId)!
        this.logger.info(`接收到私聊消息撤回通知：${user.viewedName}（${ev.userId}） 撤回消息 ${ev.messageId}`)
      }

      else if (event.noticeType == EventEnum.NoticeType.essence) {
        const ev = <Essence>event
        const group = ev.conn!.getGroup(ev.groupId)!
        const user = group.members[ev.userId]
        const operator = group.members[ev.operatorId]
        let operation: string = ev.operation
        if (ev.operation == "add") {
          operation = "添加"
        }
        else if (ev.operation == "delete") {
          operation = "移除"
        }
        this.logger.info(`接收到群聊精华消息${operation}通知：群聊：${group.name}（${ev.groupId}） 发送者：${user.viewedName}（${ev.userId}） 消息：${ev.messageId} 操作者：${operator.viewedName}（${ev.operatorId}）`)
      }

      else if (event.noticeType == EventEnum.NoticeType.groupIncrease) {
        const ev = <GroupMemberIncrease>event
        const group = ev.conn!.getGroup(ev.groupId)!
        const operator = group.members[ev.operatorId]
        let method: string = ev.entry
        if (ev.entry == "approve") {
          method = ` ${operator.viewedName}（${ev.operatorId}） 允许加入`
        }
        else if (ev.entry == "invite") {
          method = `被邀请，由 ${operator.viewedName}（${ev.operatorId}） 允许加入`
        }
        this.logger.info(`接收到群聊成员加入通知：群聊：${group.name}（${ev.groupId}） 加入者：${ev.userId || ev.userId > 0 ? ev.userId : "未知"} 方式：${method}`)
      }

      else if (event.noticeType == EventEnum.NoticeType.groupDecrease) {
        const ev = <GroupMemberDecrease>event
        const group = ev.conn!.getGroup(ev.groupId)!
        let reason: string = ev.reason
        if (ev.reason == "leave") {
          reason = "退出群聊"
        }
        else if (ev.reason == "kick") {
          const operator = group.members[ev.operatorId]
          if (operator) {
            reason = `被 ${operator.viewedName}（${ev.operatorId}） 踢出`
          }
          else {
            reason = `被踢出`
          }
        }
        else if (ev.reason == "kick_me") {
          if (ev.operatorId) {
            reason = `自身被 ${ev.operatorId} 踢出`
          }
          else {
            reason = `自身被踢出`
          }
        }
        this.logger.info(`接收到群聊成员退出通知：群聊：${group.name}（${ev.groupId}） 退出者：${ev.userId} 原因：${reason}`)
      }

      else if (event.noticeType == EventEnum.NoticeType.groupAdmin) {
        const ev = <GroupAdminChange>event
        const group = ev.conn!.getGroup(ev.groupId)!
        const member = group.members[ev.userId]
        let status: string = ev.status
        if (ev.status == "set") {
          status = "设置"
        }
        else if (ev.status == "unset") {
          status = "取消"
        }
        this.logger.info(`接收到群聊${status}管理员通知：群聊：${group.name}（${ev.groupId}） 管理员：${member.viewedName}（${ev.userId}）`)
      }

      else if (event.noticeType == EventEnum.NoticeType.groupCard) {
        const ev = <GroupCardChange>event
        const group = ev.conn!.getGroup(ev.groupId)!
        const member = group.members[ev.userId]
        this.logger.info(`接收到群聊成员名片修改通知：群聊：${group.name}（${ev.groupId}） 成员：${member.name}（${ev.userId}） 旧名片：${ev.old} 新名片：${ev.new}`)
      }
      
      else if (event.noticeType == EventEnum.NoticeType.groupBan) {
        const ev = <GroupBan>event
        const group = ev.conn!.getGroup(ev.groupId)!
        const member = group.members[ev.userId]
        const operator = group.members[ev.operatorId]
        this.logger.info(`接收到群聊禁言通知：群聊：${group.name}（${ev.groupId}） 被禁言者：${member.viewedName}（${ev.userId}） 操作者：${operator.viewedName}（${ev.operatorId}）${ev.duration ? " 时长：" + ev.duration.toString() + "秒" : ""}`)
      }

      else if (event.noticeType == EventEnum.NoticeType.friendAdd) {
        const ev = <FriendAdd>event
        const friend = ev.conn!.getFriend(ev.userId)!
        this.logger.info(`接收到好友添加通知：好友：${friend.viewedName}（${ev.userId}）`)
      }
    }, 999)
    
    this.onCommand("echo", (ev, _, args) => ev.reply(args.join(" ")))
  }
}