// pages/search/search.js

// const db = wx.cloud.database({
//   env: 'cloud1-220911-1gtbon2c3a37f990'
// })
const db = wx.cloud.database({
  env: 'cloud1-4gsk595ef96de889'
})
// const dbRender = db.collection('selfCenter');
const dbRender = db.collection('selfCenter');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    renderList: [],
    showText: false,
    showImage: false,
    index: 0,
  },
  tapName (event) {

  },
  getRenderList() {
    dbRender.get({
      success: res => {
        let dataList = res.data
        console.log('render', res.data)
        let obj = dataList[0] || {}
        let index = obj.index

        const currentObj = dataList[index]
        const renderList = currentObj.content || []
        const showText = currentObj.showText
        const showImage = currentObj.showImage
        
        
        console.log('获取的renderlist', renderList)
        this.setData({
          renderList,
          showText,
          showImage,
          index
        })
      }
    })
  },
  addContent() {
    let that = this
    dbRender.add({
      data: {
        type: 'index',
        index: 3,
        name: new Date().getTime(),
        showText: true,
        showImage: true,
        content: [
          {
            type: 'str',
            content: '2号标题',
            class: 'title color333490 weight600 textCenter'
          },
          {
            type: 'img',
            content: 'http://www.chenshiqi.xyz:3000/%E7%AC%AC69%E9%A1%B5.jpg',
            class: 'img display-flex'
          },
          {
            type: 'str',
            content: '无所谓，\n是不是一个好的文章\n我是普通文案\n然后又段落\n\n好几个段落内容',
            class: 'fontSize14 textCenter'
          },
        ],
        date: that.formatTime(new Date()),
      },
      success(res) {
        /* console.log(res) */
        wx.showToast({
          title: '添加成功！',
        })
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
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // this.addContent()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getRenderList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

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

  }
})