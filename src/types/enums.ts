export namespace ConfigEnum {
  export enum ConnectionType {
    ws = "ws",
    reverseWs = "reverse",
    http = "http"
  }

  export enum SupportedProtocol {
    onebotV12 = "onebot/v12",
    shamrock = "shamrock"
  }
}

export namespace EventEnum {
  export enum EventType {
    message = "message",
    messageSent = "message_sent",
    notice = "notice",
    request = "request",

    meta = "meta_event"
  }
  export enum MessageType {
    private = "private",
    group = "group"
  }
  export enum MessageTempSource {
    group, consultation, finding, movie, heatChatting, validationMessage, multiplePeople, dating, addressBook
  }
  export enum MessageSubType {
    friend = "friend",
    normal = "normal",
    anonymous = "anonymous",
    group = "group",
    groupSelf = "group_self",
    notice = "notice"
  }
  export enum NoticeType {
    groupUpload = "group_upload",
    groupAdmin = "group_admin",
    groupDecrease = "group_decrease",
    groupIncrease = "group_increase",
    groupBan = "group_ban",
    groupRecall = "group_recall",
    groupCard = "group_card",
    essence = "essence",

    friendAdd = "friend_add",
    friendRecall = "friend_recall",
    offlineFile = "offline_file",
    clientStatus = "client_status",

    notify = "notify"
  }
  export enum NotifySubType {
    honor = "honor",
    poke = "poke",
    luckyKing = "lucky_king",
    title = "title"
  }
  export enum RequestType {
    friend = "friend",
    group = "group"
  }

  export enum MetaEventType {
    heartbeat = "heartbeat"
  }
  export enum MetaEventSubType {
    connect = "connect"
  }
}

export namespace MessageSegmentEnum {
  export enum SegmentType {
    text = "text",
    at = "at",
    face = "face",
    reply = "reply",
    file = "file",
    image = "image",
    record = "record",
    video = "video",
    poke = "poke",
    touch = "touch",
    music = "music",
    weather = "weather",
    location = "location",
    share = "share",
    gift = "gift",
    json = "json",

    mergedForward = "",
    mergedForwardNode = "",
    xml = "",
    textToSpeech = ""
  }
}

export namespace ConnectionEnum {
  export enum Action {
    getLoginInfo = "get_login_info",
    setQqProfile = "set_qq_profile",
    getModelShow = "_get_model_show",
    setModelShow = "_set_model_show",
    getOnlineClients = "get_online_clients",

    getStrangerInfo = "get_stranger_info",
    getFriendList = "get_friend_list",
    getUnidirectionalFriendList = "get_unidirectional_friend_list",
    getGroupInfo = "get_group_info",
    getGroupList = "get_group_list",
    getGroupMemberInfo = "get_group_member_info",
    getGroupMemberList = "get_group_member_list",
    getGroupHonorInfo = "get_group_honor_info",
    getGroupSystemMsg = "get_group_system_msg",
    getEssenceMsgList = "get_essence_msg_list",
    isBlacklistUin = "is_blacklist_uin",

    deleteFriend = "delete_friend",
    deleteUnidirectionalFriend = "delete_unidirectional_friend",

    sendPrivateMsg = "send_private_msg",
    sendGroupMsg = "send_group_msg",
    sendMsg = "send_msg",
    getMsg = "get_msg",
    deleteMsg = "delete_msg",
    getHistoryMsg = "get_history_msg",
    getGroupHistoryMsg = "get_group_msg_history",
    clearMsgs = "clear_msgs",
    getForwardMsg = "get_forward_msg",
    sendGroupForwardMsg = "send_group_forward_msg",
    sendPrivateForwardMsg = "send_private_forward_msg",

    getImage = "get_image",
    canSendImage = "can_send_image",
    ocrImage = "ocr_image",
    getRecord = "get_record",
    canSendRecord = "can_send_record",

    setFriendAddRequest = "set_friend_add_request",
    setGroupAddRequest = "set_group_add_request",

    setGroupName = "set_group_name",
    setGroupPortrait = "set_group_portrait",
    setGroupAdmin = "set_group_admin",
    setGroupCard = "set_group_card",
    setGroupSpecialTitle = "set_group_special_title",
    setGroupBan = "set_group_ban",
    setGroupWholeBan = "set_group_whole_ban",
    setEssenceMsg = "set_essence_msg",
    deleteEssenceMsg = "delete_essence_msg",
    sendGroupSign = "send_group_sign",
    sendGroupNotice = "_send_group_notice",
    getGroupNotice = "_get_group_notice",
    setGroupKick = "set_group_kick",
    setGroupLeave = "set_group_leave",
    groupTouch = "group_touch",
    getProhibitedMemberList = "get_prohibited_member_list",

    uploadPrivateFile = "upload_private_file",
    uploadGroupFile = "upload_group_file",
    deleteGroupFile = "delete_group_file",
    createGroupFileFolder = "create_group_file_folder",
    deleteGroupFolder = "delete_group_folder",
    getGroupFileSystemInfo = "get_group_file_system_info",
    getGroupRootFiles = "get_group_root_files",
    getGroupFilesByFolder = "get_group_files_by_folder",
    getGroupFileUrl = "get_group_file_url",

    switchAccount = "switch_account",
    uploadFile = "upload_file",
    downloadFile = "download_file",
    getDeviceBattery = "get_device_battery",
    getStartTime = "get_start_time",
    log = "log",
    shell = "",
    shut = "shut",

    getWeatherCityCode = "get_weather_city_code",
    getWeather = "get_weather",
    uploadGroupImage = "upload_group_image",
  }
  export enum ResponseStatus {
    ok = "ok",
    failed = "failed"
  }
}