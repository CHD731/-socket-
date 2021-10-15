// pages/profile/index.js
let app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    sexImgUrl: '',
    profileList: [{
        imgUrl: '../../images/profile/feedback.png',
        text: '版本信息'
      },
      {
        imgUrl: '../../images/profile/feedback.png',
        text: '意见反馈'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getStorage({
      key: 'storageInfo',
      success(res) {
        console.log(res);
        let sexImgUrl = ''
        if (res.data.userInfo.gender === 1) {
          sexImgUrl = '../../images/profile/male.png'
        } else if (res.data.userInfo.gender === 0) {
          sexImgUrl = '../../images/profile/female.png'
        } else {
          sexImgUrl = ''
        }
        that.setData({
          userInfo: res.data.userInfo,
          sexImgUrl: sexImgUrl
        })
      },
      fail() {
        console.log('数据获取失败');
      }
    })
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
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4 //这个数字是当前页面在tabBar中list数组的索引
      })
    }

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