import { EventEnum, ListenerEnum } from "../types/enums";
import { Plugin } from "../processors/Plugin";
import type { ConnectionContent } from "src/types/connectionContent";
import MessageSegment from "../events/messages/MessageSegment";
import type { Event } from "src/events/Event";
import type { MessageEvent } from "src/events/MessageEvent";
import { MessageUtils } from "../tools/MessageUtils";
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

export default class BuiltInPlugin extends Plugin {
  name: string = "内置插件"
  description: string = "内置插件"
  instruction: string = "内置插件"
  version: string = "1.0.0"

  constructor() {
    super();

    function reportEvent(type: string, ev: MessageEvent) {
      if (ev.messageType == EventEnum.MessageType.group) {
        const group = ev.conn!.getGroup(ev.groupId!)
        if (!group) {
          console.log(`接收到${type}：${ev.raw}（${ev.messageId}） 来自群聊：${ev.groupId} 发送者：${ev.userId}`)
          return
        }
        const member = group.members[ev.userId]
        if (member) {
          console.log(`接收到${type}：${ev.raw}（${ev.messageId}） 来自群聊：${group.name}（${ev.groupId}） 发送者：${member.viewedName}（${ev.userId}）`)
          return
        }
        ev.conn!._addGroupMember({
          groupId: group.id,
          id: ev.userId
        })
        console.log(`接收到${type}：${ev.raw}（${ev.messageId}） 来自群聊：${group.name}（${ev.groupId}） 发送者：${ev.userId}`)
      }
      else if (ev.messageType == EventEnum.MessageType.private) {
        const friend = ev.conn!.getFriend(ev.userId)
        if (friend) {
          console.log(`接收到${type}：${ev.raw}（${ev.messageId}） 来自私聊 发送者：${friend.viewedName}（${ev.userId}）`)
          return 
        }
        console.log(`接收到${type}：${ev.raw}（${ev.messageId}） 来自私聊 发送者：${ev.userId}`)
      }
    }

    this.onMessage("", ev => reportEvent("消息", ev), [], 999)
    this.onCommand("", ev => reportEvent("命令", ev), [], 999)
    this.onNotice("", event => {
      if (event.noticeType == EventEnum.NoticeType.groupRecall) {
        const ev = <GroupRecall>event
        const group = ev.conn!.getGroup(ev.groupId)!
        const user = group.members[ev.userId]
        if (ev.userId == ev.operatorId) {
          console.log(`接收到群聊消息撤回通知：群聊：${group.name}（${ev.groupId}） ${user.viewedName}（${ev.userId}） 撤回消息 ${ev.messageId}`)
          return
        }
        const operator = group.members[ev.operatorId]
        console.log(`接收到群聊消息撤回通知：群聊：${group.name}（${ev.groupId}） ${operator.viewedName}（${ev.operatorId}） 撤回 ${user.viewedName}（${ev.userId}） 的消息 ${ev.messageId}`)
      }

      else if (event.noticeType == EventEnum.NoticeType.friendRecall) {
        const ev = <PrivateRecall>event
        const user = ev.conn!.getFriend(ev.userId)!
        console.log(`接收到私聊消息撤回通知：${user.viewedName}（${ev.userId}） 撤回消息 ${ev.messageId}`)
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
        console.log(`接收到群聊精华消息${operation}通知：群聊：${group.name}（${ev.groupId}） 发送者：${user.viewedName}（${ev.userId}） 消息：${ev.messageId} 操作者：${operator.viewedName}（${ev.operatorId}）`)
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
        console.log(`接收到群聊成员加入通知：群聊：${group.name}（${ev.groupId}） 加入者：${ev.userId ? ev.userId : "未知"} 方式：${method}`)
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
        console.log(`接收到群聊成员退出通知：群聊：${group.name}（${ev.groupId}） 退出者：${ev.userId} 原因：${reason}`)
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
        console.log(`接收到群聊${status}管理员通知：群聊：${group.name}（${ev.groupId}） 管理员：${member.viewedName}（${ev.userId}）`)
      }

      else if (event.noticeType == EventEnum.NoticeType.groupCard) {
        const ev = <GroupCardChange>event
        const group = ev.conn!.getGroup(ev.groupId)!
        const member = group.members[ev.userId]
        console.log(`接收到群聊成员名片修改通知：群聊：${group.name}（${ev.groupId}） 成员：${member.name}（${ev.userId}） 旧名片：${ev.old} 新名片：${ev.new}`)
      }
      
      else if (event.noticeType == EventEnum.NoticeType.groupBan) {
        const ev = <GroupBan>event
        const group = ev.conn!.getGroup(ev.groupId)!
        const member = group.members[ev.userId]
        const operator = group.members[ev.operatorId]
        console.log(`接收到群聊禁言通知：群聊：${group.name}（${ev.groupId}） 被禁言者：${member.viewedName}（${ev.userId}） 操作者：${operator.viewedName}（${ev.operatorId}）${ev.duration ? " 时长：" + ev.duration.toString() + "秒" : ""}`)
      }

      else if (event.noticeType == EventEnum.NoticeType.friendAdd) {
        const ev = <FriendAdd>event
        const friend = ev.conn!.getFriend(ev.userId)!
        console.log(`接收到好友添加通知：好友：${friend.viewedName}（${ev.userId}）`)
      }
    }, 999)

    this.onCommand("echo", (ev, state, args) => {
      ev.quickReply(args.join(" "))
    })
    this.onCommand("throw", (ev) => {
      throw new Error("手动抛出错误")
    })
    this.onCommand("conversation", (ev, state) => {
      console.log("Start Conversation:", ev.userId)
      state.key = "value"
      console.log("State:", state)
    }, undefined, undefined, EventEnum.MessageType.private).receive("needToStore", (ev, state, queue) => {
      state.needToStore = ev.getPlainText()
      state.shouldBeSkipped = true
      console.log("Receiver 0 Event:", ev)
      console.log("Receiver 0 State:", state)
      return ListenerEnum.ReceiverReturn.continue
    }).receive("shouldBeSkipped", () => {
      console.log("Receiver 1 Should Be Skipped")
    }).receive("shouldBeKeepExceptUserSendStop", (ev, state, queue) => {
        if (MessageUtils.matchMessage(ev.getPlainText(), "stop", true)) {
          return ListenerEnum.ReceiverReturn.finish
        }
        console.log("Receiver 2 Keeps Listening Until User Sending Stop")
        return ListenerEnum.ReceiverReturn.keep
    })
  }
}