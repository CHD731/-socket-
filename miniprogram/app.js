//app.js
import io from './wxsocket.io/index'
App({
  globalData: {
    openId: null,
    userInfo: null,
    concats: []
  },
  onLaunch: function () {
    // create a new socket object
    const socket = io("ws://127.0.0.1:3000")
    socket.emit('aaa',{num:1})
    this.globalData.socket = socket;
    let that = this
    let storageInfo = {}
    // 能get到说明已经登录了
    wx.getStorage({
      key: 'storageInfo',
      success: (res) => {
        that.globalData.openId = res.data.openId
        console.log(that.globalData.openId);
        // 在这里将userinfo添加到全局变量中
        that.globalData.userInfo = res.data.userInfo
      },
    })
    //依照小程序登录流程
    wx.login({
      fail(err) {
        console.log(err);
      },
      success(res) {
        // 获取appid
        let appid = wx.getAccountInfoSync().miniProgram.appId;
        if (res.code) {
          that.globalData.appId = appid;
          that.globalData.code = res.code
        } else {
          console.log('登录失败！' + res.errMsg);
        }
        // 获取好友列表数据
        if (that.globalData.openId) {
          let openId = that.globalData.openId;
          console.log(openId);
          wx.request({
            url: 'http://localhost:3000/getConcats',
            data: {
              openid: openId
            },
            success(res) {
              console.log(res);
              that.globalData.concats = res.data;
            }
          })
        }




        // 用弹窗让用户点击，顺便获取信息
        wx.showModal({
          showCancel: false,
          title: 'test',
          content: '第一次登录',
          success(res) {
            // 获取用户信息
            if (res.confirm) {
              wx.getUserProfile({
                desc: "获取'我的'数据",
                lang: 'zh_CN',
                success(response) {
                  that.globalData.userInfo = response.userInfo;
                  storageInfo.userInfo = response.userInfo;
                  let code = that.globalData.code;
                  let appid = that.globalData.appId;
                  //发起网络请求携带参数
                  wx.request({
                    url: 'http://localhost:3000/login',
                    data: {
                      code: code,
                      appId: appid,
                    },
                    //拿到后端返回的session_key等信息，保存到本地缓存中
                    success(res) {
                      // 把openid的-换成_
                      that.globalData.openId = res.data.openid
                      storageInfo.openId = res.data.openid
                      storageInfo.sessionKey = res.data.session_key
                      console.log(res.data.openid);
                      // 记得用post
                      // 获取好友
                      if (res.data.openid) {
                        wx.request({
                          url: 'http://localhost:3000/getConcats',
                          data: {
                            openid: res.data.openid
                          },
                          success(res) {
                            console.log(res);
                          },
                          fail(){
                            console.log('获取好友列表失败');
                          }
                        })
                      } else {
                        wx.showToast({
                          title: '登录失败，请重新登录',
                        })
                      }
                      wx.setStorage({
                        key: 'storageInfo',
                        data: storageInfo,
                        success() {
                          console.log('info写入成功');
                        }
                      })
                    }
                  })

                },
              })
            } else {
              wx.showToast({
                title: '登录失败',
              })
            }
          }
        })
      }
    })


    // 判断是否为登录态，不是的话就调用wx.login
    //  wx.checkSession({
    //   fail() {
    //     // 用弹窗让用户点击，顺便获取信息
    //     wx.showModal({
    //       showCancel: false,
    //       title: 'test',
    //       content: '第一次登录',
    //       success(res) {
    //         // 获取用户信息
    //         if (res.confirm) {
    //           wx.getUserProfile({
    //             desc: "获取'我的'数据",
    //             lang: 'zh_CN',
    //             success(response) {
    //               that.globalData.userInfo = response.userInfo;
    //               storageInfo.userInfo = response.userInfo;
    //               let code = that.globalData.code;
    //               let appid = that.globalData.appId;
    //               //发起网络请求携带参数
    //               wx.request({
    //                 url: 'http://localhost:3000/login',
    //                 data: {
    //                   code: code,
    //                   appId: appid,
    //                 },
    //                 //拿到后端返回的session_key等信息，保存到本地缓存中
    //                 success(res) {
    //                   that.globalData.openId = res.data.openid
    //                   storageInfo.openId = res.data.openid
    //                   storageInfo.sessionKey = res.data.session_key
    //                   console.log(res.data.openid);
    //                   // 记得用post
    //                   // 获取好友
    //                   if(res.data.openid) {
    //                     wx.request({
    //                       url: 'http://localhost:3000/getConcats',
    //                       data: {
    //                         openid: res.data.openid
    //                       },
    //                       success(res) {
    //                         console.log(res);
    //                       }
    //                     })
    //                   }
    //                   else {
    //                     wx.showToast({
    //                       title: '登录失败，请重新登录',
    //                     })
    //                   }
    //                   wx.setStorage({
    //                     key: 'storageInfo',
    //                     data: storageInfo,
    //                   })
    //                 }
    //               })

    //             },
    //           })
    //         } else {
    //           wx.showToast({
    //             title: '登录失败',
    //           })
    //         }
    //       }
    //     })
    //   }
    // })

  },
})