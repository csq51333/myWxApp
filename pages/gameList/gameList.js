// pages/search/search.js

const db = wx.cloud.database({
  env: 'cloud1-4gsk595ef96de889'
})

const app = getApp();
const cont = db.collection('gameSharingDB');
// pages/notice/notice.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTab:0,
    lists:[],
    page:1,
    mobileGameList:[],
    mobileGamePage:1,
    request:true,
    utilitySoftwareRequest:true,
    mobileGameRequest:true,
    utilitySoftwareList:[],
    utilitySoftwarePage:1,
    gameCount:0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.notices();
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  bindChange: function (e) {
    var that = this;
    that.setData({ currentTab: e.detail.current });
    this.notices();
  },
  swichNav: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  },

  getGameCount: function(e) {
    var that=this
      cont.count().then(res => {
          if(null != res) {       
            that.setData({
              gameCount: res.total,
            })
          }else {
            that.setData({
              gameCount: 2388,
            })
          }
      })
  },
  notices(){
    let that = this;
    let page = this.data.page ;
    const currentTab = that.data.currentTab;
    //请求 为false时 提示没有数据加载
    if (!this.data.request && currentTab == 0) {
      wx.showToast({
        title: '已经没有更多新数据了',
        icon: 'none',
        duration: 1500,
        mask: true
      });
      return false;
    } 

    if (!this.data.utilitySoftwareRequest && currentTab == 2) {
      wx.showToast({
        title: '已经没有更多新数据了',
        icon: 'none',
        duration: 1500,
        mask: true
      });
      return false;
    } 

    if (!this.data.mobileGameRequest && currentTab == 1) {
      wx.showToast({
        title: '已经没有更多新数据了',
        icon: 'none',
        duration: 1500,
        mask: true
      });
      return false;
    }

    //加载数据
    wx.showLoading({
      title: '数据加载中...',
      mask: true
    })

    if (currentTab == 1) {
      cont.where({name: { $regex: '.*' + "其他游戏" +'.*' }}).skip((that.data.mobileGamePage - 1) * 20).limit(that.data.mobileGamePage*20).get().then(res => {
        console.log('查询结果：' + res);
        wx.hideLoading({})
        if(res.data.length != 0) {        
          that.setData({
            mobileGameList: that.data.mobileGameList.concat(res.data),
            mobileGamePage: that.data.mobileGamePage + 1
          })
        }else {
          that.setData({
            mobileGameRequest: false
          });
          // 没有数据
          wx.showToast({
            title: '没有更多新数据了',
            icon: 'none',
            duration: 1500,
            mask: true
          });
        }
      })
    } else {
      cont.where({name: { $regex: '.*' + "PC游戏" +'.*' }}).skip((that.data.page - 1) * 20).limit(that.data.page*20).get().then(res => {
        console.log('查询结果：' + res);
        wx.hideLoading({})
        if(res.data.length != 0) {       
          that.setData({
              lists: that.data.lists.concat(res.data),
              page: that.data.page + 1
            })
        } else {
          that.setData({
            request: false
          });
          // 没有数据
          wx.showToast({
            title: '没有更多新数据了',
            icon: 'none',
            duration: 1500,
            mask: true
          });
        }
      })
    }
  
  },
  queryGame(e) {
      let name = e.currentTarget.dataset.value;
      let newName;
      if (name.length > 12) {
        newName = name.substring(6,12);
      } else {
        newName = name
      }
      wx.setStorageSync('name', newName)  
      wx.switchTab({
        url: '/pages/search/search?name=' + name
      });
  },
  //触底加载更多
  bottom(){
    this.notices();
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // this.getGameCount();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      page:1,
      request:true,
      lists:[]
    })
    this.notices();
    wx.showNavigationBarLoading() //在标题栏中显示加载
    //模拟加载
    setTimeout(function(){
      // complete
      wx.hideNavigationBarLoading() //完成停止加载
      wx.stopPullDownRefresh() //停止下拉刷新
    },2000);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
