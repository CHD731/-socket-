var express = require("express");
var router = express.Router();
let https = require('https')
let mysql = require('mysql');
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'chatdemo'
});

connection.connect();

router.get('/login', (req, appRes) => {
  // 静默登录流程
  // 传过来的参数
  let code = req.query.code;
  let appId = req.query.appId;
  let secret = 'a9bca3b773535be728ffb2f8ef8b4ba5'
  // 用传过来的参数去请求官方接口换取session_key
  https.get({
    hostname: 'api.weixin.qq.com',
    path: '/sns/jscode2session?appid=' + appId + '&secret=' + secret + '&js_code=' + code + '&grant_type=authorization_code'
  },
    function (res) {
      let resultData;
      res.on("data", function (chunk) {
        resultData = chunk.toString();
      });
      res.on("end", function () {
        resultData = JSON.parse(resultData);
        resultData.openid = resultData.openid.replace(/-/g,'_');
        console.log(resultData);
        // //临时处理，因为小程序测试号与主号的openid一样
        // let time = new Date().getTime()+'';
        // resultData.openid = resultData.openid+time.substring(8);
        // 返回session_key
        appRes.send(resultData);
      })
    })
})
router.get('/', (req, res) => {
  res.send('<h1>Welcome Realtime Server123</h1>');
});

// 获取好友列表数据
router.get('/getConcats', (req, res) => {
  let openid = req.query.openid;
  let table_concats_name = 'c_' + openid;
  // 保存用户的好友列表
  let user_concats = [];
  // 先检查user_info是否有该用户
  let check_sql_user = `select openid from user_info where openid = '${openid}'`;
  connection.query(check_sql_user, (err, result) => {
    if (err) console.log(err);
    else {
      // 如果没有就将用户添加到数据库
      if (result.length === 0) {
        let set_sql_user = `insert into user_info values ('${openid}',null)`;
        connection.query(set_sql_user, (err, result) => {
          if (err) console.log(err);
          res.end('好友列表为空');
        })
      }
      // 用户已经在user_info中
      else {
        // 检查是否存在好友表
        connection.query(`show tables like '${table_concats_name}'`, (err, result) => {
          if (err) console.log(err);
          // 如果存在好友表
          if (result.length !== 0) {
            // 先查询用户好友列表是否为空
            let sql_get_concats = `select concats_id from ${table_concats_name} where concats_id='${openid}'`;
            connection.query(sql_get_concats, (err, result) => {
              if (err) console.log(err);
              else {
                // 如果好友列表为空
                if (result.length === 0) {
                  res.end('好友列表为空');
                }
                // 不为空就获取数据(concats和room)
                else {
                  new Promise((resolve, reject) => {
                    // 获取用户的好友表数据
                    // let sql_find_concats = `select * from concats left join user_info on concats.openid = user_info.concats where concats.openid = '${openid}'`;
                    let sql_find_concats = `select * from ${table_concats_name} left join user_info on ${table_concats_name}.concats_id = user_info.concats`;
                    connection.query(sql_find_concats, (err, result) => {
                      if (err) {
                        console.log(err);
                      }
                      else {
                        if (result.length > 0) {
                          result = JSON.parse(JSON.stringify(result[0]));
                          result.user_room = {}
                          // 将concats的查询结果传给promise
                          resolve(result)
                        }
                      }
                    })
                  }).then(response => {
                    let table_room_name = 'r_' + openid.substring(0, 12) + response.reciev_openid.substring(12, 24);
                    // 获取用户与每个好友的room表数据
                    let sql_find_room = `select * from ${table_room_name} left join ${table_concats_name} on ${table_room_name}.room_id = ${table_concats_name}.room`;
                    // 检查是否有room表
                    connection.query(`show tables like '${table_room_name}'`, (err, result) => {
                      if (err) console.log(err);
                      // 如果有这个room表
                      if (result.length !== 0) {
                        connection.query(sql_find_room, (err, result) => {
                          if (err) console.log(err);
                          else {
                            // 将user_room放在user_cooncats中
                            if (result.length > 0) {
                              response.user_room = JSON.parse(JSON.stringify(result[0]));
                            }
                            user_concats.push(response);
                            res.send(user_concats);
                          }
                        })
                      }
                      else {
                        res.send(user_concats)
                      }
                    })

                  })
                }
              }
            })
          }
          // 如果不存在好友表，返回空数组
          else {
            res.end('好友列表为空');
          }
        })
      }
    }
  })

}),
  module.exports = router;


