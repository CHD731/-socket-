// 云函数入口文件
const cloud = require('wx-server-sdk')
const express = require('express')
const WebSocket = require('ws');
let app = express()
// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})
app.use('/login',(req,res)=> {
  console.log(req.query);
})
app.listen(3000, function() {
  console.log('listen 3000')
  setInterval(()=>{
    console.log(1);
  },1000)
})
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}