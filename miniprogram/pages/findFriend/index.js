// pages/findFriend/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    btnClickState: true
  },
  findFriend() {
    if (!this.data.btnClickState) {
      return
    } else {
      let userInfo = app.globalData.userInfo
      let socket = app.globalData.socket;
      // let id = new Date().getTime() + "" + Math.floor(Math.random() * 899 + 100);
      let id = app.globalData.openId;
      let that = this
      console.log(userInfo);
      this.setData({
        id: id
      })
      socket.emit('newUser', {
        user_id: that.data.id,
        user_Info: userInfo
      })
      
      socket.on('onlineCount', function (data) {
        var len = data.length
        console.log(data);
        // 如果异性匹配的人数大于0
        // 临时大于1
        if (len > 1) {
          wx.showToast({
            title: '匹配中',
          })
          let to;
          let from;
          socket.on('getChat', function (data, userlist) { //如果广播到用户包含自己，则匹配聊天
            // 我方(p1)视角，我是from，对方是to
            console.log(data);
            console.log(that.data.id);
            if (data.p1.user_id === that.data.id) {
              from = data.p1.user_id;
              to = data.p2.user_id;
            // 对方(p2)视角，ta是from，我是to
            } else if (data.p2.user_id === that.data.id) {
              from = data.p2.user_id;
              to = data.p1.user_id;
            }
            else {
              return;
            }
            // var name = userlist[to].nickName
            app.globalData.to_User_Info = userlist[to]
            app.globalData.to = to;
            let tmpObj = {
              to_User_Info: userlist[to],
              to_id: to,
              user_id: from
            }
            console.log(tmpObj);
            // 将对象添加到mysql中的concats
            socket.emit('sqlAddUser',tmpObj);
            if (to) {
              wx.navigateTo({
                url: '../chat/index',
              })
            }
          })
        } else {
          // 匹配按钮不能点击
          that.setData({
            // btnClickState: false
          })
          wx.showToast({
            title: '当前服务器只有您一位空闲用户，请等待其他用户加入',
          })
        }

      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
        selected: 2 //这个数字是当前页面在tabBar中list数组的索引
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