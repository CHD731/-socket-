Component({
  data: {
    baseCode: null,
    resultData: {},
    "selected":0,
    "color": "#D3D3D3",
    "selectedColor":"#25B387",
    "list": [
      {
        "current":0,
        "pagePath": "/pages/forum/index",
        "iconPath": "/images/community.png",
        "selectedIconPath": "/images/community_active.png",
        "text": "论坛"
      },
      {
        "current":1,
        "pagePath": "/pages/activity/index",
        "iconPath": "/images/activity.png",
        "selectedIconPath": "/images/activity_active.png",
        "text": "活动"
      },
      {
        "current":2,
        bulge:true,
        "pagePath": "/pages/findFriend/index",
        "iconPath": "/images/chat.png",
        "selectedIconPath": "/images/chat_active.png",
      },
      {
        "current":3,
        "pagePath": "/pages/friend/index",
        "iconPath": "/images/community.png",
        "selectedIconPath": "/images/community_active.png",
        "text": "好友"
      },
      {
        "current":4,
        "pagePath": "/pages/profile/index",
        "iconPath": "/images/profile.png",
        "selectedIconPath": "/images/profile_active.png",
        "text": "我的"
      }
  ]
  },
  methods: {
    handleTap() {
    },
    switchTab(e) {
      const path = e.currentTarget.dataset.path;
      const data = e.currentTarget.dataset;
      console.log(path);
      console.log(this.data.selected);
      wx.switchTab({
        url: path,
      })
     }
  }
})