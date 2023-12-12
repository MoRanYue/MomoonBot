import type { DataType } from "src/types/dataType";
import type { Event } from "src/events/Event";
import type { MessageEvent } from "src/events/MessageEvent";
import type { NoticeEvent } from "src/events/NoticeEvent";
import { EventEnum, ListenerEnum } from "../types/enums";
import { Conversation } from "./Conversation";
import { ListenerUtils } from "../tools/ListenerUtils";
import { isPromise } from "node:util/types";
import { MessageUtils } from "../tools/MessageUtils";

abstract class Listener {
  public priority!: number
  public block!: boolean
  protected abstract callback: Function
  protected abstract patterns: any[]

  public abstract trigger(ev: Event): void | Promise<void>
}

class MessageListener extends Listener {
  protected callback: DataType.ListenedMessageFunc;
  protected patterns: DataType.ListenedMessage[] = []
  protected checkers: DataType.Checker[]
  protected permission: ListenerEnum.Permission
  protected messageType: DataType.MessageTypeChecker
  protected usage?: string
  protected ignoreCase?: boolean

  protected receivers: DataType.ListenerReceiverData<DataType.ListenedMessageReceiverFunc>[] = []
  protected conversations: Record<number, Conversation> = {}

  constructor(pattern: DataType.ListenedMessage[], cb: DataType.ListenedMessageFunc, priority: number = 0, permission: ListenerEnum.Permission = ListenerEnum.Permission.user, 
  messageType: DataType.MessageTypeChecker = "all", checkers: DataType.Checker | DataType.Checker[] = [], block: boolean = false, ignoreCase: boolean = true, usage?: string) {
    super()

    this.patterns = pattern
    this.callback = cb
    this.priority = priority
    this.permission = permission
    this.messageType = messageType
    if (Array.isArray(checkers)) {
      this.checkers = checkers
    }
    else {
      this.checkers = [checkers]
    }
    this.block = block
    this.usage = usage
    this.ignoreCase = ignoreCase
  }

  public trigger(ev: MessageEvent) {
    if (ev.messageType != this.messageType && this.messageType != "all") {
      return
    }
    if (ev.messageType == EventEnum.MessageType.group) {
      const userPermission = ev.conn!.getGroup(ev.groupId!).members[ev.userId].permission
      if (!ListenerUtils.comparePermission(userPermission, this.permission)) {
        return
      }
    }
    else {
      const userPermission = ev.conn!.getFriend(ev.userId).permission
      if (!ListenerUtils.comparePermission(userPermission, this.permission)) {
        return
      }
    }
    for (let i = 0; i < this.checkers.length; i++) {
      if (!this.checkers[i](ev)) {
        return
      }
    }

    if (Object.hasOwn(this.conversations, ev.userId)) {
      const conversation = this.conversations[ev.userId]
      conversation.append(ev)

      const status = this.processReceiver(conversation, conversation.lastStatus, conversation.step, ev)
      conversation.lastStatus = status
      if (status == ListenerEnum.ReceiverReturn.keep) {
        conversation.step--
      }
      else if (status == ListenerEnum.ReceiverReturn.finish || conversation.step >= this.receivers.length - 1) {
        delete this.conversations[conversation.initiatorId]
      }

      return
    }

    const plainText = ev.getPlainText()
    for (let i = 0; i < this.patterns.length; i++) {
      const pattern = this.patterns[i];
      
      if (MessageUtils.matchMessage(plainText, pattern, this.ignoreCase)) {
        if (this.receivers.length > 0) {
          const conversation = new Conversation(ev)
          this.conversations[ev.userId] = conversation
    
          /*
          继续 = false | void
          完成 = true
          */
          if (isPromise(this.callback)) {
            (<Promise<boolean | void>>this.callback(ev, conversation.state)).then(v => this.processReceiver(conversation, v, conversation.step))
          }
          else {
            this.processReceiver(conversation, <boolean | void>this.callback(ev, conversation.state), conversation.step)
          }
    
          return 
        }
        this.callback(ev, {})
        return 
      }
    }
  }

  private processReceiver(conversation: Conversation, nextStatus: void | boolean | ListenerEnum.ReceiverReturn, receiverIndex: number, ev?: MessageEvent): void | ListenerEnum.ReceiverReturn {
    if ((typeof nextStatus == "boolean" && nextStatus) || 
    (typeof nextStatus == "number" && nextStatus == ListenerEnum.ReceiverReturn.finish)) {
      delete this.conversations[conversation.initiatorId]
      return
    }
    
    const receiver = this.receivers[receiverIndex]
    if (!Object.hasOwn(conversation.state, receiver.storedKey)) {
      if (ev) {
        conversation.step++
        return receiver.cb(ev, conversation.state, conversation.messageQueue)
      }
    }
  }

  public receive(storedKey: string, cb: DataType.ListenedMessageReceiverFunc): this {
    this.receivers.push({
      storedKey,
      cb
    })

    return this
  }

  public get instruction(): string | undefined {
    return this.usage
  }
}

class CommandListener extends Listener {
  protected patterns: DataType.ListenedMessage[];
  protected callback: DataType.ListenedCommandFunc;
  protected checkers: DataType.Checker[]
  protected permission: ListenerEnum.Permission
  protected messageType: DataType.MessageTypeChecker
  protected usage?: string
  protected ignoreCase?: boolean

  protected receivers: DataType.ListenerReceiverData<DataType.ListenedMessageReceiverFunc>[] = []
  protected conversations: Record<number, Conversation> = {}

  constructor(pattern: DataType.ListenedMessage[], cb: DataType.ListenedCommandFunc, priority: number = 0, permission: ListenerEnum.Permission = ListenerEnum.Permission.user, 
  messageType: DataType.MessageTypeChecker = "all", checkers: DataType.Checker | DataType.Checker[] = [], block: boolean = false, ignoreCase: boolean = true, usage?: string) {
    super()

    this.patterns = pattern
    this.callback = cb
    this.priority = priority
    this.permission = permission
    this.messageType = messageType
    if (Array.isArray(checkers)) {
      this.checkers = checkers
    }
    else {
      this.checkers = [checkers]
    }
    this.block = block
    this.usage = usage
    this.ignoreCase = ignoreCase
  }

  public trigger(ev: MessageEvent) {
    if (ev.messageType != this.messageType && this.messageType != "all") {
      return
    }
    if (ev.messageType == EventEnum.MessageType.group) {
      const userPermission = ev.conn!.getGroup(ev.groupId!).members[ev.userId].permission
      if (!ListenerUtils.comparePermission(userPermission, this.permission)) {
        return
      }
    }
    else {
      const userPermission = ev.conn!.getFriend(ev.userId).permission
      if (!ListenerUtils.comparePermission(userPermission, this.permission)) {
        return
      }
    }
    for (let i = 0; i < this.checkers.length; i++) {
      if (!this.checkers[i](ev)) {
        return
      }
    }

    if (Object.hasOwn(this.conversations, ev.userId)) {
      const conversation = this.conversations[ev.userId]
      conversation.append(ev)

      const status = this.processReceiver(conversation, conversation.lastStatus, conversation.step, ev)
      conversation.lastStatus = status
      if (status == ListenerEnum.ReceiverReturn.keep) {
        conversation.step--
      }
      else if (status == ListenerEnum.ReceiverReturn.finish || conversation.step >= this.receivers.length - 1) {
        delete this.conversations[conversation.initiatorId]
      }

      return
    }

    const plainText = ev.getPlainText()
    for (let i = 0; i < this.patterns.length; i++) {
      const pattern = this.patterns[i];

      const maybeArgs = MessageUtils.matchCommand(plainText, pattern, this.ignoreCase)
      if (maybeArgs) {
        if (this.receivers.length > 0) {
          const conversation = new Conversation(ev)
          this.conversations[ev.userId] = conversation
          
          if (isPromise(this.callback)) {
            (<Promise<boolean | void>>this.callback(ev, conversation.state, maybeArgs)).then(v => this.processReceiver(conversation, v, conversation.step))
          }
          else {
            this.processReceiver(conversation, <boolean | void>this.callback(ev, conversation.state, maybeArgs), conversation.step)
          }
    
          return 
        }
        this.callback(ev, {}, maybeArgs)
        return 
      }
    }
  }

  private processReceiver(conversation: Conversation, nextStatus: void | boolean | ListenerEnum.ReceiverReturn, receiverIndex: number, ev?: MessageEvent): void | ListenerEnum.ReceiverReturn {
    if ((typeof nextStatus == "boolean" && nextStatus) || 
    (typeof nextStatus == "number" && nextStatus == ListenerEnum.ReceiverReturn.finish)) {
      delete this.conversations[conversation.initiatorId]
      return
    }
    
    const receiver = this.receivers[receiverIndex]
    if (!Object.hasOwn(conversation.state, receiver.storedKey)) {
      if (ev) {
        conversation.step++
        return receiver.cb(ev, conversation.state, conversation.messageQueue)
      }
    }
  }

  public receive(storedKey: string, cb: DataType.ListenedMessageReceiverFunc): this {
    this.receivers.push({
      storedKey,
      cb
    })

    return this
  }
  
  public get instruction(): string | undefined {
    return this.usage
  }
  
}

class NoticeListener extends Listener {
  protected callback: DataType.ListenedNoticeFunc;
  protected patterns: DataType.ListenedNotice[]
  protected checkers: DataType.NoticeChecker[]

  constructor(notices: DataType.ListenedNotice | DataType.ListenedNotice[], cb: DataType.ListenedNoticeFunc, priority: number = 0, 
  checkers: DataType.NoticeChecker | DataType.NoticeChecker[] = [], block: boolean = false) {
    super();

    if (Array.isArray(notices)) {
      this.patterns = notices
    }
    else {
      this.patterns = [notices]
    }
    this.callback = cb
    this.priority = priority
    this.block = block
    if (Array.isArray(checkers)) {
      this.checkers = checkers
    }
    else {
      this.checkers = [checkers]
    }
  }

  public trigger(ev: NoticeEvent): void | Promise<void> {
    if (!(this.patterns.includes(ev.noticeType) || (ev.notifyType && this.patterns.includes(ev.notifyType)))) {
      return
    }
    for (let i = 0; i < this.checkers.length; i++) {
      if (!this.checkers[i](ev)) {
        return
      }
    }

    this.callback(ev)
  }
}

export {
  Listener, MessageListener, CommandListener, NoticeListener
}