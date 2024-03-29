import type { ConnectionEnum, EventEnum } from "./enums"
import type { MessageSegment } from "./message"

export namespace ConnectionContent {
  namespace Connection {
    interface Response<T> {
      status: ConnectionEnum.ResponseStatus
      retcode: ConnectionEnum.ResponseCode
      message: string
      wording: string
      data: T
      echo: string
    }
    interface WsRequestDetector {
      platform: "Momoon Bot"
      version: string
      id: string
    }
    interface WsRequest<T> {
      action: ConnectionEnum.Action
      params: T
      echo: WsRequestDetector & string
    }
  }

  namespace Response {
    interface HttpCallback {
      echo: string
    }
  }

  namespace Params {
    interface SetQqProfile {
      nickname: string
      company: string
      email: string
      college: string
      personal_note: string
      age: number
      birthday: string
    }
    interface GetModelShow {
      model: string
    }
    interface GetLoginInfo {
      user_id: number
      nickname: string
    }
    interface SetModelShow {
      model: string
      manu: string
    }
    interface GetOnlineClients {
      no_cache: boolean
    }
    interface GetStrangerInfo {
      user_id: number
    }
    interface GetUserInfo {
      user_id: number
    }
    interface GetNotJoinedGroupInfo {
      group_id: number
    }
    interface GetGroupInfo {
      group_id: number
    }
    interface GetUinByUid {
      uid_list: string[]
    }
    interface GetUid {
      uin_list: number[]
    }
    interface GetGroupMemberInfo {
      group_id: number
      user_id: number
    }
    interface GetGroupMemberList {
      group_id: number
    }
    interface GetGroupHonorInfo {
      group_id: number
    }
    interface GetEssenceMsgList {
      group_id: number
    }
    interface SendLike {
      times: number
      user_id: number
    }
    interface IsBlacklistUin {
      user_id: number
    }
    interface DeleteFriend {
      user_id: number
    }
    interface DeleteUnidirectionalFriend {
      user_id: number
    }
    interface DeleteMsg {
      message_id: number
    }
    interface SendPrivateMsg {
      user_id: number
      message: MessageSegment.Segment | MessageSegment.Segment[] | string
      auto_escape?: boolean
      recall_duration?: number
    }
    interface SendGroupMsg {
      group_id: number
      message: MessageSegment.Segment | MessageSegment.Segment[] | string
      auto_escape?: boolean
      recall_duration?: number
    }
    interface SendMsg {
      message_type: EventEnum.MessageType
      user_id: number
      group_id?: number
      discuss_id?: number
      message: MessageSegment.Segment | MessageSegment.Segment[] | string
      auto_escape?: boolean
      recall_duration?: number
    }
    /**
     * 通过 Res Id 发送消息
     * @description OpenShamrock 实验性接口
     */
    interface SendMsgByResId {
      resid: string
      peer: number
      message_type: EventEnum.MessageType
    }
    interface GetMsg {
      message_id: number
    }
    interface GetHistoryMsg {
      message_type: EventEnum.MessageType
      user_id?: number
      group_id?: number
      count?: number
      message_seq?: number
    }
    interface GetGroupHistoryMsg {
      group_id: number
      count: number
      message_seq: number
    }
    interface ClearMsgs {
      message_type: EventEnum.MessageType
      user_id?: number
      group_id?: number
    }
    interface GetForwardMsg {
      id: string
    }
    interface ReferenceForwardMessageDataItem {
      id: string
    }
    interface CustomForwardMessageDataItem {
      name: string
      content: MessageSegment.Segment[]
    }
    interface CustomForwardMessageNode {
      type: "node"
      data: CustomForwardMessageDataItem
    }
    interface ReferenceForwardMessageNode {
      type: "node"
      data: ReferenceForwardMessageDataItem
    }
    interface MixedForwardMessageNode {
      type: "node"
      data: ReferenceForwardMessageItem | CustomForwardMessageDataItem
    }
    interface SendGroupForwardMsg {
      group_id: number
      messages: MixedForwardMessageNode[]
    }
    interface SendPrivateForwardMsg {
      user_id: number
      messages: MixedForwardMessageNode[]
    }
    interface GetImage {
      file: string
    }
    interface OcrImage {
      image: string
    }
    interface GetRecord {
      file: string
      out_format: string
    }
    interface SetFriendAddRequest {
      flag: string
      approve: boolean
      remark: string
    }
    interface SetGroupAddRequest {
      flag: string
      sub_type: "add" | "invite"
      type?: "add" | "invite"
      approve: boolean
      reason?: string
    }
    interface SetGroupName {
      group_id: number
      group_name: string
    }
    interface SetGroupPortrait {
      group_id: number
      file: string
      cache?: 1 | 0
    }
    interface SetGroupAdmin {
      group_id: number
      user_id: number
      enable: boolean
    }
    interface SetGroupCard {
      group_id: number
      user_id: number
      card: string
    }
    interface SetGroupRemark {
      group_id: number
      remark: string
    }
    interface SetGroupSpecialTitle {
      group_id: number
      user_id: number
      special_title: string
    }
    interface SetGroupBan {
      group_id: number
      user_id: number
      duration: number
    }
    interface SetGroupWholeBan {
      group_id: number
      enable: boolean
    }
    interface SetEssenceMsg {
      message_id: number
    }
    interface DeleteEssenceMsg {
      message_id: number
    }
    interface SendGroupSign {
      group_id: number
    }
    interface SendGroupNotice {
      group_id: number
      content: string
      image?: string
    }
    interface GetGroupNotice {
      group_id: number
    }
    interface SetGroupKick {
      group_id: number
      user_id: number
      reject_add_request?: boolean
    }
    interface SetGroupLeave {
      group_id: number
    }
    interface GroupTouch {
      group_id: number
      user_id: number
    }
    interface Poke {
      group_id: number
      user_id: number
    }
    interface SetGroupCommentFace {
      group_id: number
      msg_id: number
      face_id: number
      is_set?: boolean
    }
    interface GetProhibitedMemberList {
      group_id: number
    }
    interface GetGroupAtAllRemain {
      group_id: number
    }
    interface UploadPrivateFile {
      user_id: number
      file: string
      name: string
    }
    interface UploadGroupFile {
      group_id: number
      file: string
      name: string
    }
    interface CreateGroupFileFolder {
      group_id: number
      name: string
    }
    interface RenameGroupFolder {
      group_id: number
      folder_id: string
      name: string
    }
    interface DeleteGroupFolder {
      group_id: number
      folder_id: string
    }
    interface DeleteGroupFile {
      group_id: number
      file_id: string
      busid: number
    }
    interface GetGroupFileSystemInfo {
      group_id: number
    }
    interface GetGroupRootFiles {
      group_id: number
    }
    interface GetGroupFilesByFolder {
      group_id: number
      folder_id: string
    }
    interface GetGroupFileUrl {
      group_id: number
      file_id: string
      busid: number
    }

    interface SwitchAccount {
      user_id: number
    }
    type UploadFile = string
    interface UploadFileToShamrock {
      md5: string
      offset?: number
      chunk: string // Base64格式，无需base64://开头
      file_size: number
    }
    interface DownloadFile {
      url?: string
      base64?: string
      name?: string
      thread_cnt?: number
      headers: string | string[]
    }
    interface Log {
      start?: number
      recent?: boolean
    }
    interface Shell {
      cmd: string | string[]
      dir: string
    }
    /**
     * 扫描二维码
     * @description OpenShamrock 实验性接口
     * @deprecated OpenShamrock 弃用
     */
    interface SancQrcode {
      /**
       * 图片的 Base64 代码
       */
      pic: string
    }
    /**
     * 为卡片Json签名
     * @description OpenShamrock 实验性接口
     * @todo
     */
    interface SignArkMessage {
      json: string
    }

    interface GetCsrfToken {
      domain?: string
    }
    interface GetCookies {
      domain?: string
    }
    interface GetCredentials {
      domain?: string
    }
    interface GetHttpCookies {
      appid: string
      daid: string
      jumpurl: string
    }

    interface GetWeatherCityCode {
      city: string
    }
    interface GetWeather {
      code: string
      city?: string
    }
    /**
     * 上传群聊图片资源
     * @description OpenShamrock 实验性接口
     */
    interface UploadGroupImage {
      pic: string
      sender: number
      troop: number
    }
    interface FavoriteGetItemList {
      page_size: number
      category: number
      start_pos: number
    }
    interface FavoriteGetItemContent {
      id: string
    }
    interface FavoriteAddTextMsg {
      content: string
    }
    interface FavoriteAddImageMsg {
      file: string
    }
    interface GetGuildMetaByGuest {
      guild_id: number
    }
    interface GetGuildChannelList {
      guild_id: number
      refresh?: boolean // 是否刷新数据，默认为false
    }
    interface GetGuildMemberList {
      guild_id: number
      next_token?: string
      all?: boolean // 获取所有，默认为false
      refresh?: boolean // 是否刷新数据，默认为false
    }
    interface GetGuildMemberProfile {
      guild_id: number
      user_id: number // 用户的Tiny ID
    }
    interface SendGuildChannelMsg {
      guild_id: number
      channel_id: number
      message: MessageSegment.Segment | MessageSegment.Segment[] | string
      auto_escape?: boolean
      retry_cnt?: number
      recall_duration?: number
    }
    interface GetGuildFeeds {
      guild_id: number
      from: number
    }
    interface GetGuildRoles {
      guild_id: number
    }
    interface DeleteGuildRole {
      guild_id: number
      role_id: number
    }
    interface SetGuildMemberRole {
      guild_id: number
      role_id: number
      set?: boolean // 设置或移除，默认false（移除）
      users: string | number[]
    }
    interface CreateGuildRole {
      guild_id: number
      name: string
      color: number
      initial_users: string | number[]
    }
  }
  namespace ActionResponse {
    interface GetLoginInfo {
      user_id: number
      nickname: string
    }
    interface Status {
      self: {
        platform: "qq"
        user_id: number
      }
      online: boolean
      good: boolean
      "qq.status": string
    }
    interface GetSelfInfo {
      user_id: number
      user_name: string
      user_displayname: string
    }
    type GetStatus = Status[]
    interface ModelDetail {
      model_show: string
      need_pay: boolean
    }
    interface GetModelShow {
      variants: ModelDetail[]
    }
    interface Device {
      app_id: number
      device_name: string
      device_kind: string
    }
    interface GetOnlineClients {
      clients: Device[]
    }
    type Sex = "unknown" | "male" | "female"
    type Gender = 0 | 1 | 2
    interface GetStrangerInfo {
      user_id: string
      nickname: string
      age: number
      sex: Sex
      login_days: number
      qid: string
      vote: number
      wzry_honor: unknown
      ext: object
    }
    interface HobbyEntryItem {
      strName: string
      strServiceUrl: string
      strServiceType: unknown
      serviceType: number
      sProfileSummaryHobbiesItem: [] & string
    }
    interface LocationInfo {
      city: string
      company: string
      country: string
      province: string
      hometown: string
      school: string
    }
    interface GetUserInfo {
      user_id: number
      user_name: string
      user_displayname: string
      user_remark: string
      mail: string
      find_method: string
      max_vote_cnt: number
      have_vote_cnt: number
      vip_list: unknown[]
      hobby_entry: HobbyEntryItem[] & string
      level: number
      birthday: number
      login_day: number
      vote_cnt: number
      qid: number
      is_school_verified: boolean
      location: LocationInfo
      cookie: number[]
    }
    interface FriendListItem {
      user_id: number
      user_name: string
      user_displayname: string
      user_remark: string
      age: number
      gender: Gender
      group_id: number
      platform: string
      term_type: string
    }
    type GetFriendList = FriendListItem[]
    interface UnidirectionalFriendListItem {
      user_id: number
      nickname: string
      source: string
    }
    type GetUnidirectionalFriendList = UnidirectionalFriendListItem[]
    interface GetNotJoinedGroupInfo {
      group_id: number
      max_member_cnt: number
      member_count: number
      group_name: string
      group_desc: string
      owner: number
      create_time: number
      group_flag: number
      group_flag_ext: number
    }
    interface GetGroupInfo {
      group_id: number
      group_name: string
      group_remark: string
      group_uin: number
      admins: number[]
      class_text: string
      is_frozen: boolean
      max_member: number
      max_member_count: number
      member_num: number
      member_count: number
    }
    type GetGroupList = GetGroupInfo[]
    interface GetGroupMemberInfo {
      user_id: number
      group_id: number
      user_name: string
      sex: Sex
      title: string
      title_expire_time: number
      nickname: string
      user_displayname: string
      honor: number[]
      join_time: number
      last_active_time: number
      last_sent_time: number
      unique_name: string
      area: string
      level: number
      role: EventEnum.GroupMemberRole
      unfriendly: boolean
      card_changeable: boolean
    }
    type GetUinByUid = Record<string, number>
    type GetUid = Record<string, string>
    type GetGroupMemberList = GetGroupMemberInfo[]
    interface HonorInfo {
      user_id: number
      nickname: string
      avatar: string
      day_count: number
      id: number
      description: string
    }
    interface GetGroupHonorInfo {
      group_id: number
      current_talkative: HonorInfo[]
      talkative_list: HonorInfo[]
      performer_list: HonorInfo[]
      legend_list: HonorInfo[]
      strong_newbie_list: HonorInfo[]
      emotion_list: HonorInfo[]
      all: HonorInfo[]
    }
    interface InvitedRequest {
      request_id: number
      invitor_uin: number
      invitor_nick: string
      group_id: number
      group_name: string
      checked: boolean
      actor: number
      requester_uin: number
      flag: string
    }
    interface JoinRequest {
      request_id: number
      requester_uin: number
      requester_nick: string
      message: string
      group_id: number
      group_name: string
      checked: boolean
      actor: number
      flag: string
    }
    interface GetGroupSystemMsg {
      invited_requests: InvitedRequest[]
      join_requests: JoinRequest[]
    }
    interface FriendSystemMessage {
      request_id: number
      requester_uin: number
      requester_nick: string
      source: string
      message: string
      source_group_name: string
      source_group_id: number
      sex: Sex
      age: string
      msg_detail: string
      status: "已同意" | "已拒绝" | ""
      flag: string
    }
    type GetFriendSystemMsg = FriendSystemMessage[]
    interface GetEssenceMsgList {
      sender_id: number
      sender_nick: string
      sender_time: number
      operator_id: number
      operator_nick: string
      operator_time: string
      message_id: number
      message_seq: number
    }
    interface IsBlacklistUin {
      is: boolean
    }
    interface SendPrivateMsg {
      message_id: number
      time: number
    }
    interface SendGroupMsg {
      message_id: number
      time: number
    }
    interface SendMsg {
      message_id: number
      time: number
    }
    interface Sender {
      user_id: number
      nickname: string
      sex: sex
      age: number
      uid: string
    }
    interface GetMsg {
      time: number
      message_type: EventEnum.MessageType
      message_id: number
      real_id: number
      sender: Sender
      message: MessageSegment.Segment[]
      group_id: number
      target_id: number
      peer_id: number
    }
    interface GetHistoryMsg {
      messages: GetMsg[]
    }
    interface GetGroupHistoryMsg {
      messages: GetMsg[]
    }
    interface GetForwardMsg {
      messages: GetMsg[]
    }
    interface GetImage {
      size: number
      url: string
      filename: string
    }
    interface CanSendImage {
      yes: boolean
    }
    interface TextDetection {
      text: string
      confidence: number
      coordinates: [number, number][]
    }
    interface OcrImage {
      texts: TextDetection[]
      language: string
    }
    interface GetRecord {
      file: string
      url: string
    }
    interface CanSendRecord {
      yes: boolean
    }
    interface GroupNoticeImage {
      height: string
      width: string
      id: string
    }
    interface GroupNoticeMessage {
      text: string
      images: GroupNoticeImage[]
    }
    interface GroupNoticeItem {
      sender_id: number
      publish_time: number
      message: GroupNoticeMessage[]
    }
    type GetGroupNotice = GroupNoticeItem[]
    interface ProhibitedMemberItem {
      user_id: number
      time: number
    }
    type GetProhibitedMemberList = ProhibitedMemberItem[]
    interface GetGroupAtAllRemain {
      can_at_all: boolean
      remain_at_all_count_for_group: number
      remain_at_all_count_for_uin: number
    }
    interface UploadPrivateFile {
      msg_id: number
      bizid: number
      md5: string
      file_id: string
    }
    interface UploadGroupFile {
      msg_id: number
      bizid: number
      md5: string
      file_id: string
    }
    interface CreateGroupFileFolder {
      folder_id: string
      parent_folder_id: string
      folder_name: string
      create_time: number
      modify_time: number
      creator_uin: number
      modifier_uin: number
    }
    interface GetGroupFileSystemInfo {
      file_count: number
      limit_count: number
      used_space: number
      total_space: number
    }
    interface GroupFile {
      group_id: number
      file_id: string
      file_name: string
      busid: number
      file_size: number
      upload_time: number
      dead_time: number
      modify_time: number
      download_times: number
      uploader: number
      uploader_name: string
      md5: string
      sha: string
      sha3: string
    }
    interface GroupFolder {
      group_id: number
      folder_id: string
      folder_name: string
      create_time: number
      creator: number
      creator_name: string
      total_file_count: number
    }
    interface GetGroupRootFiles {
      files: GroupFile[]
      folders: GroupFolder[]
    }
    interface GetGroupFilesByFolder {
      files: GroupFile[]
      folders: GroupFolder[]
    }
    interface GetGroupFileUrl {
      url: string
    }

    interface UploadFile {
      file: string
    }
    interface UploadFileToShamrock {
      file_size: number
      finish: boolean
      path: string
    }
    interface DownloadFile {
      file: string
    }
    interface GetDeviceBattery {
      battery: number
      scale: number
      status: number
    }
    interface GetStartTime {
      status: string
      retcode: number
      data: number
    }
    type Log = string
    interface GetVersionInfo {
      app_full_name: string
      app_name: string
      app_version: string
      onebot_version: string
    }
    type GetSupportedActions = string[]

    interface GetCsrfToken {
      token: string
    }
    interface GetCookies {
      cookies: string
    }
    interface GetCredentials {
      token: string
      cookies: string
    }
    interface GetHttpCookies {
      cookies: string
    }
    interface Test {
      time: number
    }
    type GetLatestEvents = unknown[]

    interface WeatherCityCodeItem {
      adcode: number
      province: string
      city: string
    }
    type GetWeatherCityCode = WeatherCityCodeItem[]
    type GetWeather = object
    interface FavoriteItem {
      id: string
      author_type: number
      author: number
      author_name: string
      group_name: string
      group_id: number
      client_version: string
      time: number
    }
    interface FavoriteGetItemList {
      items: FavoriteItem[]
    }
    interface FavoriteGetItemContent {
      content: string
    }
    interface FavoriteAddTextMsg {
      id: string
    }
    interface FavoriteAddImageMsg {
      id: string
    }
    interface GuildItem {
      guild_id: number
      guild_name: string
      guild_display_id: string
      profile: string
      status: {
        is_enable: boolean
        is_banned: boolean
        is_frozen: boolean
      }
      owner_id: number
      shutup_expire_time: number
      allow_search: boolean
    }
    interface GetGuildList {
      guild_list: GuildItem[]
    }
    interface GetGuildServiceProfile {
      nickname: string
      tiny_id: number
      avatar_url: string
    }
    interface GetGuildMetaByGuest {
      guild_id: number
      guild_name: string
      guild_profile: string
      create_time: number
      max_member_count: number
      max_robot_count: number
      max_admin_count: number
      member_count: number
      owner_id: number
      guild_display_id: string
    }
    interface GuildChannelSlowModeInfo {
      slow_mode_key: number
      slow_mode_text: string
      speak_frequency: number
      slow_mode_circle: number
    }
    interface GetGuildChannelList {
      owner_guild_id: number
      channel_id: number
      channel_uin: number
      guild_id: string
      channel_type: ConnectionEnum.GuildChannelType
      channel_name: string
      create_time: number
      max_member_count: number
      creator_tiny_id: number
      talk_permission: number // 1
      visible_type: number
      current_slow_mode: number
      slow_modes: GuildChannelSlowModeInfo[]
      icon_url: string
      jump_switch: number
      jump_type: number
      jump_url: string
      category_id: number
      my_talk_permission: number
    }
    interface GuildMemberInfo {
      tiny_id: number
      title: string
      nickname: string
      role_id: number
      role_name: string
      role_color: number
      join_time: number
      robot_type: number
      type: number
      in_black: boolean
      platform: number
    }
    interface GetGuildMemberList {
      members: GuildMemberInfo[]
      next_token: string
      finished: boolean
    }
    interface GuildMemberPermission {
      root_id: number
      child_ids: number[]
    }
    interface GuildMemberRoleInfo {
      role_id: string
      role_name: string
      color: number
      permission: GuildMemberPermission[]
      type: number
      display_name: string
    }
    interface GetGuildMemberProfile {
      tiny_id: number
      nickname: string
      avatar_url: string
      join_time: number
      roles: GuildMemberRoleInfo[]
    }
    interface SendGuildChannelMsg {
      message_id: number
      time: number
    }
    type GetGuildFeeds = object // 大量原生响应数据
    interface GuildRoleInfo {
      argb_color: number
      disabled: boolean
      independent: boolean
      max_count: number
      member_count: number
      owned: boolean
      role_id: number
      role_name: string
      permission: GuildMemberPermission[]
    }
    interface GetGuildRoles {
      roles: GuildRoleInfo[]
    }
    interface CreateGuildRole {
      role_id: number
    }
  }
}