// pages/soul/index.js
let app = getApp()
let socket = app.globalData.socket;
let char_record = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chat_record: [],
    to: '',
    toView: null,
    to_User_Info: {},
    userInfo: {},
    imgUrl: ''
  },
  // 发送图片
  sendImg(e) {
    const fs = wx.getFileSystemManager()
    let that = this
    wx.chooseImage({
      count: 9,
      success(res) {
        console.log(res.tempFilePaths);
        let imgArr = res.tempFilePaths;
        for (let i = 0; i < imgArr.length; i++) {
          fs.readFile({
            filePath: imgArr[i],
            encoding: 'base64',
            success(response) {
              let imgUrl = response.data
              socket.emit('sendImg', {
                msg: imgUrl,
                to: that.data.to
              })
              that.setData({
                imgUrl: imgUrl
              })
              that.sendMsg(e)
            }
          })
        }
      }
    })
  },

  // 发送消息函数
  sendMsg(e) {
    let that = this;
    // 如果发送的是纯文字
    console.log(e.detail);
    if (e.detail.type == "msg") {
      var msg = e.detail.sendMessage
      if (msg == "") { //不能发送空值
        return false
      }
      socket.emit('message', {
        msg: msg,
        to: that.data.to
      })
      let obj = {
        msg: msg,
        isMe: true,
        isImg: false,
        to_avatar: that.data.to_User_Info.avatarUrl,
        from_avatar: that.data.userInfo.avatarUrl
      }
      char_record.push(obj)
      that.setData({
        chat_record: char_record
      })
      
    } else {
      // 不然就是发送图片
      let obj = {
        msg: that.data.imgUrl,
        isImg: true,
        isMe: true,
        to_avatar: that.data.to_User_Info.avatarUrl,
        from_avatar: that.data.userInfo.avatarUrl
      }
      // 添加一条聊天记录
      char_record.push(obj)
      that.setData({
        chat_record: char_record,
        // 滑到底部
        toView: `item${that.data.chat_record.length - 1}`
      })
    }

  },
  // 接受消息函数
  getMsg() {
    let that = this
    socket.on('getMsg', function (data) { // 接收消息
      console.log('getMsg');
      let obj = {
        msg: data.msg,
        isMe: false,
        isImg: false,
        to_avatar: that.data.to_User_Info.avatarUrl,
        from_avatar: that.data.userInfo.avatarUrl
      }
      char_record.push(obj)
      that.setData({
        chat_record: char_record,
        toView: `item${that.data.chat_record.length - 1}`
      })
    })
    // 接收图片
    socket.on('getImg', function (data) { // 接收图片
        that.setData({
          imgUrl: data.msg
        })
        let obj = {
          msg: data.msg,
          isImg: true,
          isMe: false,
          to_avatar: that.data.to_User_Info.avatarUrl,
          from_avatar: that.data.userInfo.avatarUrl
        }
        char_record.push(obj)
        that.setData({
          chat_record: char_record,
          // 滑到底部
          toView: `item${that.data.chat_record.length - 1}`
        })
    })
  },
// 点击放大图片
  clickImg(e) {
    let imgUrl = 'data:image/png;base64,'+this.data.imgUrl;
    wx.previewImage({
      urls: [imgUrl],
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMsg()
    let to = app.globalData.to;
    let to_User_Info = app.globalData.to_User_Info;
    console.log(to_User_Info);
    let userInfo = app.globalData.userInfo;
    this.setData({
      to: to,
      to_User_Info: to_User_Info,
      userInfo: userInfo
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
    this.setData({
      toView: `item${this.data.chat_record.length - 1}`
    });
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