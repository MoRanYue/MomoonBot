export namespace ApiContent {
  namespace Response {
    enum Code {
      success = 0,
      requestError = -400,
      denied = -403,
      notFound = -404,
  
      invisible = 62002,
      isExamining = 62004
    }

    interface Response<T extends object> {
      code: Code
      message: string
      ttl: number
      data: T
    }

    enum VideoState {
      orangePassing = 1,
      open = 0,
      pendingApproval = -1,
      notPassed = -2,
      lockedByCyberPolice = -3,
      locked = -4,
      lockedByAdmin = -5,
      fixingPendingApproval = -6,
      pauseApproval = -7,
      supplementPendingApproval = -8,
      pendingTransferFormat = -9,
      delayedApproval = -10,
      pendingFixingSource = -11,
      failedToSave = -12,
      pendingApprovalReplies = -13,
      isInTemporaryRecyclingBin = -14,
      isDispensing = -15,
      failedToTransferFormat = -16,
      creationHaventSubmitted = -20,
      creationHasSubmitted = -30,
      timingPublishing = -40,
      deletedByUser = -100
    }
    interface VideoDimension {
      width: number
      height: number
      rotate: 0 | 1
    }
    interface VideoDetails {
      bvid: string
      aid: number
      videos: number
      tid: number
      tname: string
      copyright: 1 | 2
      pic: string
      title: string
      pubdate: number
      ctime: number
      desc: string
      desc_v2: [{
        raw_text: "1" | "2"
        type: 1 | 2
        biz_id: number
      }]
      state: VideoState
      duration: number
      forward?: number
      mission_id: number
      redirect_url: string
      rights: {
        bp: boolean
        elec: boolean
        download: boolean
        movie: boolean
        pay: boolean
        hd5: boolean
        no_reprint: boolean
        autoplay: boolean
        ugc_pay: boolean
        is_cooperation: boolean
        ugc_pay_review: 0
        no_background: 0
        clean_mode: 0
        is_stein_gate: number
        is_360: number
        no_share: 0
        arc_pay: 0
        free_watch: 0
      }
      owner: {
        mid: number
        name: string
        face: string
      }
      stat: {
        aid: number
        view: number
        danmaku: number
        reply: number
        favorite: number
        coin: number
        share: number
        now_rank: number
        his_rank: number
        like: number
        dislike: 0
        evaluation: string
        vt: 0
      }
      dynamic: string
      cid: number
      dimension: VideoDimension
      premiere: null
      teenage_mode: boolean
      is_story: boolean
      no_cache: boolean
      pages: {
        cid: number
        page: number
        from: "vupload" | "hunan" | "qq"
        part: string
        duration: number
        vid: string
        weblink: string
        dimension: VideoDimension
      }[]
      subtitle: {
        allow_submit: boolean
        list: {
          id: number
          lan: string
          lan_doc: string
          is_lock: boolean
          author_mid: number
          subtitle_url: string
          author: {
            mid: number
            name: string
            sex: string
            face: string
            sign: string
            rank: 10000
            birthday: 0
            is_fake_account: 0
            is_deleted: 0
          }
        }[]
      }
      staff: {
        mid: number
        title: string
        name: string
        face: string
        vip: {
          type: 0 | 1 | 2
          status: 0 | 1
          theme_type: 0
        }
        official: {
          role: number
          title: string
          desc: string
          type: -1 | 0
        }
        follower: number
        label_style: number
      }[]
      is_season_display: boolean
      user_garb: {
        url_image_ani_cut: string
      }
      honor_reply: {
        honor: {
          aid: number
          type: 1 | 2 | 3 | 4
          desc: number
          weekly_recommend_num: number
        }[]
      }
      like_icon: string
      argue_info: {
        argue_link: string
        argue_msg: string
        argue_type: number
      }
    }
  }
}