/*
更新时间: 2021-02-21 22:30

本脚本仅适用于微博每日签到，支持多账号运行  

http-request ^https?:\/\/api\.weibo\.cn\/\d\/users\/show script-path=https://raw.githubusercontent.com/GoodHolidays/Scripts/master/Task/weibo.js, timeout=60, tag=微博每日签到Cookie
cron "0 1 0 * * *" script-path=https://raw.githubusercontent.com/GoodHolidays/Scripts/master/Task/weibo.js, timeout=60, tag=微博每日签到Task
*/

const $ = new Env('新浪微博')
const notify = $.isNode() ? require('./sendNotify') : '';
let tokenArr = [],  cookieArr = [];
let wbtoken = $.getdata('sy_token_wb');
let cookies = $.getdata('wb_cookie');
let signcash = "";
  

if (isGetCookie = typeof $request !== `undefined`) {
    GetCookie();
    $.done()
} else {
    !(async() => {
        if (!$.isNode() && wbtoken.indexOf("#") == -1) {
            tokenArr.push(wbtoken);
            cookieArr.push(cookies)
        } else {
            if ($.isNode()) {
                if (process.env.WB_TOKEN && process.env.WB_TOKEN.indexOf('#') > -1) {
                    wbtoken = process.env.WB_TOKEN.split('#');
                    console.log(`WB_TOKEN您选择的是用"#"隔开\n`)
                } else if (process.env.WB_TOKEN && process.env.WB_TOKEN.indexOf('\n') > -1) {
                    wbtoken = process.env.WB_TOKEN.split('\n');
                    console.log(`WB_TOKEN您选择的是用换行隔开\n`)
                } else {
                    wbtoken = [process.env.WB_TOKEN]
                };
                if (process.env.WB_COOKIE && process.env.WB_COOKIE.indexOf('#') > -1) {
                    cookies = process.env.WB_COOKIE.split('#');
                    console.log(`WB_COOKIE您选择的是用"#"隔开\n`)
                } else if (process.env.WB_COOKIE && process.env.WB_COOKIE.indexOf('\n') > -1) {
                    cookies = process.env.WB_COOKIE.split('\n');
                    console.log(`WB_COOKIE您选择的是用换行隔开\n`)
                } else {
                    cookies = [process.env.WB_COOKIE]
                };
            } else if (!$.isNode() && wbtoken.indexOf("#") > -1) {
                wbtoken = wbtoken.split("#");
                cookies = cookies.split("#")
            }
            Object.keys(wbtoken).forEach((item) => {
                if (wbtoken[item]) {
                    tokenArr.push(wbtoken[item])
                }
            });
            Object.keys(cookies).forEach((item) => {
                if (cookies[item]) {
                    cookieArr.push(cookies[item])
                }
            });
        }
        if (!tokenArr[0]) {
            $.msg($.name, '【提示】请先获取新浪微博一cookie')
            return;
        }
        timeZone = new Date().getTimezoneOffset() / 60;
        timestamp = Date.now() + (8 + timeZone) * 60 * 60 * 1000;
        bjTime = new Date(timestamp).toLocaleString('zh', {
            hour12: false,
            timeZoneName: 'long'
        });
        console.log(`\n === 脚本执行 ${bjTime} ===\n`);
        console.log(`------------- 共${tokenArr.length}个账号\n`)
        for (let i = 0; i < tokenArr.length; i++) {
            if (tokenArr[i]) {
                token = tokenArr[i];
                cookie = cookieArr[i]
                $.index = i + 1;
                console.log(`\n开始【微博签到${$.index}】`)
                if (token.indexOf("from") == -1) {
                    token += "from=10B2193010&"
                }
                await getsign();
                await doCard();
                await paysign();
                await showmsg()
            }
        }
    })()
    .catch((e) => $.logErr(e))
        .finally(() => $.done())
}

function GetCookie() {
        if ($request && $request.method != 'OPTIONS' && $request.url.indexOf("gsid=") > -1) {
            const signurlVal = $request.url;
            let token = signurlVal.replace(/(.+)(from=\w+)(.+)(&uid=\d+)(.+)(&gsid=[_a-zA-Z0-9-]+)(&.+)(&s=\w+)(.+)/, '$2$4$6$8'),
                uid = token.match(/uid=\d+/)[0];
            if (wbtoken) {
                if (wbtoken.indexOf(uid) > -1) {
                    $.log("此账号Cookie已存在，本次跳过")
                } else if (wbtoken.indexOf(uid) == -1) {
                    tokens = wbtoken + "#" + token;
                    $.setdata(tokens, 'sy_token_wb');
                    $.log(`tokens: ${tokens}`)
                    $.msg($.name, `获取微博签到Cookie: 成功`, ``)
                }
            } else {
                $.setdata(token, 'sy_token_wb');
                $.log(`tokens: ${token}`)
                $.msg($.name, `获取微博签到Cookie: 成功`, ``)
            }
        } else if ($request && $request.method != 'OPTIONS' && $request.headers.Cookie.indexOf("SUB=") > -1) {
            const cookieval = $request.headers.Cookie.match(/SUB=[\w\-]+/)[0];
            if (cookies) {
                if (cookies.indexOf(cookieval) > -1) {
                    $.log("此账号Cookie已存在，本次跳过")
                } else if (cookies.indexOf(cookieval) == -1) {
                    cookie = cookies + "#" + cookieval;
                    $.setdata(cookie, 'wb_cookie');
                    Cookies = cookie.split('#');
                    $.log(`cookie: ${cookie}`);
                    $.msg($.name, '获取微博用户' + Cookies.length + 'Cookie: 成功', ``)
                }
            } else {
                $.setdata(cookieval, 'wb_cookie');
                $.log(`cookies: ${cookieval}`);
                $.msg($.name, `获取微博用户Cookie: 成功`, ``)
            }
        }
    }
    //微博签到

function getsign() {
    return new Promise((resolve, reject) => {
        let signurl = {
            url: `https://api.weibo.cn/2/checkin/add?c=iphone&${token}`,
            headers: {
                "User-Agent": `Weibo/52021 (iPhone; iOS 14.5; Scale/3.00)`
            }
        }
        $.get(signurl, async(error, resp, data) => {
            let result = JSON.parse(data)
            if (result.status == 10000) {
                wbsign = `【微博签到】 连续签到${result.data.continuous}天`
            } else if (result.errno == 30000) {
                wbsign = `【每日签到】 已签到`
                if (cookie) {
                    await getcash()
                }
            } else if (result.status == 90005) {
                wbsign = `【每日签到】‼️` + result.msg
            } else {
                wbsign = `【每日签到】 签到失败` + result.errmsg;
                $.msg($.name, wbsign, `请检查微博Token`)
                if ($.isNode()) {
                    await notify.sendNotify($.name, wbsign)
                }
            }
            resolve()
        })
    })
}

function getcash() {
    return new Promise((resolve, reject) => {
        let url = {
            url: `https://m.weibo.cn/c/checkin/getcashdetail`,
            headers: {
                "User-Agent": `Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Weibo (iPhone10,2__weibo__11.2.1__iphone__os14.5)`,
                Cookie: cookie
            }
        }
        $.get(url, async(error, resp, data) => {
            let cashres = JSON.parse(data)
            if (cashres.apiCode == 10000) {
                signcash = " " + cashres.data.header[0].title + cashres.data.header[0].value + "元"
            }
            resolve()
        })
    })
}


function doCard() {
    return new Promise((resolve, reject) => {
        let doCardurl = {
            url: `https://api.weibo.cn/2/!/ug/king_act_home?c=iphone&${token}`,
            headers: {
                "User-Agent": `Weibo/52021 (iPhone; iOS 14.5; Scale/3.00)`
            }
        }
        $.get(doCardurl, (error, resp, data) => {
            //$.log(data)
            let result = JSON.parse(data)
            if (result.status == 10000) {
                nickname = "昵称:sooyaaabo" + result.data.user.nickname
                if (tokenArr.length == 1) {
                    $.setdata(nickname, 'wb_nick')
                } else {
                    $.setdata(tokenArr.length + "合一(多账号)", 'wb_nick')
                }
                signday = result.data.signin.title.split('<')[0]
                docard = `【每日打卡】 ` + signday + '天 积分总计: ' + result.data.user.energy
            } else {
                docard = `【每日打卡】 活动过期或失效`
            }
            resolve()
        })
    })
}

// 钱包签到
function paysign() {
    return new Promise((resolve, reject) => {
        $.post(payApi('aj/mobile/home/welfare/signin/do?_=' + $.startTime + 10), async(error, resp, data) => {
            let result = JSON.parse(data)
            if (result.status == 1) {
                paybag = `【微博钱包】 +` + result.score + ' 分\n'
            } else if (result.status == '2') {
                paybag = `【微博钱包】 `
                await payinfo()
            } else {
                paybag = `【钱包签到】 Cookie失效` + '\n'
            }
            resolve()

        })
    })
}

function payApi(api) {
    return {
        url: 'https://pay.sc.weibo.com/' + api,
        headers: {
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': 'pay.sc.weibo.com',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Weibo (iPhone10,1__weibo__11.2.1__iphone__os14.5)'
        },
        body: token + '&lang=zh_CN&wm=3333_2001'
    }
}

function payinfo() {
    return new Promise((resolve, reject) => {
        $.post(payApi('api/client/sdk/app/balance'), (error, resp, data) => {
            let paynum = JSON.parse(data)
            if (paynum.code == 100000) {
                paybag += '现金:' + paynum.data.balance + ' 元\n'
            }
            resolve()
        })
    })
}

async function showmsg() {
    if (paybag) {
        $.msg($.name, nickname + (signcash ? signcash : ""), wbsign );
        if ($.isNode()) {
            await notify.sendNotify($.name, nickname + (signcash ? signcash : "") + '\n' + wbsign )
        }
    }
}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
