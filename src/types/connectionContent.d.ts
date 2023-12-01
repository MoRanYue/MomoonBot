export namespace ConnectionContent {
  enum Action {
    getLoginInfo = "get_login_info",
    setQqProfile = "set_qq_profile",
    getModelShow = "_get_model_show",
    setModelShow = "_set_model_show",
    getOnlineClients = "get_online_clients",
  }

  interface HttpCallback {
    echo: string
  }

  interface WsReport<T extends object> {
    action: Action
    params: T
    echo: string
  }

  interface GetLoginInfoResp {
    user_id: number
    nickname: string
  }
  
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
  interface ModelDetail {
    model_show: string
    need_pay: boolean
  }
  interface GetModelShowResp {
    variants: ModelDetail[]
  }

  interface SetModelShow {
    model: string
    manu: string
  }

  interface GetOnlineClients {
    no_cache: boolean
  }
  interface Device {
    app_id: number
    device_name: string
    device_kind: string
  }
  interface GetOnlineClientsResp {
    clients: Device[]
  }
}