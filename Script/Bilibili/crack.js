/*
脚本功能：哔哩哔哩解锁大会员
使用声明：⚠️此脚本仅供学习与交流，
				请勿转载与贩卖！⚠️⚠️⚠️
*******************************
[rewrite_local]
# > 哔哩哔哩大会员
^https?:\/\/ap(i|p)\.bilibili\.com\/bilibili\.\w{3,9}\..+\/(View|Play(URL|View(Unite)?|Conf|erOnline)|MainList|ViewProgress)$ url script-request-header biliCrack.js

[mitm] 
hostname = *.bilibili.com, 124.239.240.*, 101.89.57.66, 218.94.210.66, 240e:b1:9801:206:11:0:0:*
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

var headers = $request['headers'];
var vipHeaders = {"Cookie":"DedeUserID=****; DedeUserID__ckMd5=****; SESSDATA=****; bili_jct=****; sid=****;","Authorization":"****;","User-Agent":"****","x-bili-locale-bin":"****","x-bili-device-bin":"****","x-bili-metadata-bin":"****","x-bili-fawkes-req-bin":"****"};//此处填写共享者headers
var uid = Number(cookie2object(headers.Cookie).DedeUserID);
let uids = [];//此处填写被共享者账号uid，以英文逗号隔开
let result = uids.includes(uid);
if (result) {
	headers['Cookie'] = vipHeaders.Cookie;
	headers['Authorization'] =  vipHeaders.Authorization;
	headers['User-Agent'] = vipHeaders['User-Agent'];
	headers['x-bili-locale-bin'] = vipHeaders['x-bili-locale-bin'];
	headers['x-bili-device-bin'] = vipHeaders['x-bili-device-bin'];
	headers['x-bili-metadata-bin'] = vipHeaders['x-bili-metadata-bin'];
	headers['x-bili-fawkes-req-bin'] = vipHeaders['x-bili-fawkes-req-bin'];
}
$done({ 'headers': headers });