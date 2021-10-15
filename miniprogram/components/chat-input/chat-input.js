// components/chat-input/chat-input.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    sendMessage: '',
    isFocus: false,
    isSend: false,
    isShow: false, //控制emoji表情是否显示
    isLoad: true, //解决初试加载时emoji动画执行一次
    cfBg: false,
    emojiChar: "☺-😋-😌-😍-😏-😜-😝-😞-😔-😪-😭-😁-😂-😃-😅-😆-👿-😒-😓-😔-😏-😖-😘-😚-😒-😡-😢-😣-😤-😢-😨-😳-😵-😷-😸-😻-😼-😽-😾-😿-🙊-🙋-🙏-✈-🚇-🚃-🚌-🍄-🍅-🍆-🍇-🍈-🍉-🍑-🍒-🍓-🐔-🐶-🐷-👦-👧-👱-👩-👰-👨-👲-👳-💃-💄-💅-💆-💇-🌹-💑-💓-💘-🚲",
    //0x1f---
    emoji: [
      "01", "02", "03", "04", "05", "06", "07", "08", "09", "10",
      "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
      "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
      "31", "32", "33", "34", "35", "36", "37", "38", "39", "40",
      "41", "42", "43", "44", "45", "46", "47", "48", "49", "50",
      "51", "52", "53", "54", "55",
    ],
    emojis: [], //qq、微信原始表情
    alipayEmoji: [], //支付宝表情
  },
  // 当该组件创建时
  lifetimes: {
    attached() {
      let em = {},
        that = this,
        emChar = that.data.emojiChar.split("-");
      let emojis = []
      that.data.emoji.forEach(function (v, i) {
        em = {
          char: emChar[i],
          emoji: v
        };
        // 表情与数字对应的放到对象中，再推到数组里面
        emojis.push(em)
      });
      that.setData({
        emojis: emojis
      })
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 点击发送消息
    sendMessage() {
      this.send()
    },
    // 键盘回车发送信息
    keySend() {
      this.send()
    },
    //监听输入的message
    bindKeyInput(e) {
      let isSend = e.detail.value == '' ? false : true
      this.setData({
        sendMessage: e.detail.value,
        isSend: isSend
      })
    },
    // 发送图片
    sendImg() {
      this.triggerEvent('sendImg', {
        type: 'img'
      })
    },

    // emoji
    //点击表情显示隐藏表情盒子
    clickEmoji() {
      this.setData({
        isShow: !this.data.isShow,
        isLoad: false,
        isFocus: true
      })
    },
    //表情选择
    emojiChoose(e) {
      //当前输入内容和表情合并
      this.setData({
        sendMessage: this.data.sendMessage + e.currentTarget.dataset.emoji,
        isFocus: true,
        isSend: true
      })
    },


    // 发送文字
    send() {
      // 将事件发送给父组件
      this.triggerEvent('sendMsg', {
        sendMessage: this.data.sendMessage,
        type: 'msg'
      })
      //发送消息后输入框获取焦点
      this.setData({
        isFocus: true,
        sendMessage: '',
        isSend: false
      })
    },
  }
})