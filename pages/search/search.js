let videoAd = null
const db = wx.cloud.database({
  env: 'cloud1-4gsk595ef96de889'
})
const cont = db.collection('gameSharingDB');
const cont2 = db.collection('idCount');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    displayClass: "block",
    downloaDisplayClass: "none",
    illustrateDisplayClass: "block",
    oldId: "",
    currentOpenId: "",
    blackOpenIdList: [],
    currentUserInfo: {},
    idMap: {},
  },
  tapName(event) {
    this.setData({
      displayClass: "none",
      downloaDisplayClass: "block"
    })
  },
  acceptMission: function (e) {
    var that = this;
    var missionArr = that.data.obj;
    let index = 0
    for (let i in missionArr) {
      if (missionArr[i].status == 0) {
        missionArr[i].status = 1;
        index = i
      }
    }
    console.log('missionArr', missionArr)
    that.setData({
      obj: missionArr,
    })
    const currentUserInfo = that.data.currentUserInfo
    currentUserInfo.history.push({
      [that.formatTime(new Date())]: missionArr[index].name || '空'
    })
    if(!currentUserInfo.historyMap) {
      currentUserInfo.historyMap = {}
    }
    currentUserInfo.historyMap[that.formatTime(new Date())] = missionArr[index]
    console.log('更新？？', currentUserInfo.history)
    this.updateUser({
      count: ++currentUserInfo.count,
      date: that.formatTime(new Date()),
      history: currentUserInfo.history,
      historyMap: currentUserInfo.historyMap,
    })
  },
  updateUser(data) {
    const currentUserInfo = this.data.currentUserInfo
    cont2.doc(currentUserInfo._id).update({
      data,
      success: res => {
        console.log('更新数字', currentUserInfo.count)
        console.log('更新历史', currentUserInfo.historyMap)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const result = wx.getStorageSync('name')
    if (result) {
      this.setData({
        search: result,
      })
      this.ToSearch();
    }
    if (wx.createRewardedVideoAd) {
      videoAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-c2f11d58a4ceee84'
      })
      videoAd.onLoad(() => {})
      //捕捉错误
      videoAd.onError(err => {
        console.log('广告捕获失败',err)
        wx.showModal({
          title: '提示',
          content: `视频广告拉取失败：${JSON.stringify(err)}`,
        })
      })
     // 监听关闭
     videoAd.onClose((status) => {
      if (status && status.isEnded || status === undefined) {
        // 正常播放结束，下发奖励
        this.acceptMission();
      } else {
        // 播放中途退出，进行提示
        wx.showModal({
          title: '提示',
          content: '请勿提前退出，您需要看完视频才能解锁资源',
          showCancel: true,
          confirmText: '重新观看',
          success(res) {
            if (res.confirm) {
              videoAd.load()
                .then(() => videoAd.show())
                .catch(err => console.log(err.errMsg))
            }
          }
        })
        var missionArr = this.data.obj;
        for (let i in missionArr) {
            //根据下标找到目标,改变状态  
            if (missionArr[i].status == 0) {
              missionArr[i].status = null;
              debugger
            }
        }
      }
    })
    }
  },
  GetSearchInput: function (e) {
    this.setData({
      search: e.detail.value
    })
  },
  init() {
    let that = this
    wx.login({
      success: async (res) => {
        console.log('登录用户code', res)
        let oldId = res.code
        wx.request({
          url: 'https://www.chenshiqi.xyz/api/default/getopenid?code=' + res.code,
          method: 'get',
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: (res) => {
            let openId = res.data.Data
            console.log('openId ====== !!!', openId)
            that.loginCallBack(openId, oldId)
          },
          fail: (err) => {
            that.loginCallBack(oldId, oldId)
          }
        })
      }
    })
  },

  loginCallBack(openId, oldId) {
    if(!this.data.blackOpenIdList.includes(openId)) {
      this.addUser(openId)
    } else {
      // 更新登录时间
      console.log('更新登录', this.data.idMap[openId])
      this.updateUser({
        lastLoginDate: this.formatTime(new Date()),
      })
    }
    this.setData({
      oldId,
      currentOpenId: openId,
      currentUserInfo: this.data.idMap[openId]
    })
    // wx.showModal({
    //   title: '登录',
    //   content: '成功',
    //   complete: (res) => {
    //     if (res.cancel) {
    //     }
    //     if (res.confirm) { 
    //     }
    //   }
    // })
  },

  copy: function (e) {
    let item = e.currentTarget.dataset.item;
    console.log("复制", e, item);
    wx.setClipboardData({
      data: item,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'none',
          duration: 2000,
          mask: true
        });
      }
    })
  },
  async delete(name) {
    await db.collection('openIdList').where({
      name: "我自己"
    }).remove()
  },
  addUser(openId) {
    // 091hzp0w3DzEf03PZz2w34zUkI0hzp0i
    const that = this;
    cont2.add({
      data: {
        id: openId,
        openId,
        name: new Date().getTime(),
        count: 100,
        createTime: that.formatTime(new Date()),
        date: that.formatTime(new Date()),
        lastLoginDate: that.formatTime(new Date()),
        history: [],
        historyMap: {}
      },
      success(res) {
        /* console.log(res) */
        wx.showToast({
          title: '启动成功！',
        })
        that.getAllOpenId()
      }
    })
  },
  // 黑名单判断
  preOpenVideoAd(e) {
    const that = this
    console.log('this.data.currentOpenId====', this.data.currentOpenId)
    if (!this.data.currentOpenId) {
      wx.showModal({
        title: '登录异常',
        content: '请联系管理员，或稍后重新登录',
        success: function() {
          that.init();
        }
      })
      return;
    }
    let currentUserInfo = this.data.idMap[this.data.currentOpenId];
    this.setData({
      currentUserInfo: currentUserInfo || {},
    })
    if (currentUserInfo?.count > 50000) {
      wx.showModal({
        title: '检测到问题操作',
        content: '包含敏感搜索，或者搜索频率过于频繁，请休息4小时，或直接联系管理员恢复',
      })
      wx.getUserInfo({
        success: function (res) {
          console.log('获取用户信息回调', res)
        }
      })
      console.log('click-------------')
    } else {
      // 允许点击
      this.openVideoAd(e);
    }
  },
  // button 点击事件
  openVideoAd(e) {
    var index = e.currentTarget.dataset.value;
    if(this.data.currentUserInfo.count < 102) {
      this.data.obj[index].status = 0;
      this.acceptMission();
      return
    }
    if (index > -1) {
        this.data.obj[index].status = 0;
    } else {
      wx.showModal({
        title: '提示',
        content: '视频广告拉取失败',
      })
    }
    if (videoAd) {
      videoAd.show().catch(err => {
        // 失败重试
        this.data.obj[index].status = null;
        videoAd.load()
          .then(() => videoAd.show())
      })
    }
  },
  ToSearch: function (e) {
    var that = this
    let gameName = that.data.search;
    if (gameName == '' || null == gameName) {
      wx.showToast({
        title: '请输入游戏名',
        icon: 'none'
      })
      return
    }
    console.log('查询游戏：' + this.data.search);
    cont.where({
      name: {
        $regex: '.*' + gameName + '.*'
      }
    }).get().then(res => {
      console.log('查询结果：' + res);
      if (res.data.length != 0) {
        that.setData({
          obj: res.data,
          displayClass: "block",
          downloaDisplayClass: "none",
          illustrateDisplayClass: "none"
        })
      } else {
        that.setData({
          obj: []
        })
        wx.showToast({
          title: '此游戏暂未收录，请反馈给管理员',
          icon: 'none'
        })
      }
    })
  },
  // 获取搜索openid
  getAllOpenId(fn) {
    cont2.get({
      success: res => {
        let dataList = res.data
        const blackOpenIdList = [];
        let idMap = {}
        dataList.forEach(item => {
          blackOpenIdList.push(item.openId)
          idMap[item.openId] = item
        });
        console.log('获取数据 === ', idMap)
        this.setData({
          blackOpenIdList,
          idMap
        })
        fn && fn()
      }
    })
  },
  formatTime(date) {
    const formatNumber = n => {
      n = n.toString()
      return n[1] ? n : `0${n}`
    }
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.getAllOpenId(this.init)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const result = wx.getStorageSync('name')
    if (result) {
      this.setData({
        search: result,
      })
      this.ToSearch();
      wx.setStorageSync('name', "")
    } else {
      this.setData({
        search: '',
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

})