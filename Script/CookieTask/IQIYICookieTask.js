/*
爱奇艺会员签到脚本

更新时间: 2024/05/15
脚本兼容: QuantumultX, Surge4, Loon, JsBox, Node.js
电报频道: @NobyDa
问题反馈: @NobyDa_bot

获取Cookie说明：
Safari浏览器打开 https://m.iqiyi.com/user.html 使用密码登录, 如通知成功获取cookie则可使用该脚本.
获取Cookie后, 请将Cookie脚本禁用并移除主机名，以免产生不必要的MITM.
脚本将在每天上午9:00执行, 您可以修改执行时间。

如果使用Node.js, 需自行安装'request'模块. 例: npm install request -g

Node.js环境变量相关：
Cookie：IQIYI_COOKIE
Debug调试：IQIYI_DEBUG
Bark通知推送Key：BARK_PUSH
Bark服务端(默认官方)：BARK_SERVER

JsBox, Node.js用户获取Cookie说明：
方法一手机：开启抓包, 网页登录 https://m.iqiyi.com/user.html 返回抓包APP搜索URL关键字 apis/user/info.action 复制请求头中的Cookie字段填入以下脚本变量或环境变量中即可

方法二PC：网页登录 https://www.iqiyi.com 按F12控制台执行 console.log(document.cookie) 复制打印的Cookie填入以下脚本变量或环境变量中即可
*/

var cookie = ''; //单引号内填入手动获取的Cookie

var barkKey = ''; //Bark APP 通知推送Key

var barkServer = ''; //Bark APP 通知服务端地址(默认官方)

/*********************
QuantumultX 远程脚本配置:
**********************
[task_local]
# 爱奇艺会员签到
0 9 * * * https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

[rewrite_local]
# 获取Cookie
^https:\/\/passport\.iqiyi\.com\/apis\/user\/ url script-request-header https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

[mitm]
hostname= passport.iqiyi.com

**********************
Surge 4.2.0+ 脚本配置:
**********************
[Script]
爱奇艺签到 = type=cron,cronexp=0 9 * * *,timeout=120,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

爱奇艺获取Cookie = type=http-request,pattern=^https:\/\/passport\.iqiyi\.com\/apis\/user\/,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

[MITM]
hostname= passport.iqiyi.com

************************
Loon 2.1.0+ 脚本配置:
************************

[Script]
# 爱奇艺签到
cron "0 9 * * *" script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

# 获取Cookie
http-request ^https:\/\/passport\.iqiyi\.com\/apis\/user\/ script-path=https://raw.githubusercontent.com/NobyDa/Script/master/iQIYI-DailyBonus/iQIYI.js

[Mitm]
hostname= passport.iqiyi.com

*/

var LogDetails = false; // 响应日志

var pushMsg = [];

let P00001, P00003, DFP

var $nobyda = nobyda();

(async () => {
  cookie = cookie || $nobyda.read("CookieQY")
  LogDetails = $nobyda.read("iQIYI_LogDetails") === "true" ? true : LogDetails
  if (typeof process !== 'undefined' && typeof process.env !== 'undefined') {
    cookie = cookie || process.env.IQIYI_COOKIE;
    LogDetails = LogDetails || process.env.IQIYI_DEBUG;
    barkKey = barkKey || process.env.BARK_PUSH;
    barkServer = barkServer || process.env.BARK_SERVER;
  }
  if ($nobyda.isRequest) {
    GetCookie()
  } else if (cookie) {
    if (cookie.includes("P00001") && cookie.includes("P00003") && cookie.includes("__dfp=")) {
      P00001 = cookie.match(/P00001=(.*?);/)[1];
      P00003 = cookie.match(/P00003=(.*?);/)[1];
      DFP = cookie.match(/__dfp=(\w+)/)[1];
      await login();
      await Checkin();
      /*
      for (let i = 0; i < 3; i++) {
        const run = await Lottery(i);
        if (run) {
          await new Promise(r => setTimeout(r, 1000));
        } else {
          break
        }
      }
      */
      const tasks = await getTaskList();
      for (let i = 0; i < tasks.length; i++) {
        if (![1, 4].includes(tasks[i].status)) { //0：待领取 1：已完成 2：未开始 4：进行中
          await joinTask(tasks[i]);
          await notifyTask(tasks[i]);
          await new Promise(r => setTimeout(r, 1000));
          await getTaskRewards(tasks[i]);
          console.log(`--------------------`)
        }
      }
      const expires = $nobyda.expire ? $nobyda.expire.replace(/\u5230\u671f/, "") : "获取失败 ⚠️"
      if (!$nobyda.isNode) $nobyda.notify("爱奇艺", "到期时间: " + expires, pushMsg.join('\n'));
      if (barkKey) await BarkNotify($nobyda, barkKey, '爱奇艺', `到期时间: ${expires}\n${pushMsg.join('\n')}`, barkServer);
      await $nobyda.time();
    } else {
      console.log(`Cookie缺少关键值，需重新获取`)
    }
  } else {
    $nobyda.notify("爱奇艺会员", "", "签到终止, 未获取Cookie");
  }
})().finally(() => {
  $nobyda.done();
})

function login() {
  return new Promise(resolve => {
    var URL = {
      url: 'https://cards.iqiyi.com/views_category/3.0/vip_home?secure_p=iPhone&scrn_scale=0&dev_os=0&ouid=0&layout_v=6&psp_cki=' + P00001 + '&page_st=suggest&app_k=8e48946f144759d86a50075555fd5862&dev_ua=iPhone8%2C2&net_sts=1&cupid_uid=0&xas=1&init_type=6&app_v=11.4.5&idfa=0&app_t=0&platform_id=0&layout_name=0&req_sn=0&api_v=0&psp_status=0&psp_uid=451953037415627&qyid=0&secure_v=0&req_times=0',
      headers: {
        sign: '7fd8aadd90f4cfc99a858a4b087bcc3a',
        t: '479112291'
      }
    }
    $nobyda.get(URL, function (error, response, data) {
      const Details = LogDetails ? data ? `response:\n${data}` : '' : ''
      if (!error && data.match(/\"text\":\"\d.+?\u5230\u671f\"/)) {
        $nobyda.expire = data.match(/\"text\":\"(\d.+?\u5230\u671f)\"/)[1]
        console.log(`爱奇艺-查询成功: ${$nobyda.expire} ${Details}`)
      } else {
        console.log(`爱奇艺-查询失败${error || ': 无到期数据 ⚠️'} ${Details}`)
      }
      resolve()
    })
  })
}

function Checkin() {
  const timestamp = new Date().getTime();
  const stringRandom = (length) => {
    var rdm62, ret = '';
    while (length--) {
      rdm62 = 0 | Math.random() * 62;
      ret += String.fromCharCode(rdm62 + (rdm62 < 10 ? 48 : rdm62 < 36 ? 55 : 61))
    }
    return ret;
  };
  return new Promise(resolve => {
    const sign_date = {
      task_code: 'natural_month_sign',
      timestamp: timestamp,
      appKey: 'lequ_rn',
      userId: P00003,
      authCookie: P00001,
      agenttype: 20,
      agentversion: '15.4.6',
      srcplatform: 20,
      appver: '15.4.6',
      qyid: md5(stringRandom(16))
    };

    const post_date = {
      "natural_month_sign": {
        "verticalCode": "iQIYI",
        "agentVersion": "15.4.6",
        "authCookie": P00001,
        "taskCode": "iQIYI_mofhr",
        "dfp": DFP,
        "qyid": md5(stringRandom(16)),
        "agentType": 20,
        "signFrom": 1
      }
    };
    const sign = k("cRcFakm9KSPSjFEufg3W", sign_date, {
      split: "|",
      sort: !0,
      splitSecretKey: !0
    });
    var URL = {
      url: 'https://community.iqiyi.com/openApi/task/execute?' + w(sign_date) + "&sign=" + sign,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post_date)
    }
    $nobyda.post(URL, function (error, response, data) {
      let CheckinMsg, rewards = [];
      const Details = LogDetails ? `msg:\n${data || error}` : '';
      try {
        if (error) throw new Error(`接口请求出错 ‼️`);
        const obj = JSON.parse(data)
        if (obj.code === "A00000") {
          if (obj.data.code === "A0000") {
            for (let i = 0; i < obj.data.data.rewards.length; i++) {
              if (obj.data.data.rewards[i].rewardType == 1) {
                rewards.push(`成长值+${obj.data.data.rewards[i].rewardCount}`)
              } else if (obj.data.data.rewards[i].rewardType == 2) {
                rewards.push(`VIP天+${obj.data.data.rewards[i].rewardCount}`)
              } else if (obj.data.data.rewards[i].rewardType == 3) {
                rewards.push(`积分+${obj.data.data.rewards[i].rewardCount}`)
              }
            }
            var continued = obj.data.data.signDays;
            CheckinMsg = `应用签到: ${rewards.length ? `${rewards.join(", ")}${rewards.length < 3 ? `, 累计签到${continued}天` : ``}` : '无奖励'} 🎉`;
          } else {
            CheckinMsg = `应用签到: ${obj.data.msg} ⚠️`;
          }
        } else {
          CheckinMsg = `应用签到: Cookie无效 ⚠️`;
        }
      } catch (e) {
        CheckinMsg = `应用签到: ${e.message || e}`;
      }
      pushMsg.push(CheckinMsg);
      console.log(`爱奇艺-${CheckinMsg} ${Details}`);
      resolve()
    })
  })
}

function Lottery(s) {
  return new Promise(resolve => {
    const URL = {
      url: 'https://iface2.iqiyi.com/aggregate/3.0/lottery_activity?app_k=0&app_v=0&platform_id=0&dev_os=0&dev_ua=0&net_sts=0&qyid=0&psp_uid=0&psp_cki=' + P00001 + '&psp_status=0&secure_p=0&secure_v=0&req_sn=0'
    }
    $nobyda.get(URL, async function (error, response, data) {
      const Details = LogDetails ? `msg:\n${data || error}` : ''
      let LotteryMsg;
      try {
        if (error) throw new Error("接口请求出错 ‼️");
        const obj = JSON.parse(data);
        if (obj.title) {
          LotteryMsg = `应用抽奖: ${obj.title != '影片推荐' && obj.awardName || '未中奖'} 🎉`;
          LotteryMsg = obj.kv.code == 'Q00702' && `应用抽奖: 您的抽奖次数已经用完 ⚠️` || LotteryMsg;
          $nobyda.stop = obj.kv.code == 'Q00702';
        } else if (obj.kv.code == 'Q00304') {
          LotteryMsg = `应用抽奖: Cookie无效 ⚠️`;
          $nobyda.stop = 1;
        } else {
          LotteryMsg = `应用抽奖: 未知错误 ⚠️`
        }
      } catch (e) {
        LotteryMsg = `应用抽奖: ${e.message || e}`;
      }
      console.log(`爱奇艺-${LotteryMsg} (${s + 1}) ${Details}`)
      pushMsg.push(LotteryMsg)
      resolve(!$nobyda.stop)
    })
  })
}

function getTaskList(task) {
  return new Promise(resolve => {
    $nobyda.get(`https://tc.vip.iqiyi.com/taskCenter/task/queryUserTask?P00001=${P00001}`, function (error, response, data) {
      let taskListMsg, taskList = [];
      const Details = LogDetails ? `msg:\n${data || error}` : '';
      try {
        if (error) throw new Error(`请求失败`);
        const obj = JSON.parse(data);
        if (obj.code == 'A00000' && obj.data && obj.data.tasks) {
          Object.keys(obj.data.tasks).map((group) => {
            (obj.data.tasks[group] || []).map((item) => {
              taskList.push({
                name: item.taskTitle,
                taskCode: item.taskCode,
                status: item.status
              })
            })
          })
          taskListMsg = `获取成功!`;
        } else {
          taskListMsg = `获取失败!`;
        }
      } catch (e) {
        taskListMsg = `${e.message || e} ‼️`;
      }
      console.log(`爱奇艺-任务列表: ${taskListMsg} ${Details}`)
      resolve(taskList)
    })
  })
}

function joinTask(task) {
  return new Promise(resolve => {
    $nobyda.get('https://tc.vip.iqiyi.com/taskCenter/task/joinTask?taskCode=' + task.taskCode + '&lang=zh_CN&platform=0000000000000000&P00001=' + P00001, function (error, response, data) {
      let joinTaskMsg, Details = LogDetails ? `msg:\n${data || error}` : '';
      try {
        if (error) throw new Error(`请求失败`);
        const obj = JSON.parse(data);
        joinTaskMsg = obj.code || '领取失败';
      } catch (e) {
        joinTaskMsg = `错误 ${e.message || e}`;
      }
      console.log(`爱奇艺-领取任务: ${task.name} => ${joinTaskMsg} ${Details}`)
      resolve()
    })
  })
}

function notifyTask(task) {
  return new Promise(resolve => {
    $nobyda.get('https://tc.vip.iqiyi.com/taskCenter/task/notify?taskCode=' + task.taskCode + '&lang=zh_CN&platform=0000000000000000&P00001=' + P00001, function (error, response, data) {
      let notifyTaskMsg, Details = LogDetails ? `msg:\n${data || error}` : '';
      try {
        if (error) throw new Error(`请求失败`);
        const obj = JSON.parse(data);
        notifyTaskMsg = obj.code || '失败';
      } catch (e) {
        notifyTaskMsg = e.message || e;
      }
      console.log(`爱奇艺-开始任务: ${task.name} => ${notifyTaskMsg} ${Details}`)
      resolve()
    })
  })
}

function getTaskRewards(task) {
  return new Promise(resolve => {
    $nobyda.get('https://tc.vip.iqiyi.com/taskCenter/task/getTaskRewards?taskCode=' + task.taskCode + '&lang=zh_CN&platform=0000000000000000&P00001=' + P00001, function (error, response, data) {
      let RewardsMsg;
      const Details = LogDetails ? `msg:\n${data || error}` : ''
      try {
        if (error) throw new Error(`接口请求出错 ‼️`);
        const obj = JSON.parse(data)
        if (obj.msg === "成功" && obj.code === "A00000" && obj.dataNew[0] !== undefined) {
          RewardsMsg = `任务奖励: ${task.name} => ${obj.dataNew[0].name + obj.dataNew[0].value} 🎉`
        } else {
          RewardsMsg = `任务奖励: ${task.name} => ${obj.msg !== `成功` && obj.msg || `未完成`} ⚠️`
        }
      } catch (e) {
        RewardsMsg = `任务奖励: ${e.message || e}`;
      }
      pushMsg.push(RewardsMsg)
      console.log(`爱奇艺-${RewardsMsg} ${Details}`)
      resolve()
    })
  })
}

function GetCookie() {
  if (!$request.url.includes("iqiyi.com")) {
    $nobyda.notify(`写入爱奇艺Cookie失败`, "", "请更新脚本配置(URL正则/MITM)");
    return
  }
  var CKA = $request.headers['Cookie'] || $request.headers['cookie'];;
  var iQIYI = CKA && CKA.includes("P00001=") && CKA.includes("P00003=") && CKA.includes("__dfp=") && CKA;
  var RA = $nobyda.read("CookieQY")
  if (CKA && iQIYI) {
    if (RA != iQIYI) {
      var OldTime = $nobyda.read("CookieQYTime")
      if (!$nobyda.write(iQIYI, "CookieQY")) {
        $nobyda.notify(`${RA ? `更新` : `首次写入`}爱奇艺签到Cookie失败‼️`, "", "")
      } else {
        if (!OldTime || OldTime && (Date.now() - OldTime) / 1000 >= 21600) {
          $nobyda.write(JSON.stringify(Date.now()), "CookieQYTime")
          $nobyda.notify(`${RA ? `更新` : `首次写入`}爱奇艺签到Cookie成功 🎉`, "", "")
        } else {
          console.log(`\n更新爱奇艺Cookie成功! 🎉\n检测到频繁通知, 已转为输出日志`)
        }
      }
    } else {
      console.log("\n爱奇艺-与本机储存Cookie相同, 跳过写入 ⚠️")
    }
  } else {
    $nobyda.notify(`爱奇艺`, "", "写入Cookie失败，关键值缺失 ⚠️")
  }
}

async function BarkNotify(c, k, t, b, p) { for (let i = 0; i < 3; i++) { console.log(`🔷Bark notify >> Start push (${i + 1})`); const s = await new Promise((n) => { c.post({ url: p || 'https://api.day.app/push', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: t, body: b, device_key: k, ext_params: { group: t } }) }, (e, r, d) => r && r.status == 200 ? n(1) : n(d || e)) }); if (s === 1) { console.log('✅Push success!'); break } else { console.log(`❌Push failed! >> ${s.message || s}`) } } }

function nobyda() {
  const times = 0
  const start = Date.now()
  const isRequest = typeof $request != "undefined"
  const isSurge = typeof $httpClient != "undefined"
  const isQuanX = typeof $task != "undefined"
  const isLoon = typeof $loon != "undefined"
  const isJSBox = typeof $app != "undefined" && typeof $http != "undefined"
  const isNode = typeof require == "function" && !isJSBox;
  const node = (() => {
    if (isNode) {
      const request = require('request');
      return ({
        request
      })
    } else {
      return (null)
    }
  })()
  const notify = (title, subtitle, message) => {
    if (isQuanX) $notify(title, subtitle, message)
    if (isSurge) $notification.post(title, subtitle, message)
    if (isNode) log('\n' + title + '\n' + subtitle + '\n' + message)
    if (isJSBox) $push.schedule({
      title: title,
      body: subtitle ? subtitle + "\n" + message : message
    })
  }
  const write = (value, key) => {
    if (isQuanX) return $prefs.setValueForKey(value, key)
    if (isSurge) return $persistentStore.write(value, key)
  }
  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key)
    if (isSurge) return $persistentStore.read(key)
  }
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status
      } else if (response.statusCode) {
        response["status"] = response.statusCode
      }
    }
    return response
  }
  const get = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) $httpClient.get(options, (error, response, body) => {
      callback(error, adapterStatus(response), body)
    })
    if (isNode) {
      node.request(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function (resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data);
        callback(error, adapterStatus(resp.response), body)
      };
      $http.get(options);
    }
  }
  const post = (options, callback) => {
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "POST"
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      options.headers['X-Surge-Skip-Scripting'] = false
      $httpClient.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isNode) {
      node.request.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function (resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data)
        callback(error, adapterStatus(resp.response), body)
      }
      $http.post(options);
    }
  }

  const log = (message) => console.log(message)
  const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2)
    return console.log('\n签到用时: ' + end + ' 秒')
  }
  const done = (value = {}) => {
    if (isQuanX) return $done(value)
    if (isSurge) isRequest ? $done(value) : $done()
  }
  return {
    isRequest,
    isNode,
    notify,
    write,
    read,
    get,
    post,
    log,
    time,
    times,
    done
  }
};

function k(e, t) {
  var a = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}
    , n = a.split
    , c = void 0 === n ? "|" : n
    , r = a.sort
    , s = void 0 === r || r
    , o = a.splitSecretKey
    , i = void 0 !== o && o
    , l = s ? Object.keys(t).sort() : Object.keys(t)
    , u = l.map((function (e) {
      return "".concat(e, "=").concat(t[e])
    }
    )).join(c) + (i ? c : "") + e;
  return md5(u)
}

// Modified from https://github.com/blueimp/JavaScript-MD5
function md5(string) { function RotateLeft(lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)) } function AddUnsigned(lX, lY) { var lX4, lY4, lX8, lY8, lResult; lX8 = (lX & 0x80000000); lY8 = (lY & 0x80000000); lX4 = (lX & 0x40000000); lY4 = (lY & 0x40000000); lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF); if (lX4 & lY4) { return (lResult ^ 0x80000000 ^ lX8 ^ lY8) } if (lX4 | lY4) { if (lResult & 0x40000000) { return (lResult ^ 0xC0000000 ^ lX8 ^ lY8) } else { return (lResult ^ 0x40000000 ^ lX8 ^ lY8) } } else { return (lResult ^ lX8 ^ lY8) } } function F(x, y, z) { return (x & y) | ((~x) & z) } function G(x, y, z) { return (x & z) | (y & (~z)) } function H(x, y, z) { return (x ^ y ^ z) } function I(x, y, z) { return (y ^ (x | (~z))) } function FF(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b) }; function GG(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b) }; function HH(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b) }; function II(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b) }; function ConvertToWordArray(string) { var lWordCount; var lMessageLength = string.length; var lNumberOfWords_temp1 = lMessageLength + 8; var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64; var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16; var lWordArray = Array(lNumberOfWords - 1); var lBytePosition = 0; var lByteCount = 0; while (lByteCount < lMessageLength) { lWordCount = (lByteCount - (lByteCount % 4)) / 4; lBytePosition = (lByteCount % 4) * 8; lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition)); lByteCount++ } lWordCount = (lByteCount - (lByteCount % 4)) / 4; lBytePosition = (lByteCount % 4) * 8; lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition); lWordArray[lNumberOfWords - 2] = lMessageLength << 3; lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29; return lWordArray }; function WordToHex(lValue) { var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount; for (lCount = 0; lCount <= 3; lCount++) { lByte = (lValue >>> (lCount * 8)) & 255; WordToHexValue_temp = "0" + lByte.toString(16); WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2) } return WordToHexValue }; function Utf8Encode(string) { string = string.replace(/\r\n/g, "\n"); var utftext = ""; for (var n = 0; n < string.length; n++) { var c = string.charCodeAt(n); if (c < 128) { utftext += String.fromCharCode(c) } else if ((c > 127) && (c < 2048)) { utftext += String.fromCharCode((c >> 6) | 192); utftext += String.fromCharCode((c & 63) | 128) } else { utftext += String.fromCharCode((c >> 12) | 224); utftext += String.fromCharCode(((c >> 6) & 63) | 128); utftext += String.fromCharCode((c & 63) | 128) } } return utftext }; var x = Array(); var k, AA, BB, CC, DD, a, b, c, d; var S11 = 7, S12 = 12, S13 = 17, S14 = 22; var S21 = 5, S22 = 9, S23 = 14, S24 = 20; var S31 = 4, S32 = 11, S33 = 16, S34 = 23; var S41 = 6, S42 = 10, S43 = 15, S44 = 21; string = Utf8Encode(string); x = ConvertToWordArray(string); a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476; for (k = 0; k < x.length; k += 16) { AA = a; BB = b; CC = c; DD = d; a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478); d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756); c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB); b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE); a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF); d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A); c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613); b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501); a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8); d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF); c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1); b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE); a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122); d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193); c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E); b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821); a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562); d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340); c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51); b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA); a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D); d = GG(d, a, b, c, x[k + 10], S22, 0x2441453); c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681); b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8); a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6); d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6); c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87); b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED); a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905); d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8); c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9); b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A); a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942); d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681); c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122); b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C); a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44); d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9); c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60); b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70); a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6); d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA); c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085); b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05); a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039); d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5); c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8); b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665); a = II(a, b, c, d, x[k + 0], S41, 0xF4292244); d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97); c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7); b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039); a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3); d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92); c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D); b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1); a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F); d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0); c = II(c, d, a, b, x[k + 6], S43, 0xA3014314); b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1); a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82); d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235); c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB); b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391); a = AddUnsigned(a, AA); b = AddUnsigned(b, BB); c = AddUnsigned(c, CC); d = AddUnsigned(d, DD) } var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d); return temp.toLowerCase() }

function w() {
  var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {}
    , t = [];
  return Object.keys(e).forEach((function (a) {
    t.push("".concat(a, "=").concat(e[a]))
  }
  )),
    t.join("&")
}
