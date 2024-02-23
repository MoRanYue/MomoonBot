export namespace ConfigEnum {
  export enum ConnectionType {
    ws = "ws",
    reverseWs = "reverse",
    http = "http"
  }

  export enum SupportedProtocol {
    onebotV11 = "onebot/v11",
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
    group = "group",
    guild = "guild"
  }
  export enum GroupMemberRole {
    owner = "owner",
    admin = "admin",
    member = "member"
  }
  export enum MessageTempSource {
    group = 0, 
    consultation = 1, 
    finding = 2, 
    movie = 3, 
    heatChatting = 4, 
    validationMessage = 6, 
    multiplePeople = 7, 
    dating = 8, 
    addressBook = 9
  }
  export enum MessageSubType {
    friend = "friend",
    normal = "normal",
    anonymous = "anonymous",
    group = "group",
    groupSelf = "group_self",
    notice = "notice",
    channel = "channel"
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
    bubbleFace = "bubble_face",
    marketFace = "mface",
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
    basketball = "basketball",
    newRps = "new_rps",
    newDice = "new_dice",
    deprecatedRps = "rps",
    deprecatedDice = "dice",

    forward = "forward",
    forwardNode = "node",
    xml = "xml",
    cardImage = "cardimage",
    textToSpeech = "tts",
    shake = "shake",
    anonymous = "anonymous",
    contact = "contact",
    redbag = "redbag",
    markdown = "markdown",
  }
  export enum BasketballId {
    missed = 5,
    closeMissed = 4,
    stuck = 3,
    closeHit = 2,
    hit = 1
  }
  export enum RpsId {
    rock = 3,
    scissor = 2,
    paper = 1
  }
  export enum MusicType {
    qq = "qq",
    music163 = "163",
    custom = "custom"
  }
  export enum ImageSubType {
    normal = 0,
    face = 1,
    heat = 2,
    battle = 3,
    smart = 4,
    texture = 7,
    selfie = 8,
    ad = 9,
    unknown = 10,
    heatSearch = 13
  }
}
export namespace AppMessageEnum {
  export enum App {
    structuredMessage = "com.tencent.structmsg",
    miniapp1 = "com.tencent.miniapp_01"
  }
  export enum AppId {
    bilibiliVideoShare = "100951776",
    bilibiliMiniappVideoShare = "1109937557",
    neteaseMusicShare = "100495085",
  }
  export enum View {
    news = "news",
    music = "music"
  }
}

export namespace ConnectionEnum {
  export enum Action {
    getLoginInfo = "get_login_info",
    setQqProfile = "set_qq_profile",
    getStatus = "get_status", // OpenShamrock的c7265ba提交
    getSelfInfo = "get_self_info", // OpenShamrock的c7265ba提交
    getModelShow = "_get_model_show",
    // getModelShowAlias = "get_model_show",
    setModelShow = "_set_model_show",
    getOnlineClients = "get_online_clients",
    // getOnlineClientsAlias = "_get_online_clients",

    getStrangerInfo = "get_stranger_info",
    // getStrangerInfoAlias = "_get_stranger_info",
    getUserInfo = "get_user_info", // OpenShamrock的c7265ba提交
    // getProfileCard = "get_profile_card",
    getFriendList = "get_friend_list",
    getUnidirectionalFriendList = "get_unidirectional_friend_list",
    getNotJoinedGroupInfo = "get_not_joined_group_info",
    getGroupInfo = "get_group_info",
    getGroupList = "get_group_list",
    getUinByUid = "get_uin_by_uid",
    getUid = "get_uid",

    getGroupMemberInfo = "get_group_member_info",
    getGroupMemberList = "get_group_member_list",
    getGroupHonorInfo = "get_group_honor_info",
    // getTroopHonorInfo = "get_troop_honor_info",
    getGroupSystemMsg = "get_group_system_msg",
    getFriendSystemMsg = "get_friend_system_msg",
    getEssenceMsgList = "get_essence_msg_list",
    // getEssenceMessageList = "get_essence_message_list",
    sendLike = "send_like", // OpenShamrock的c7265ba提交
    isBlacklistUin = "is_blacklist_uin",

    deleteFriend = "delete_friend",
    deleteUnidirectionalFriend = "delete_unidirectional_friend",

    sendPrivateMsg = "send_private_msg",
    // sendPrivateMessage = "send_private_message",
    sendGroupMsg = "send_group_msg",
    // sendGroupMessage = "send_group_message",
    sendMsg = "send_msg",
    // sendMessage = "send_message",
    getMsg = "get_msg",
    // getMessage = "get_message",
    deleteMsg = "delete_msg",
    // deleteMessage = "delete_message",
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
    setGroupCard = "set_group_card", // OpenShamrock的67f52b8提交支持
    setGroupRemark = "set_group_remark", // OpenShamrock的67f52b8提交
    setGroupSpecialTitle = "set_group_special_title",
    setGroupBan = "set_group_ban",
    setGroupWholeBan = "set_group_whole_ban",
    setEssenceMsg = "set_essence_msg",
    // setEssenceMessage = "set_essence_message",
    deleteEssenceMsg = "delete_essence_msg",
    // deleteEssenceMessage = "delete_essence_message",
    sendGroupSign = "send_group_sign",
    sendGroupNotice = "send_group_notice",
    // sendGroupNotice = "_send_group_notice", // 不支持
    // sendGroupAnnouncement = "send_group_announcement",
    getGroupNotice = "_get_group_notice",
    // getGroupNoticeAlias = "get_group_notice",
    setGroupKick = "set_group_kick",
    // kickGroupMember = "kick_group_member",
    setGroupLeave = "set_group_leave",
    // leaveGroup = "leave_group",
    groupTouch = "group_touch", // 不支持
    poke = "poke",
    setGroupCommentFace = "set_group_comment_face",
    getProhibitedMemberList = "get_prohibited_member_list",
    getGroupAtAllRemain = "get_group_at_all_remain",

    uploadPrivateFile = "upload_private_file",
    uploadGroupFile = "upload_group_file",
    deleteGroupFile = "delete_group_file",
    createGroupFileFolder = "create_group_file_folder",
    renameGroupFolder = "rename_group_folder",
    deleteGroupFolder = "delete_group_folder",
    getGroupFileSystemInfo = "get_group_file_system_info",
    getGroupRootFiles = "get_group_root_files",
    getGroupFilesByFolder = "get_group_files_by_folder",
    getGroupFileUrl = "get_group_file_url",

    switchAccount = "switch_account",
    uploadFile = "upload_file", // 仅HTTP
    uploadFileToShamrock = "upload_file_to_shamrock", // 仅WebSocket，OpenShamrock的00b355b提交
    downloadFile = "download_file",
    getDeviceBattery = "get_device_battery",
    getStartTime = "get_start_time",
    log = "log",
    getVersionInfo = "get_version_info", // OpenShamrock的c7265ba提交
    // getVersion = "get_version",
    getSupportedActions = "get_supported_actions", // OpenShamrock的c7265ba提交
    cleanCache = "clean_cache", // OpenShamrock的c7265ba提交
    shell = "shell",
    shut = "shut",
    restart = "restart_me", // 不支持
    sancQrcode = "sanc_qrcode", // 不支持

    getWeatherCityCode = "get_weather_city_code",
    getWeather = "get_weather",
    uploadGroupImage = "upload_group_image",

    favoriteGetItemList = "fav.get_item_list",
    favoriteGetItemContent = "fav.get_item_content",
    favoriteAddTextMsg = "fav.add_text_msg",
    favoriteAddImageMsg = "fav.add_image_msg",

    getGuildList = "get_guild_list", // OpenShamrock的036f8a4提交
    getGuildServiceProfile = "get_guild_service_profile", // OpenShamrock的7540ef0提交
    getGuildMetaByGuest = "get_guild_meta_by_guest", // OpenShamrock的103381c提交
    getGuildChannelList = "get_guild_channel_list", // OpenShamrock的e629981提交
    getGuildMemberList = "get_guild_member_list", // OpenShamrock的a22dc50提交
    getGuildMemberProfile = "get_guild_member_profile", // OpenShamrock的1c7f6bd提交
    sendGuildChannelMsg = "send_guild_channel_msg", // OpenShamrock的db252b6提交
    getGuildFeeds = "get_guild_feeds", // OpenShamrock的2f61f6d提交
    getGuildRoles = "get_guild_roles", // OpenShamrock的7952453提交
    deleteGuildRole = "delete_guild_role", // OpenShamrock的c436898提交
    setGuildMemberRole = "set_guild_member_role", // OpenShamrock的7bfb9b7提交
    createGuildRole = "create_guild_role", // OpenShamrock的fb00e5c提交

    // 从源代码中发现的API，一些API暂未被实现
    getCsrfToken = "get_csrf_token",
    getCookies = "get_cookies",
    // getCookie = "get_cookie",
    getCredentials = "get_credentials",
    getHttpCookies = "get_http_cookies",
    test = "test",
    /* 被弃用的API
    根据OpenShamrock的源代码xposed/src/main/java/moe/fuqiuluo/shamrock/remote/action/handlers/GetLatestEvents.kt文件中的注释：
    “
    弱智玩意，不予实现
    请开启HTTP回调 把事件回调回去
    而不是在我这里轮询
    ”
    */
    getLatestEvents = "get_latest_events",

    // 不建议使用的API（因为已实现）
    handleQuickOperation = ".handle_quick_operation",
    handleQuickOperationAsync = ".handle_quick_operation_async"
  }
  export enum ResponseStatus {
    ok = "ok",
    failed = "failed"
  }
  export enum ResponseCode {
    ok = 0
  }
  export enum GuildChannelType {
    text = 1,
    voice = 2,
    stream = 5,
    topic = 7
  }
}

export namespace ListenerEnum {
  export enum Permission {
    superuser = "superuser",
    owner = "owner",
    admin = "admin",
    user = "user"
  }
  export enum ReceiverReturn {
    finish,
    continue,
    keep
  }
}

export namespace LoggerEnum {
  export enum LogLevel {
    error = "error",
    warning = "warning",
    failure = "failure",
    success = "success",
    info = "info",
    debug = "debug"
  }

  export enum Console {
    cleanUp = 2,
    
    removeStyles = 0,
    highlight = 1,
    grey = 2,
    italic = 3,
    underline = 4,
    twinkle = 5,
    reverse = 7,
    hidden = 8,
  }
  
  export enum Color {
    bBlack = 40,
    bDarkRed = 41,
    bGreen = 42,
    bYellow = 43,
    bBlue = 44,
    bPurple = 45,
    bDarkGreen = 46,
    bWhite = 47,
  
    fBlack = 30,
    fRed = 31,
    fGreen = 32,
    fYellow = 33,
    fBlue = 34,
    fPurple = 35,
    fDarkGreen = 36,
    fWhite = 37
  }
}