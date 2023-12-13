import { EventEnum, ListenerEnum } from "../types/enums";
import { Plugin } from "../processors/Plugin";
import type { ConnectionContent } from "src/types/connectionContent";
import MessageSegment from "../events/messages/MessageSegment";
import type { Event } from "src/events/Event";
import type { MessageEvent } from "src/events/MessageEvent";
import { MessageUtils } from "../tools/MessageUtils";
import type { FriendAdd, GroupAdminChange, GroupCardChange, GroupMemberDecrease, GroupMemberIncrease } from "src/events/NoticeEvent";

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
          console.log(`接收到${type}：${ev.raw} 来自群聊：${ev.groupId} 发送者：${ev.userId}`)
          return
        }
        const member = group.members[ev.userId]
        if (!member) {
          console.log(`接收到${type}：${ev.raw} 来自群聊：${group.name}（${ev.groupId}） 发送者：${ev.userId}`)
          return
        }
        console.log(`接收到${type}：${ev.raw} 来自群聊：${group.name}（${ev.groupId}） 发送者：${member.viewedName}（${ev.userId}）`)
      }
      else if (ev.messageType == EventEnum.MessageType.private) {
        const friend = ev.conn!.getFriend(ev.userId)
        if (!friend) {
          console.log(`接收到${type}：${ev.raw} 来自私聊 发送者：${ev.userId}`)
          return 
        }
        console.log(`接收到${type}：${ev.raw} 来自私聊 发送者：${friend.viewedName}（${ev.userId}）`)
      }
    }

    this.onMessage("", ev => reportEvent("消息", ev), [], 999)
    this.onCommand("", ev => reportEvent("命令", ev), [], 999)
    this.onNotice(EventEnum.NoticeType.groupIncrease, event => {
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
      console.log(`接收到群聊成员加入通知：群聊：${group.name}（${ev.groupId}） 加入者：${ev.userId} 方式：${method}`)
    }, 999)
    this.onNotice(EventEnum.NoticeType.groupDecrease, event => {
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
        reason = `自身被 ${ev.operatorId} 踢出`
      }
      console.log(`接收到群聊成员退出通知：群聊：${group.name}（${ev.groupId}） 退出者：${ev.userId} 原因：${reason}`)
    }, 999)
    this.onNotice(EventEnum.NoticeType.groupAdmin, event => {
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
      console.log(`接受到群聊${status}管理员通知：群聊：${group.name}（${ev.groupId}） 管理员：${member.viewedName}（${ev.userId}）`)
    }, 999)
    this.onNotice(EventEnum.NoticeType.groupCard, event => {
      const ev = <GroupCardChange>event
      const group = ev.conn!.getGroup(ev.groupId)!
      const member = group.members[ev.userId]
      console.log(`接受到群聊成员名片修改通知：成员：${member.name}（${ev.userId}） 旧名片：${ev.old} 新名片：${ev.new}`)
    }, 999)
    this.onNotice(EventEnum.NoticeType.friendAdd, event => {
      const ev = <FriendAdd>event
      const friend = ev.conn!.getFriend(ev.userId)!
      console.log(`接受到好友添加通知：好友：${friend.viewedName}（${ev.userId}）`)
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