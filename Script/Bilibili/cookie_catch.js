/*
脚本名称：获取B站共享Cookie
脚本作者：MartinsKing
使用方法：打开B站客户端自动弹出
更新时间：2022-10-31
使用声明：⚠️此脚本仅供学习与交流，
        请勿转载与贩卖！⚠️⚠️⚠️
*******************************
[rewrite_local]

^https:\/\/app\.bilibili\.com\/bilibili\.app\.wall\.v1\.Wall\/RuleInfo url script-request-header https://raw.githubusercontent.com/ClydeTime/Quantumult/main/Script/Tips/bili_cookie_catch.js

[mitm]

hostname= app.bilibili.com
*/

const cookie2object = (cookie) => {
  var obj = {};
  var arr = cookie.split("; ");
  arr.forEach(function (val) {
    var brr = val.split("=");
    obj[brr[0]] = brr[1];
  });
  return obj;
};
const config = {
  cookie: {},
  headers: {}
};

config.headers = $request.headers;
config.cookie = cookie2object(config.headers.Cookie);
var nessary_headers = {};
nessary_headers.Cookie = `DedeUserID=${config.cookie.DedeUserID}; DedeUserID__ckMd5=${config.cookie.DedeUserID__ckMd5}; SESSDATA=${config.cookie.SESSDATA}; bili_jct=${config.cookie.bili_jct}; sid=${config.cookie.sid}`;
nessary_headers.Authorization = config.headers.Authorization;
nessary_headers['User-Agent'] = config['headers']['User-Agent'];
nessary_headers['x-bili-locale-bin'] = config['headers']['x-bili-locale-bin'];
nessary_headers['x-bili-device-bin'] = config['headers']['x-bili-device-bin'];
nessary_headers['x-bili-metadata-bin'] = config['headers']['x-bili-metadata-bin'];
nessary_headers['x-bili-fawkes-req-bin'] = config['headers']['x-bili-fawkes-req-bin'];
console.log(JSON.stringify(nessary_headers));
$notify("BiliBili-cookie获取", "获取成功", JSON.stringify(nessary_headers));
$done({});
