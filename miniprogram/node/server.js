let app = require('express')()
const http = require('http').Server(app);
const io = require('socket.io')(http);
let router = require('./route')
const port = 3000;
let mysql = require('mysql');
let connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'chatdemo'
});

connection.connect();

app.use(router);


let userServer = {};
let userList = {};
let freeList = [];
// 男表（匹配表）
let freeListMale = [];
// 女表（匹配表）
let freeListFemale = [];

let count = 0;
io.on('connection', function (socket) {
  count += 1;
  socket.on('newUser', function (data) {
    // 将data的值赋值
    let user_Info = data.user_Info,
      nickname = user_Info.user_name,
      user_id = data.user_id,
      user_gender = user_Info.gender;

    socket.id = user_id;

    userServer[user_id] = socket;
    // 用户信息表
    userList[user_id] = user_Info;
    new Promise((resolve, reject) => {
      let table_concats_name = 'c_' + user_id;
      // 获取好友，后续匹配时需要过滤好友列表的人
      connection.query(`show tables like '${table_concats_name}'`, (err, result) => {
        if (err) console.log(err);
        if (result.length !== 0) {
          let get_common_friend = `select reciev_openid from ${table_concats_name} left join user_info on ${table_concats_name}.concats_id = user_info.concats where ${table_concats_name}.concats_id = '${user_id}'`;
          connection.query(get_common_friend, (err, result) => {
            result = result === undefined ? [] : result
            if (err) {
              console.log(err);
              console.log('result', result);
            }
            resolve(result)
          })
        }
        else {
          resolve([])
        }
      })
    }).then(friendArr => {
      let from = {
        user_id: user_id,
        user_gender: user_gender
      }
      freeList.push(from);

      io.emit('onlineCount', freeList)
      io.emit('addCount', count)

      // 如果是男的
      if (user_gender === 1) {
        freeListMale.push(from)
        if (freeListFemale.length > 0) {
          if (freeListFemale.length === 1) {
            n = 0;
          } else {
            n = Math.floor(Math.random() * freeListFemale.length);
          }
          if (friendArr.indexOf(freeListFemale[n]) === -1) {
            let to = freeListFemale[n];
            // 匹配到就在表中删除
            Arrayremove(freeList, from);
            Arrayremove(freeList, to);
            Arrayremove(freeListMale, from);
            Arrayremove(freeListFemale, to);
            // io是给所有人发
            io.emit("getChat", { p1: from, p2: to }, userList);
          }
        }
      }
      else {
        freeListFemale.push(from)
        if (freeListMale.length > 0) {
          if (freeListMale.length === 1) {
            n = 0;
          } else {
            n = Math.floor(Math.random() * freeListMale.length);
          }
          if (friendArr.indexOf(freeListMale[n]) === -1) {
            let to = freeListMale[n];
            // 匹配到就在表中删除
            Arrayremove(freeList, from);
            Arrayremove(freeList, to);
            Arrayremove(freeListFemale, from);
            Arrayremove(freeListMale, to);
            console.log('from');
            io.emit("getChat", { p1: from, p2: to }, userList);
          }
        }
      }

      // 过滤好友并返回新数组（已经过深拷贝）
      // tmp_freeList = filterArr(freeList,friendArr,user_id);
      // 匹配过程
      let found = [];
      // function find() {
      //   if(freeList.length > 0){
      //     if(freeList.length === 1){
      //       n = 0;
      //     }else{
      //       n = Math.floor(Math.random() * freeList.length);
      //     }
      //     // 匹配到了同性或者好友
      //     if (freeList[n].user_gender===user_gender || friendArr.indexOf(freeList[n])!==-1) {
      //         // find()
      //       // Arrayremove(freeList,to)
      //       // io.emit("getChat",{p1:from,p2:to},userList);
      //     }
      //     else {
      //       Arrayremove(freeList,from)
      //       let to = freeList[n]
      //       Arrayremove(freeList,to)
      //       io.emit("getChat",{p1:from,p2:to},userList);
      //       return to
      //     }
      //   }
      // }

      //  find();
    })





    // 匹配成功后将对象写入concats表
    socket.on('sqlAddUser', (to_user) => {
      let to_id = to_user.to_id;
      console.log('to_user',to_user);
      // 如果undefined就退出（测试一下是不是三个都会执行）--------------------------------------------------
      let to_user_info = userList[to_id];
      // to_user_info = to_user.to_User_Info;
      let user_id = to_user.user_id;
      let to_user_nickName = to_user_info.nickName;
      // 将带有emoji的昵称转码
      to_user_nickName = utf16toEntities(to_user_nickName);
      // room的表名用自己的openid和对方的openid各取一部分拼接起来
      let table_room_name = 'r_' + user_id.substring(0, 12) + to_id.substring(12, 24);
      let table_concats_name = 'c_' + user_id;

      let create_table_concats = `CREATE TABLE ${table_concats_name}  (
concats_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
own_openid varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL COMMENT '自己的id',
reciev_openid varchar(225) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '对面的id',
reciev_avatar varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '接收者（好友）的头像',
reciev_nick varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '接收者（好友）的昵称',
last_msg varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '最后一条信息',
room varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
PRIMARY KEY (concats_id) USING BTREE,
INDEX room(room) USING BTREE,
INDEX openid(concats_id) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC`;


      // CONSTRAINT ${user_id} FOREIGN KEY (room) REFERENCES room (room_id) ON DELETE RESTRICT ON UPDATE RESTRICT
      let create_table_room = `CREATE TABLE ${table_room_name}  (
room_id varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '' COMMENT '房间id',
msg longtext CHARACTER SET utf8 COLLATE utf8_general_ci NULL COMMENT '发送信息',
msg_time datetime NULL DEFAULT NULL COMMENT '发送时间',
sender_id varchar(10) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '这个消息是谁发送的',
PRIMARY KEY (room_id) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = DYNAMIC`

      let update_sql_user = `update user_info set concats = '${user_id}' where openid = '${user_id}'`;
      let insert_sql_concats = `insert into ${table_concats_name} values ('${user_id}','${user_id}','${to_id}','${to_user_info.avatarUrl}','${to_user_nickName}','last_msg','${to_id}')`;
      let insert_sql_room = `insert into ${table_room_name} values ('${to_id}','',now(),'right')`;
      let check_sql_user = `select concats from user_info where openid = '${user_id}'`;

      let off_key = `SET FOREIGN_KEY_CHECKS = 0`;
      let on_key = `SET FOREIGN_KEY_CHECKS = 1`;
      // 检查是否有好友表
      connection.query(`show tables like '${table_concats_name}'`, (err, result) => {
        if (err) console.log(err);
        // 如果没有好友表
        if (result.length === 0) {
          // 创建好友表和房间表
          connection.query(create_table_concats, (err, result) => {
            if (err) console.log(err);
            else {
              // 关闭主键，为了插入数据
              connection.query(off_key, (err, result) => {
                if (err) console.log(err);
                else {
                  connection.query(update_sql_user, (err, result) => {
                    if (err) console.log(err);
                    else {
                      // 将好友插入到好友列表
                      connection.query(insert_sql_concats, (err, result) => {
                        if (err) console.log(err);
                        else {
                          // 创建与该好友的room表
                          connection.query(create_table_room, (err, result) => {
                            if (err) console.log(err);
                          })
                          // 打开主键
                          connection.query(on_key, (err, result) => {
                            if (err) console.log(err);
                          })
                        }
                      })
                    }
                  })
                }
              })

            }
          })
        }
        // 有好友表,插入数据
        else {
          ----------------------------------------------------------------
        }
      })

    })
  })


  // socket.on('disconnect', function () { //用户注销登陆执行内容
  //   count -= 1;
  //   let id = socket.id
  //   Arrayremove(freeList, id)
  //   delete userServer[id]
  //   delete userList[id]
  //   io.emit('onlineCount', freeList)
  //   io.emit('offline', { id: id })
  //   io.emit('addCount', count)
  // })

  socket.on('message', function (data) {
    console.log(data.msg);
    if (userServer.hasOwnProperty(data.to)) {
      userServer[data.to].emit('getMsg', { msg: data.msg })
    } else {
      socket.emit("err", { msg: "对方已经下线或者断开连接" })
    }
  })
  socket.on('sendImg', function (data) {
    if (userServer.hasOwnProperty(data.to)) {
      userServer[data.to].emit('getImg', { msg: data.msg })
    } else {
      socket.emit("err", { msg: "对方已经下线或者断开连接" })
    }
  })
})


// fromArr是自己性别的表，toArr是过滤之后局部的异性匹配表，tmpToArr是全局的异性匹配表,user_id是自己的id
// 以下注释将自己性别假设为男(from)，匹配的异性为女(to)
// function find(fromArr, toArr, tmpToArr, user_id) {
//   // 因为这里实参和形参传的都是一样的数组，所以给fromarr赋值时，toArr会有值 ???????????????
//   // 将女表发过去（人数大于0就显示匹配中）
//   io.emit('onlineCount', toArr)
//   // 临时（已改回）
//   if (toArr.length > 0) {
//     // from为自己
//     let from = user_id;
//     // 从男表中删除自己
//     Arrayremove(fromArr, from)
//     // 如果女表只有一个人就选ta
//     if (toArr.length === 1) {
//       n = 0
//     } else {
//       n = Math.floor(Math.random() * toArr.length);
//     }
//     // 将匹配到的异性赋值到to
//     let to = toArr[n];
//     // 将她从表中删除
//     Arrayremove(tmpToArr, to);
//     let obj = { p1: from, p2: to }
//     io.emit("getChat", obj, userList)
//     return obj
//   }
// }


function Arrayremove(array, name) {
  let len = array.length;
  for (let i = 0; i < len; i++) {
    if (array[i] == name) {
      array.splice(i, 1)
      break
    }
  }
}

// 表情转码
function utf16toEntities(str) {
  const patt = /[\ud800-\udbff][\udc00-\udfff]/g; // 检测utf16字符正则
  str = str.replace(patt, (char) => {
    let H;
    let L;
    let code;
    let s;

    if (char.length === 2) {
      H = char.charCodeAt(0); // 取出高位
      L = char.charCodeAt(1); // 取出低位
      code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00; // 转换算法
      s = `&#${code};`;
    } else {
      s = char;
    }

    return s;
  });

  return str;
}

// 过滤掉等待匹配表和好友列表的共同好友
//sexArr:需要匹配的性别表
function filterArr(sexArr, friendArr, user_id) {
  let new_sexArr = [];
  // 数组深拷贝
  for (let i = 0; i < sexArr.length; i++) {
    new_sexArr[i] = sexArr[i];
  }
  let newArr = new Set(new_sexArr.concat(friendArr));
  // 在表中删除自己
  newArr.delete(user_id);
  return Array.from(newArr);
}
// 表情解码
function entitiestoUtf16(strObj) {
  const patt = /&#\d+;/g;
  const arr = strObj.match(patt) || [];

  let H;
  let L;
  let code;

  for (let i = 0; i < arr.length; i += 1) {
    code = arr[i];
    code = code.replace('&#', '').replace(';', '');
    // 高位
    H = Math.floor((code - 0x10000) / 0x400) + 0xD800;
    // 低位
    L = ((code - 0x10000) % 0x400) + 0xDC00;
    code = `&#${code};`;
    const s = String.fromCharCode(H, L);
    strObj = strObj.replace(code, s);
  }
  return strObj;
}
http.listen(3000, function () {
  console.log('http://localhost:3000/');
})