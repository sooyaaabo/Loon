

哔哩哔哩每日任务(V1.2)

更新时间 2025-01-31
脚本兼容 QuantumultX, Surge, Loon
脚本作者 MartinsKing（@ClydeTime）
软件功能 登录观看分享投币直播签到银瓜子转硬币大会员积分签到年度大会员每月B币券+等任务
注意事项
	抓取cookie时注意保证账号登录状态;
	账号内须有一定数量的关注数，否则无法完成投币;
	当硬币不足5枚，提示硬币不足，停止投币;
	为保证投币任务成功, 脚本有重试机制(最多重试10次), 以确保任务完成, 前提需要您尽可能多的关注Up主;
	年度大会员每月B币券会在每月1号、15号尝试领取，确保应用正常运行, 以防漏领;
	年度大会员自动充电会在每次领劵之后进行, 默认为自己充电, B币多的用户可自行到boxjs设置，以防误充.
使用声明 ⚠️此脚本仅供学习与交流，请勿贩卖！⚠️
脚本参考 Nobyda、Wyatt1026、ABreadTree、chavyleung、SocialSisterYi

QX, Surge, Loon说明：

1.获取cookie
	①后台退出手机B站客户端的情况下, 重新打开APP进入主页
	②通过网址「httpswww.bilibili.com」登录（`暂不支持Loon`）
如通知成功获取cookie, 则可以使用此签到脚本.
脚本将在每天上午7点30执行.
2.投币设置
定时任务脚本投币规则为 随机获取关注列表Up主视频, 默认5视频5硬币, 不点赞.
用户如需要不投币的版本, 请使用boxjs订阅「httpsraw.githubusercontent.comClydeTimeBiliBilimainboxjsBiliBili.boxjs.json」
将投币次数置为0, 并保存即可.

Surge 脚本配置


# B站每日等级任务 「请在模块中添加」
httpsraw.githubusercontent.comClydeTimeBiliBilimainmodulesBiliBiliDailyBonus.sgmodule


QuantumultX 远程脚本配置


# B站每日等级任务 「请在重写中添加」
httpsraw.githubusercontent.comClydeTimeBiliBilimainmodulesBiliBiliDailyBonus.snippet


Loon 远程脚本配置


# B站每日等级任务 「请在插件中添加」
httpsraw.githubusercontent.comClydeTimeBiliBilimainmodulesBiliBiliDailyBonus.plugin


const format = (ts, fmt = 'yyyy-MM-dd HHmmss') = {
	return $.time(fmt, ts);
}

const check = key =
	!config.hasOwnProperty(key) 
	!config[key].hasOwnProperty(time) 
	!(config[key][num]  0) 
	format(new Date().toDateString())  config[key].time

const string2object = cookie = {
	let obj = {}
	let arr = cookie.split(; )
	arr.forEach(function (val) {
		let array = val.split(=)
		obj[array[0]] = array[1]
	})
	return obj
}

const isFlag = exec_times = 
	config.user.num === 0 
	config.watch.num === 0 
	config.share.num === 0 
	(config.coins.num  exec_times  10 && Math.floor(config.user.money)  5)

const persistentStore = async config = {
	if (config.cookie.DedeUserID) {
		const url = $request.url
		config.key = url.match(.access_key=(.)&).[1]
		config.cookieStr = `DedeUserID=${config.cookie.DedeUserID}; DedeUserID__ckMd5=${config.cookie.DedeUserID__ckMd5}; SESSDATA=${config.cookie.SESSDATA}; bili_jct=${config.cookie.bili_jct}; sid=${config.cookie.sid}`
		if (!config.key) { 网页方式登录
			let auth_code = 0, access_key = 0, login_confirm = false
			auth_code = await getAuthCode()
			if (auth_code !== 0) login_confirm = await loginConfirm(auth_code)
			if (login_confirm) access_key = await getAccessKey(auth_code)
			if (access_key !== 0) {
				config.key = access_key
			} else {
				$.log(- 获取用户access_key失败!)
				$.msg($.name, 🤒获取用户access_key失败!)
			}
		}
		const isFirstInsert = config.FirstInsert
		delete config.FirstInsert
		$.log($.toStr(config))
		const successMessage = $.setItem($.name + _daily_bonus, $.toStr(config))
			 🎉cookie存储成功
			 🤒cookie存储失败
		$.msg($.name, isFirstInsert  首次获取cookie  检测到cookie已更新, successMessage)
	} else {
		$.msg($.name, - 尚未登录, 请登录后重新获取cookie)
	}
}

const $ = new Env(bilibili)
const startTime = format()
let cards = []
let config = {
	cookie {},
	cookieStr ,
	key ,
	user {},
	watch {},
	share {},
	coins {},
	score {}
}
let real_times 实际需要投币次数

!(async () = {
	if (typeof $request != undefined) {
		$.log(- 正在获取cookie, 请稍后)
		await getCookie()
	} else {
		await signBiliBili()
	}
})()
	.catch((e) = $.logErr(e))
	.finally(() = $.done())

async function getCookie() {
	if (object === typeof $request) {
		let Cookie = $request.headers.cookie  $request.headers.Cookie
		if (Cookie) {
			config.cookie = string2object(Cookie)
			const PStoreConfig = $.getItem($.name + _daily_bonus, {})
			if (PStoreConfig.cookie && PStoreConfig.cookie.bili_jct !== config.cookie.bili_jct) {
				if (PStoreConfig.Settings) config.Settings = PStoreConfig.Settings  同步boxjs数据
				config.FirstInsert = false
				$.log($.toStr(config))
				await persistentStore(config)
			} else if (PStoreConfig.cookie) {
				$.log(- cookie未失效,无需更新)
			} else {
				config.FirstInsert = true
				await persistentStore(config)
			}
		} else {
			$.msg($.name, - 尚未登录, 请登录后重新获取cookie)
		}
	}
}

async function signBiliBili() {
	config = $.getItem($.name + _daily_bonus, {})
	if (config.cookie && await me()) {
		await queryStatus()
		let exec_times = config.Settings.exec	用户设置投币次数
		if (!Boolean(exec_times)) {
			exec_times = 5
			real_times = 5 - (Number(config.coins.num)  10)
		} else {
			exec_times = Number(exec_times)
			real_times = Math.max(0, exec_times - (Number(config.coins.num)  10))
		}
		let flag = isFlag(exec_times)
		if (flag){
			await dynamic()
			if (cards.length) {
				let item = cards[Math.floor(Math.random()  cards.length)]
				let card = $.toObj(item.card)
				short_link = encodeURIComponent(card.short_link_v2.replace(g, ''))
				await watch(item.desc.rid, item.desc.bvid, card.cid)
				await share(item.desc.rid, card.cid, short_link)
			} else {
				$.log(- 获取视频失败，请重试或寻求帮助)
			}

			$.log(3️⃣ 投币任务)
			if (typeof config.coins.failures !== 'undefined' && config.coins.failures  0){
				config.coins.failures = 0    重置投币失败次数
			}
			if (real_times === 0){
				$.log(`- 今日已完成 ${config.coins.time}`)
			} else {
				for (let i = 0; i  real_times; i ++) {
					if (Math.floor(config.user.money) = 5) {
						$.log(- 硬币不足,投币失败)
						break
					} else {
						await coin()
						$.wait(300) 减少频繁请求概率
					}
				}
			}
			$.log(---- 将尝试额外任务)
		} else {
			$.log(---- 经验值任务均已完成,将尝试额外任务)
		}
		
		await liveSign() 已下线
		await silver2coin()
		await vipScoreSign()
		if (config.user.vipStatus === 1) {
			await vipExtraEx()
			await vipScoreGo()
			await vipScoreFan()
			await vipScoreMovie()
			await vipScoreDress()
			await vipWatchAccept()
			B币券每月尝试两次领取
			let day = $.time('dd')
			if (day === '1'  day === '15') {
				if (config.user.vipType === 2) {
					await vipPrivilege(1)
					$.wait(800) 延迟执行，防止领劵延迟
					let charge_mid = config.Settings.charge_mid  config.user.mid  用户设置充电id
					let bp_num = config.Settings.bp_num  5  用户设置充电数量
					await Charge(charge_mid, bp_num)充电
					for (let i = 2; i = 7; i++) await vipPrivilege(i)
				} else if (config.user.vipType === 1) {
					await vipPrivilege(6)
					await vipPrivilege(7)
				}
			} 
		}
		flag = !isFlag(exec_times)
		let title = `${$.name} 登录${config.user.num}观看${config.watch.num}分享${config.share.num}投币${config.coins.num  10}${flag  已完成  未完成}`
		$.log(`#### ${title}`)
		$.log(`- 登录时间 ${config.user.time  暂无}`)
		$.log(`- 观看时间 ${config.watch.time  暂无}`)
		$.log(`- 分享时间 ${config.share.time  暂无}`)
		$.log(`- 投币时间 ${config.coins.time  暂无}`)

		notice = {
			title `${$.name} [${config.user.uname}]`,
			subTitle `${flag  ✅任务完成  ❗️有未完成的任务}`,
			content
				`任务登录(观看)${check(watch)    +10exp} 分享${check(share)    +5exp} 投币${check(coins)    +50exp}n` +
				`经验当前${config.user.level_info.current_exp}下级${config.user.level_info.next_exp}满级28800n` +
				`等级当前${config.user.level_info.current_level}级 升满级最快需${Math.ceil((config.user.v6_exp)65)}天`,
		}
		$.msg(notice.title, notice.subTitle, notice.content)
	} else {
		$.msg(`${$.name} 任务失败`,`📅 ${startTime}`, 🤒请更新cookie)
	}
}

async function getAuthCode() {
	const body = {
		appkey 27eb53fc9058f8c3,
		local_id 0,
		ts $.getTimestamp()
	}
	const sortedBody = $.queryStr(Object.fromEntries(new Map(Array.from(Object.entries(body)).sort())))
	const sign = md5(sortedBody + 'c2ed53a74eeefe3cf99fbd01d8c9c375')
	body['sign'] = sign
	const myRequest = {
		url httpspassport.bilibili.comxpassport-tv-loginqrcodeauth_code,
		headers {
			Content-Type applicationx-www-form-urlencoded;charset=UTF-8
		},
		body $.queryStr(body)
	}
	return await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0 && body.message === 0) {
				$.log(- 获取auth_code成功)
				return body.data.auth_code
			} else {
				$.log(- 获取auth_code失败)
				return 0
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function loginConfirm(auth_code) {
	const body = {
		auth_code,
		build 7082000,
		csrf config.cookie.bili_jct
	}
	const myRequest = {
		url httpspassport.bilibili.comxpassport-tv-loginh5qrcodeconfirm,
		headers {
			Content-Type applicationx-www-form-urlencoded;charset=UTF-8,
			'cookie' `DedeUserID=${config.cookie.DedeUserID}; SESSDATA=${config.cookie.SESSDATA}`
		},
		body $.queryStr(body)
	}
	return await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0 && body.message === 0) {
				$.log(- 确认登录成功)
				return true
			} else {
				$.log(- 确认登录失败)
				return false
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function getAccessKey(auth_code) {
	const body = {
		appkey 27eb53fc9058f8c3,
		auth_code,
		local_id 0,
		ts $.getTimestamp()
	}
	const sortedBody = $.queryStr(Object.fromEntries(new Map(Array.from(Object.entries(body)).sort())))
	const sign = md5(sortedBody + 'c2ed53a74eeefe3cf99fbd01d8c9c375')
	body['sign'] = sign
	const myRequest = {
		url httpspassport.bilibili.comxpassport-tv-loginqrcodepoll,
		headers {
			Content-Type applicationx-www-form-urlencoded;charset=UTF-8
		},
		body $.queryStr(body)
	}
	return await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0 && body.message === 0) {
				$.log(- 获取access_key成功)
				return body.data.access_token
			} else {
				$.log(- 获取access_key失败)
				return 0
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function watch(aid, bvid, cid) {
	$.log(1️⃣ 观看(登录)任务)
	if (check(watch)) {
		$.log(`- 正在观看(登录)(${bvid})`)
		const body = {
			aid,
			cid,
			bvid,
			mid config.user.mid,
			csrf config.cookie.bili_jct,
			played_time  1,
			real_played_time 1,
			realtime 1,
			start_ts $.getTimestamp(),
			type 3,
			dt 2,
			play_type 0,
			from_spmid 0,
			spmid 0,
			auto_continued_play 0,
			refer_url https%3A%2F%2Ft.bilibili.com%2F,
			bsource 
		}
		const myRequest = {
			url 'httpsapi.bilibili.comxclick-interfacewebheartbeat',
			headers {
				cookie config.cookieStr,
				referrer `httpswww.bilibili.comvideo${bvid}`
			},
			body $.queryStr(body)
		}
		await $.fetch(myRequest).then(response = {
			const body = $.toObj(response.body)
			if (body.code === 0) {
				$.log(`- 累计观看(登录)次数 ${(config.watch.num  0) + 1}`)
				config.user.num = (config.user.num  0) + 1
				config.watch.num = (config.watch.num  0) + 1
				$.setItem($.name + _daily_bonus, $.toStr(config))
			} else {
				$.log(- 观看失败, 失败原因  + body.message)
			}
		})
	} else {
		$.log(`- 今日已经观看 ${config.watch.time}`)
	}
}

async function share(aid, cid, short_link) {
	$.log(2️⃣ 分享任务)
	if (check(share)) {
		$.log(- 正在分享, aid= + aid)
		const body = {
			access_key config.key.replace(&actionKey=.&appkey=.$, ''),
			actionKey 'appkey',
			appkey '27eb53fc9058f8c3',
			build '72700100',
			c_locale 'zh-Hans_CN',
			device 'phone',
			disable_rcmd 0,
			link short_link,
			mobi_app 'iphone',
			object_extra_fields '%7B%7D',
			oid aid,
			panel_type 1,
			platform 'ios',
			s_locale'zh-Hans_CN',
			share_channel 'WEIXIN',
			share_id 'main.ugc-video-detail.0.0.pv',
			share_origin 'vinfo_share',
			sid cid,
			spm_id 'main.ugc-video-detail.0.0',
			statistics '%7B%22appId%22%3A1%2C%22version%22%3A%227.27.0%22%2C%22abtest%22%3A%22%22%2C%22platform%22%3A1%7D',
			success 1,
			ts $.getTimestamp()
		}
		const sign = md5($.queryStr(body) + 'c2ed53a74eeefe3cf99fbd01d8c9c375')
		body['sign'] = sign
		const myRequest = {
			url 'httpsapi.bilibili.comxsharefinish',
			headers {},
			body $.queryStr(Object.fromEntries(new Map(Array.from(Object.entries(body)).sort())))
		}
		await $.fetch(myRequest).then(response = {
			const body = $.toObj(response.body)
			if (body.code === 0) {
				config.share.num = (config.share.num  0) + 1
				$.log(- 分享成功)
				$.setItem($.name + _daily_bonus, $.toStr(config))
			} else {
				$.log(- 分享失败, 失败原因  + body.message)
			}
		})
	} else {
		$.log(`- 今日已经分享 ${config.share.time}`)
	}
}

async function coin() {
	if (config.coins.num = 50) {
		$.log(`- 今日已完成 ${config.coins.time}`)
		return
	}
	let like_uid_list = await getFavUid()
	if (like_uid_list && like_uid_list.length  0) {
		let aid = await getFavAid(like_uid_list)
		$.log(即将投币的视频aid  + aid)
		if (aid !== 0) {
			const body = {
				access_key config.key,
				aid,
				multiply 1,
				select_like 0,
			}
			const myRequest = {
				url httpsapp.bilibili.comxv2viewcoinadd,
				headers {
					'user-agent' 'bili-universal83100100 CFNetwork1.0 Darwin24.3.0 osios modeliPhone 16 Pro Max mobi_appiphone build83100100 osVer18.3 network2 channelAppStore',
					'accept-encoding' 'gzip, deflate, br',
					'content-type' 'applicationx-www-form-urlencoded',
					'app-key' 'iphone',
					'cookie' config.cookieStr
				},
				body $.queryStr(body)
			}
			await $.fetch(myRequest).then(async response = {
				try {
					const body = $.toObj(response.body)
					if (body.code === 0 && body.message === 0) {
						$.log(- 投币成功)
						config.user.money -= 1
						config.coins.num += 10
						$.setItem($.name + _daily_bonus, $.toStr(config))
					} else {
						$.log(- 投币失败,失败原因  + body.message)
						config.coins.failures = (config.coins.failures === 0  typeof config.coins.failures === 'undefined'  1  config.coins.failures + 1)
						$.setItem($.name + _daily_bonus, $.toStr(config))
						if (config.coins.failures  11) {
							$.log(- 正在重试...重试次数  + (config.coins.failures - 1) + (超过十次不再重试))
							await coin()
						}
					}
				} catch (e) {
					$.logErr(e, response)
				}
			})
		} else {
			$.log(- 获取随机投币视频失败)
		}
	} else {
		$.log(- 获取随机关注用户列表失败)
	}
}

async function getFavUid() {
	const myRequest = {
		url `httpsapi.bilibili.comxrelationfollowingsvmid=${config.cookie.DedeUserID}&ps=10&order_type=attention`,
		headers {
			'cookie' config.cookieStr
		}
	}
	return await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			let like_uid_list = new Array()
			if (body.code === 0) {
				$.log(- 获取关注列表成功)
				let like_list = body.data.list
				let $.name_list = new Array()
				for (let i = 0; i  like_list.length; i ++) {
					$.name_list[i] = like_list[i].u$.name
					like_uid_list[i] = like_list[i].mid
				}
				return like_uid_list
				$.log($.toStr($.name_list))
			} else {
				$.log(- 获取关注列表成失败)
				$.log(- 失败原因  + body.message)
				return like_uid_list
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function getFavAid(arr) {
	$.log(- 获取关注列表中的随机视频)
	let random_int = Math.floor((Math.random()arr.length))
	let random_mid = arr[random_int]
	let wbiSigns = getWbiSigns({mid random_mid})
	const myRequest = {
		url `httpsapi.bilibili.comxspacewbiarcsearch${wbiSigns}`,
		headers {
			'User-Agent' 'Mozilla5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit615.2.9.10.4 (KHTML, like Gecko) Mobile22D63 BiliApp83100100 osios modeliPhone 16 Pro Max mobi_appiphone build8310000100 osVer18.3 network2 channelAppStore c_localezh-Hans_CN s_localezh-Hans_CN disable_rcmd0',
			'cookie' config.cookieStr,
			'referer' 'httpsspace.bilibili.com'
		}
	}
	return await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0 && body.data.list.vlist.some(Boolean)) {
				$.log(- 获取投币视频成功)
				let vlist = body.data.list.vlist
				let random_v_int = Math.floor((Math.random()  vlist.length))
				let aid = vlist[random_v_int].aid
				$.log(- 作者  + vlist[random_v_int]['author'] + ; 视频标题  + vlist[random_v_int]['title'])
				return aid
			} else {
				$.log(- 获取投币视频失败)
				$.log(- 失败原因  + body.message)
				return 0
			}
		} catch (e) {
			$.logErr(e, response)
		}
	}, reason = {
		$.log(- 获取投币视频失败)
		$.log(- 失败原因  + $.toStr(reason))
		return 0
	})
}

async function silver2coin() {
	$.log(#### 银瓜子兑换硬币任务)
	const body = {
		csrf config.cookie.bili_jct,
		csrf_token config.cookie.bili_jct
	}
	const myRequest = {
		url httpsapi.live.bilibili.comxliverevenuev1walletsilver2coin,
		headers {
			'cookie' config.cookieStr
		},
		body $.queryStr(body)
	}
	await $.fetch(myRequest).then(response = {
		try {
			let result = $.toObj(response.body)
			let title = `${$.name} 银瓜子转硬币`
			 兑换成功
			if (result && result.code === 0) {
				let subTitle = `- ${result.message}`
				let detail = `- 成功兑换 ${result.data.coin} 个硬币n当前银瓜子 ${result.data.silver} , 当前金瓜子 ${result.data.gold}`
				$.log(subTitle)
				$.log(detail)
				$.msg(title, subTitle, detail)
			}
			 兑换中止（重复兑换&银瓜子不足）
			else if (result && result.code === 403) {
				let subTitle = - 未成功兑换
				let detail = `- 原因 ${result.message}`
				$.log(subTitle)
				$.log(detail)
				$.msg(title, subTitle, detail)
			}
			 兑换失败
			else {
				let subTitle = - 兑换失败
				let detail = `- 原因 ${result.message}`
				$.log(subTitle)
				$.log(detail)
				$.msg(title, subTitle, detail)
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function liveSign() {
	$.log(#### 直播签到任务)
	const myRequest = {
		url httpsapi.live.bilibili.comxliveweb-ucenterv1signDoSign,
		headers {
			'cookie' config.cookieStr
		}
	}
	await $.fetch(myRequest).then(response = {
		try {
			let body = $.toObj(response.body)
			if (body.code === 0) {
				$.log(- 签到成功)
				$.log(`签到奖励${body.data.text},连续签到${body.data.hadSignDays}天`)
			} else if (body && body.code === 1011040){
				$.log(- 今日已完成)
			} else {
				$.log(- 签到失败)
				$.log(- 失败原因  + body.message)
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function vipScoreSign() {
	$.log(#### 大会员大积分签到任务)
	if (config.user.vipStatus === 0) {
		$.log(- 当前用户非大会员, 无法完成任务)
	} else {
		if (check(score)) {
			const myRequest = {
				url httpsapi.bilibili.compgcactivityscoretasksign,
				method POST,
				headers {
					'Referer' 'httpsbig.bilibili.commobilebigPointtask',
					'cookie' config.cookieStr
				}
			}
			await $.fetch(myRequest).then(response = {
				try {
					const body = $.toObj(response.body)
					if (body.code === 0 && body.message === success) {
						$.log(- 签到成功)
						config.score.time = startTime
						config.score.num = 1
						$.setItem($.name + _daily_bonus, $.toStr(config))
					} else {
						$.log(- 签到失败)
						$.log(- 失败原因  + body.message)
					}
				} catch (e) {
					$.logErr(e, response)
				}
			})
		} else {
			$.log(- 今日已完成)
		}
	}
}

async function vipExtraEx() {
	$.log(#### 大会员每日额外经验值)
	const body = {
		csrf config.cookie.bili_jct,
		ts $.getTimestamp(),
		buvid config.cookie.Buvid,
		mobi_app 'iphone',
		platform 'ios',
		appkey '27eb53fc9058f8c3',
		access_key config.key
	}
	const sortedBody = $.queryStr(Object.fromEntries(new Map(Array.from(Object.entries(body)).sort())))
	const sign = md5(sortedBody + 'c2ed53a74eeefe3cf99fbd01d8c9c375')
	body['sign'] = sign
	const myRequest = {
		url httpsapi.bilibili.comxvipexperienceadd,
		headers {
			'accept' 'applicationjson, textplain, ',
			'app-key' 'iphone'
		},
		body $.queryStr(body)
	}
	await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0 && body.message === 0) {
				$.log(- 成功获得10经验值)
			} else {
				$.log(- 每日额外经验任务失败)
				$.log(- 失败原因  + body.message)
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function vipScoreGo() {
	$.log(#### 大会员浏览会员购10s任务)
	const myRequest = {
		url httpsshow.bilibili.comapiactivityfirecommoneventdispatch,
		headers {
			'Content-Type'  'applicationjson',
			'Cookie' config.cookieStr
		},
		body `{eventIdhevent_oy4b7h3epeb}`
	}
	await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0 && body.message === SUCCESS) {
				$.log(- 成功获得10点大积分)
			} else {
				$.log(- 浏览会员购任务失败)
				$.log(- 失败原因  + body.message)
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function vipScoreFan() {
	$.log(#### 大会员浏览追番频道10s任务)
	const myRequest = {
		url `httpsapi.bilibili.compgcactivitydelivertaskcompleteaccess_key=${config.key}&appkey=27eb53fc9058f8c3&position=jp_channel&statistics=%7B%22appId%22%3A1%2C%22version%22%3A%228.31.0%22%2C%22abtest%22%3A%22%22%2C%22platform%22%3A1%7D`,
		method POST,
		headers {}
	}
	await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0 && body.message === success) {
				$.log(- 成功获得10点大积分)
			} else {
				$.log(- 浏览追番频道任务失败)
				$.log(- 失败原因  + body.message)
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function vipScoreMovie() {
	$.log(#### 大会员浏览影视频道10s任务)
	const myRequest = {
		url `httpsapi.bilibili.compgcactivitydelivertaskcompleteaccess_key=${config.key}&appkey=27eb53fc9058f8c3&position=tv_channel&statistics=%7B%22appId%22%3A1%2C%22version%22%3A%228.31.0%22%2C%22abtest%22%3A%22%22%2C%22platform%22%3A1%7D`,
		method POST,
		headers {}
	}
	await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0 && body.message === success) {
				$.log(- 成功获得10点大积分)
			} else {
				$.log(- 浏览影视频道任务失败)
				$.log(- 失败原因  + body.message)
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function vipScoreDress() {
	$.log(#### 大会员浏览装扮商城主页任务)
	const body = {
		csrf config.cookie.bili_jct,
		ts $.getTimestamp(),
		taskCode 'dress-view',
		statistics '%7B%22appId%22%3A1%2C%22version%22%3A%228.31.0%22%2C%22abtest%22%3A%22%22%2C%22platform%22%3A1%7D',
		appkey '27eb53fc9058f8c3',
		access_key config.key
	}
	const myRequest = {
		url 'httpsapi.bilibili.compgcactivityscoretaskcompletev2',
		headers {},
		body $.queryStr(body)
	}
	await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0 && body.message === success) {
				$.log(- 成功获得10点大积分)
			} else {
				$.log(- 浏览装扮商城主页任务失败)
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function vipWatchAccept() {
	$.log(#### 接取大会员观看剧集10min任务)
	const body = {
		csrf config.cookie.bili_jct,
		ts $.getTimestamp(),
		taskCode 'ogvwatchnew',
		mobi_app 'iphone',
		platform 'ios',
		appkey '27eb53fc9058f8c3',
		access_key config.key
	}
	const sortedBody = $.queryStr(Object.fromEntries(new Map(Array.from(Object.entries(body)).sort())))
	const sign = md5(sortedBody + 'c2ed53a74eeefe3cf99fbd01d8c9c375')
	body['sign'] = sign
	const myRequest = {
		url 'httpsapi.bilibili.compgcactivityscoretaskreceivev2',
		headers {
			'Content-Type' 'applicationx-www-form-urlencoded',
			'User-Agent' 'Mozilla5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit615.2.9.10.4 (KHTML, like Gecko) Mobile22D63 BiliApp83100100 osios modeliPhone 16 Pro Max mobi_appiphone build83100100 osVer18.3 network2 channelAppStore c_localezh-Hans_CN s_localezh-Hans_CN disable_rcmd0',
			'Cookie' `SESSDATA=${config.cookie.SESSDATA}`,
			'Referer' `httpsbig.bilibili.commobilebigPointtask`
		},
		body $.queryStr(body)
	}
	await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0 && body.message === success) {
				$.log(- 大会员观看剧集任务接取成功, 需自行观看)
			} else {
				$.log(- 大会员观看剧集任务接取失败)
				$.log(- 失败原因  + body.message)
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function vipPrivilege(type) {
	$.log(#### 领取大会员月度福利)
	const body = {
		csrf config.cookie.bili_jct,
		type
	}
	const myRequest = {
		url 'httpsapi.bilibili.comxvipprivilegereceive',
		headers {
			'Cookie' config.cookieStr
		},
		body $.queryStr(body)
	}
	await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0) {
				switch (type) {
					case 1
						$.log(- 领取年度大会员每月B币券成功)
						$.msg(年度大会员月度福利, B币券, 🎉🎉🎉领取成功)
						break
					case 2
						$.log(- 领取年度大会员每月会员购优惠券成功)
						break
					case 3
						$.log(- 领取年度大会员每月漫画福利券成功)
						break
					case 4
						$.log(- 领取年度大会员每月会员购包邮券成功)
						break
					case 5
						$.log(- 领取年度大会员每月漫画商城优惠券成功)
						break
					case 6
						$.log(- 领取大会员每月装扮体验卡成功)
						break
					case 7
						$.log(- 领取大会员每月课堂优惠券成功)
						break
					default
						break
				}
			} else {
				$.log(- 领取大会员每月福利失败, 福利编码为 + type)
				$.log(- 失败原因  + body.message)
				if (type === 1) {
					$.msg(年度大会员月度福利, B币券领取失败, 失败原因为  + body.message)
				}
				其他福利没什么用,失败也无需单独通知
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function Charge(mid, bp_num) {
	$.log(#### B币券自动充电)
	const body = {
		bp_num,
		is_bp_remains_prior true,
		up_mid mid,
		otype 'up',
		oid mid,
		csrf config.cookie.bili_jct
	}
	const myRequest = {
		url 'httpsapi.bilibili.comxugcpaywebv2tradeelecpayquick',
		headers {
			'Cookie' config.cookieStr
		},
		body $.queryStr(body)
	}
	await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0) {
				if (body.data.status === 4) {
					if (mid === config.user.mid) {
						$.log(- 为自己充电成功)
					} else {
						$.log(`- 为用户id为${mid}的用户充电成功`)
					}
				} else if (body.data.status === -4) {
					$.log(- 充电失败, B币不足)
				} else {
					$.log(- 充电失败)
					$.log(- 失败原因  + body.message)
				}
			} else {
				$.log(- 充电失败)
				$.log(- 失败原因  + body.message)
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function me() {
	$.log(#### 用户信息)
	const myRequest = {
		url 'httpsapi.bilibili.comxweb-interfacenav',
		headers {
			cookie config.cookieStr
		}
	}
	return await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code) {
				$.log(- ❌❌获得用户信息失败(请更新cookie))
				$.setItem($.name + _daily_bonus, null)
				return false
			} else {
				$.log(- 🎉cookie有效任务即将开始🎉)
				config.user = body.data
				config.user.num = check(user)  1  (config.user.num  0) + 1
				$.setItem($.name + _daily_bonus, $.toStr(config))

				config.user.mext_exp = config.user.level_info.next_exp - config.user.level_info.current_exp
				config.user.next_day = Math.ceil(config.user.mext_exp  15)
				config.user.v6_exp = 28800 - config.user.level_info.current_exp
				config.user.v6_day = Math.ceil(config.user.v6_exp  15)

				if (config.user.vipStatus === 1) {
					$.log(- 💖尊贵的大会员用户💖)
				}
				$.log(- 用户名称  + config.user.uname)
				$.log(- 用户ID  + config.user.mid)
				$.log(- 用户硬币  + Math.floor(config.user.money))
				$.log(- 用户B币  + config.user.wallet.bcoin_balance)
				$.log(- 用户等级  + config.user.level_info.current_level)
				$.log(
					`- 当前经验 ${config.user.level_info.current_exp}${config.user.level_info.next_exp}`
				)
				$.log(`- 升级还需经验 ${config.user.mext_exp}`)
				$.log(
					`- 距离下级还需 ${config.user.next_day}天(登录 观看 分享)`
				)
				$.log(
					`- 距离满级还需 ${Math.max(0, config.user.v6_day)}天(登录 观看 分享)`
				)
				$.log(`- 剩余硬币最多可投 ${Math.floor((config.user.money)5)}天`)
				$.log(
					- 距离满级最快还需  +
					Math.max(0, Math.ceil(config.user.v6_exp  65)) +
						天(日常 + 投币5)
				)
				return true
			}
		} catch (e) {
			$.logErr(e, response)
		}
	}, reason = {
		$.msg($.name, - 获取用户信息失败, $.toStr(reason))
		return false
})

}

async function queryStatus() {
	$.log(#### 检查任务进行状况)
	const myRequest = {
			url httpsapi.bilibili.comxmemberwebexpreward,
			headers {
				cookie config.cookieStr
			}
	}
	await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.code === 0) {
				if (body.data.login) {
					$.log(- 今日已登录)
					config.user.num = (config.user.num === 0  1  config.user.num)
					if (!config['user'].hasOwnProperty(time)) {
						config.user.time = startTime
					}
				} else {
					$.log(! 今日尚未登录)
					config.user.num = 0
				}
				if (body.data.watch){
					$.log(- 今日已观看)
					config.watch.num = (config.watch.num === 0  typeof config.watch.num === 'undefined'  1  config.watch.num)
					if (!config['watch'].hasOwnProperty(time)) {
						config.watch.time = startTime
					}
				} else {
					$.log(! 今日尚未观看)
					config.watch.num = 0
				}
				if (body.data.share){
					$.log(- 今日已分享)
					config.share.num = (config.share.num === 0  typeof config.share.num === 'undefined'  1  config.share.num)
					if (!config['share'].hasOwnProperty(time)) {
						config.share.time = startTime
					}
				} else {
					$.log(! 今日尚未分享)
					config.share.num = 0
				}
				if (body.data.coins === 50){
					$.log(- 今日已投币)
					if (!config['coins'].hasOwnProperty(time)) {
						config.coins.time = startTime
					} else {
						if (format(new Date().toDateString())  config.coins.time) {
							config.coins.time = startTime
						}
					}
				} else if ((body.data.coins  10) = real_times) {
					config.coins.time = startTime
					$.log(- 已完成用户设置的投币量)
				} else if (config.user.money = 5) {
					$.log(! 硬币数不足)
				} else {
					$.log(! 今日投币未完成)
				}
				config.coins.num = body.data.coins
				$.setItem($.name + _daily_bonus, $.toStr(config))
			} else {
				$.log(- 查询失败)
				$.log(- 失败原因  + body.message)
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

async function dynamic() {
	$.log(#### 获取首页视频)
	const myRequest = {
		url `httpsapi.vc.bilibili.comdynamic_svrv1dynamic_svrdynamic_newuid=${config.cookie.DedeUserID}&type_list=8&from=&platform=web`,
		headers {
			cookie config.cookieStr
		}
	}
	await $.fetch(myRequest).then(response = {
		try {
			const body = $.toObj(response.body)
			if (body.data.cards) {
				cards = body.data.cards
				const { user, watch, share } = config
				user.time = watch.time = share.time = startTime
				$.log(- 获取视频动态成功)
			} else {
				$.log(- 获取视频动态失败)
			}
		} catch (e) {
			$.logErr(e, response)
		}
	})
}

 Wbi签名获取
function getWbiSigns(r){function t(r){let t=;return e.forEach(s={t+=r[s]}),t.slice(0,32)}function s(r,s,u){const e=t(s+u),i=parseInt($.startTime1e3);let n=;r=Object.assign(r,{wtsi}),n=$.queryStr(Object.fromEntries(new Map(Array.from(Object.entries(r)).sort())));const l=md5(n+e);return n+&w_rid=+l}function u(){return img_url=config.user.wbi_img.img_url,sub_url=config.user.wbi_img.sub_url,{img_keyimg_url.substring(img_url.lastIndexOf()+1,img_url.length).split(.)[0],sub_keysub_url.substring(sub_url.lastIndexOf()+1,sub_url.length).split(.)[0]}}const e=[46,47,18,2,53,8,23,32,15,50,10,31,58,3,45,35,27,43,5,49,33,9,42,19,29,28,14,39,12,38,41,13,37,48,7,16,24,55,40,61,26,17,0,1,60,51,30,4,22,25,54,21,56,59,6,63,57,62,11,36,20,34,44,52],i=u();return s(r,i.img_key,i.sub_key)}

 md5(32位)
function md5(r){function n(r,n){return rnr32-n}function t(r,n){var t,o,e,u,f;return e=2147483648&r,u=2147483648&n,t=1073741824&r,o=1073741824&n,f=(1073741823&r)+(1073741823&n),t&o2147483648^f^e^uto1073741824&f3221225472^f^e^u1073741824^f^e^uf^e^u}function o(r,n,t){return r&n~r&t}function e(r,n,t){return r&tn&~t}function u(r,n,t){return r^n^t}function f(r,n,t){return n^(r~t)}function i(r,e,u,f,i,a,c){return r=t(r,t(t(o(e,u,f),i),c)),t(n(r,a),e)}function a(r,o,u,f,i,a,c){return r=t(r,t(t(e(o,u,f),i),c)),t(n(r,a),o)}function c(r,o,e,f,i,a,c){return r=t(r,t(t(u(o,e,f),i),c)),t(n(r,a),o)}function C(r,o,e,u,i,a,c){return r=t(r,t(t(f(o,e,u),i),c)),t(n(r,a),o)}function g(r){for(var n,t=r.length,o=t+8,e=(o-o%64)64,u=16(e+1),f=Array(u-1),i=0,a=0;at;)n=(a-a%4)4,i=a%48,f[n]=f[n]r.charCodeAt(a)i,a++;return n=(a-a%4)4,i=a%48,f[n]=f[n]128i,f[u-2]=t3,f[u-1]=t29,f}function h(r){var n,t,o=,e=;for(t=0;t=3;t++)n=r8t&255,e=0+n.toString(16),o+=e.slice(-2);return o}function d(r){r=r.replace(rng,n);for(var n=,t=0;tr.length;t++){var o=r.charCodeAt(t);o128n+=String.fromCharCode(o)o127&&o2048(n+=String.fromCharCode(o6192),n+=String.fromCharCode(63&o128))(n+=String.fromCharCode(o12224),n+=String.fromCharCode(o6&63128),n+=String.fromCharCode(63&o128))}return n}var m,S,v,l,A,s,y,p,w,L=Array(),b=7,j=12,k=17,q=22,x=5,z=9,B=14,D=20,E=4,F=11,G=16,H=23,I=6,J=10,K=15,M=21;for(r=d(r),L=g(r),s=1732584193,y=4023233417,p=2562383102,w=271733878,m=0;mL.length;m+=16)S=s,v=y,l=p,A=w,s=i(s,y,p,w,L[m+0],b,3614090360),w=i(w,s,y,p,L[m+1],j,3905402710),p=i(p,w,s,y,L[m+2],k,606105819),y=i(y,p,w,s,L[m+3],q,3250441966),s=i(s,y,p,w,L[m+4],b,4118548399),w=i(w,s,y,p,L[m+5],j,1200080426),p=i(p,w,s,y,L[m+6],k,2821735955),y=i(y,p,w,s,L[m+7],q,4249261313),s=i(s,y,p,w,L[m+8],b,1770035416),w=i(w,s,y,p,L[m+9],j,2336552879),p=i(p,w,s,y,L[m+10],k,4294925233),y=i(y,p,w,s,L[m+11],q,2304563134),s=i(s,y,p,w,L[m+12],b,1804603682),w=i(w,s,y,p,L[m+13],j,4254626195),p=i(p,w,s,y,L[m+14],k,2792965006),y=i(y,p,w,s,L[m+15],q,1236535329),s=a(s,y,p,w,L[m+1],x,4129170786),w=a(w,s,y,p,L[m+6],z,3225465664),p=a(p,w,s,y,L[m+11],B,643717713),y=a(y,p,w,s,L[m+0],D,3921069994),s=a(s,y,p,w,L[m+5],x,3593408605),w=a(w,s,y,p,L[m+10],z,38016083),p=a(p,w,s,y,L[m+15],B,3634488961),y=a(y,p,w,s,L[m+4],D,3889429448),s=a(s,y,p,w,L[m+9],x,568446438),w=a(w,s,y,p,L[m+14],z,3275163606),p=a(p,w,s,y,L[m+3],B,4107603335),y=a(y,p,w,s,L[m+8],D,1163531501),s=a(s,y,p,w,L[m+13],x,2850285829),w=a(w,s,y,p,L[m+2],z,4243563512),p=a(p,w,s,y,L[m+7],B,1735328473),y=a(y,p,w,s,L[m+12],D,2368359562),s=c(s,y,p,w,L[m+5],E,4294588738),w=c(w,s,y,p,L[m+8],F,2272392833),p=c(p,w,s,y,L[m+11],G,1839030562),y=c(y,p,w,s,L[m+14],H,4259657740),s=c(s,y,p,w,L[m+1],E,2763975236),w=c(w,s,y,p,L[m+4],F,1272893353),p=c(p,w,s,y,L[m+7],G,4139469664),y=c(y,p,w,s,L[m+10],H,3200236656),s=c(s,y,p,w,L[m+13],E,681279174),w=c(w,s,y,p,L[m+0],F,3936430074),p=c(p,w,s,y,L[m+3],G,3572445317),y=c(y,p,w,s,L[m+6],H,76029189),s=c(s,y,p,w,L[m+9],E,3654602809),w=c(w,s,y,p,L[m+12],F,3873151461),p=c(p,w,s,y,L[m+15],G,530742520),y=c(y,p,w,s,L[m+2],H,3299628645),s=C(s,y,p,w,L[m+0],I,4096336452),w=C(w,s,y,p,L[m+7],J,1126891415),p=C(p,w,s,y,L[m+14],K,2878612391),y=C(y,p,w,s,L[m+5],M,4237533241),s=C(s,y,p,w,L[m+12],I,1700485571),w=C(w,s,y,p,L[m+3],J,2399980690),p=C(p,w,s,y,L[m+10],K,4293915773),y=C(y,p,w,s,L[m+1],M,2240044497),s=C(s,y,p,w,L[m+8],I,1873313359),w=C(w,s,y,p,L[m+15],J,4264355552),p=C(p,w,s,y,L[m+6],K,2734768916),y=C(y,p,w,s,L[m+13],M,1309151649),s=C(s,y,p,w,L[m+4],I,4149444226),w=C(w,s,y,p,L[m+11],J,3174756917),p=C(p,w,s,y,L[m+2],K,718787259),y=C(y,p,w,s,L[m+9],M,3951481745),s=t(s,S),y=t(y,v),p=t(p,l),w=t(w,A);return(h(s)+h(y)+h(p)+h(w)).toLowerCase()}

 Env 
 prettier-ignore
 httpsgithub.comchavyleungscriptsblobmasterEnv.min.js

function Env(a,b){var c=Math.floor;return new class{constructor(a,b){this.name=a,this.version=1.7.4,this.data=null,this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator=n,this.encoding=utf-8,this.startTime=new Date().getTime(),Object.assign(this,b),this.log(,`🔔${this.name}, 开始!`)}platform(){returnundefined!=typeof $environment&&$environment[surge-version]Surgeundefined!=typeof $environment&&$environment[stash-version]Stashundefined==typeof module!module.exportsundefined==typeof $taskundefined==typeof $loonundefined==typeof $rocketundefined==typeof Egernvoid 0EgernShadowrocketLoonQuantumult XNode.js}isQuanX(){returnQuantumult X===this.platform()}isSurge(){returnSurge===this.platform()}isLoon(){returnLoon===this.platform()}isShadowrocket(){returnShadowrocket===this.platform()}isStash(){returnStash===this.platform()}isEgern(){returnEgern===this.platform()}toObj(a,b=null){try{return JSON.parse(a)}catch{return b}}toStr(a,b=null){try{return JSON.stringify(a)}catch{return b}}lodash_get(a={},b=,c=void 0){Array.isArray(b)(b=this.toPath(b));const d=b.reduce((a,b)=Object(a)[b],a);return d===void 0cd}lodash_set(a={},b=,c){return Array.isArray(b)(b=this.toPath(b)),b.slice(0,-1).reduce((a,c,d)=Object(a[c])===a[c]a[c]a[c]=^d+$.test(b[d+1])[]{},a)[b[b.length-1]]=c,a}toPath(a){return a.replace([(d+)]g,.$1).split(.).filter(Boolean)}getItem(a=new String,b=null){let c=b;switch(a.startsWith(@)){case!0const{keyb,pathd}=a.match(^@(key[^.]+)(.(path.))$).groups;a=b;let e=this.getItem(a,{});object!=typeof e&&(e={}),c=this.lodash_get(e,d);try{c=JSON.parse(c)}catch(a){}break;defaultswitch(this.platform()){caseSurgecaseLooncaseStashcaseEgerncaseShadowrocketc=$persistentStore.read(a);break;caseQuantumult Xc=$prefs.valueForKey(a);break;defaultc=this.data.[a]null}try{c=JSON.parse(c)}catch(a){}}return cb}setItem(a=new String,b=new String){let c=!1;switch(typeof b){caseobjectb=JSON.stringify(b);break;defaultb=b+}switch(a.startsWith(@)){case!0const{keyd,pathe}=a.match(^@(key[^.]+)(.(path.))$).groups;a=d;let f=this.getItem(a,{});object!=typeof f&&(f={}),this.lodash_set(f,e,b),c=this.setItem(a,f);break;defaultswitch(this.platform()){caseSurgecaseLooncaseStashcaseEgerncaseShadowrocketc=$persistentStore.write(b,a);break;caseQuantumult Xc=$prefs.setValueForKey(b,a);break;defaultc=this.data.[a]null}}return c}async fetch(a={},b={}){switch(a.constructor){case Objecta={...a,...b};break;case Stringa={urla,...b}}a.method(a.method=a.bodya.bodyBytesPOSTGET),delete a.headers.Host,delete a.headers.[authority],delete a.headers.[Content-Length],delete a.headers.[content-length];const c=a.method.toLocaleLowerCase();switch(this.platform()){caseLooncaseSurgecaseStashcaseEgerncaseShadowrocketdefaultreturn a.policy&&(this.isLoon()&&(a.node=a.policy),this.isStash()&&this.lodash_set(a,headers.X-Stash-Selected-Proxy,encodeURI(a.policy))),a.followRedirect&&((this.isSurge()this.isLoon())&&(a[auto-redirect]=!1),this.isQuanX()&&(a.optsa.opts.redirection=!1a.opts={redirection!1})),a.bodyBytes&&!a.body&&(a.body=a.bodyBytes,delete a.bodyBytes),await new Promise((b,d)={$httpClient[c](a,(c,e,f)={cd(c)(e.ok=^2dd$.test(e.status),e.statusCode=e.status,f&&(e.body=f,!0==a[binary-mode]&&(e.bodyBytes=f)),b(e))})});caseQuantumult Xreturn a.policy&&this.lodash_set(a,opts.policy,a.policy),boolean==typeof a[auto-redirect]&&this.lodash_set(a,opts.redirection,a[auto-redirect]),a.body instanceof ArrayBuffer(a.bodyBytes=a.body,delete a.body)ArrayBuffer.isView(a.body)(a.bodyBytes=a.body.buffer.slice(a.body.byteOffset,a.body.byteLength+a.body.byteOffset),delete object.body)a.body&&delete a.bodyBytes,await $task.fetch(a).then(a=(a.ok=^2dd$.test(a.statusCode),a.status=a.statusCode,a),a=Promise.reject(a.error))}}time(a,b=null){const d=bnew Date(b)new Date;let e={M+d.getMonth()+1,d+d.getDate(),H+d.getHours(),m+d.getMinutes(),s+d.getSeconds(),q+c((d.getMonth()+3)3),Sd.getMilliseconds()};for(let c in (y+).test(a)&&(a=a.replace(RegExp.$1,(d.getFullYear()+).slice(4-RegExp.$1.length))),e)new RegExp((+c+)).test(a)&&(a=a.replace(RegExp.$1,1==RegExp.$1.lengthe[c](00+e[c]).slice((+e[c]).length)));return a}getBaseURL(a){return a.replace([#].$,)}isAbsoluteURL(a){return ^[a-z][a-z0-9+.-].test(a)}getURLParameters(a){return(a.match(([^=&]+)(=([^&]))g)[]).reduce((b,a)=(b[a.slice(0,a.indexOf(=))]=a.slice(a.indexOf(=)+1),b),{})}getTimestamp(a=new Date){return c(a.getTime()1e3)}queryStr(a){let b=[];for(let c in a)a.hasOwnProperty(c)&&b.push(`${c}=${a[c]}`);let c=b.join(&);return c}queryObj(a){let b={},c=a.split(&);for(let d of c){let a=d.split(=),c=a[0],e=a[1];c&&(b[c]=e)}return b}msg(a=this.name,b=,c=,d){const e=a={switch(typeof a){case void 0return a;casestringswitch(this.platform()){caseSurgecaseStashcaseEgerndefaultreturn{urla};caseLooncaseShadowrocketreturn a;caseQuantumult Xreturn{open-urla}}caseobjectswitch(this.platform()){caseSurgecaseStashcaseEgerncaseShadowrocketdefault{let b=a.urla.openUrla[open-url];return{urlb}}caseLoon{let b=a.openUrla.urla[open-url],c=a.mediaUrla[media-url];return{openUrlb,mediaUrlc}}caseQuantumult X{let b=a[open-url]a.urla.openUrl,c=a[media-url]a.mediaUrl,d=a[update-pasteboard]a.updatePasteboard;return{open-urlb,media-urlc,update-pasteboardd}}}default}};if(!this.isMute)switch(this.platform()){caseSurgecaseLooncaseStashcaseShadowrocketdefault$notification.post(a,b,c,e(d));break;caseQuantumult X$notify(a,b,c,e(d))}}log(...a){0a.length&&(this.logs=[...this.logs,...a]),console.log(a.join(this.logSeparator))}logErr(a,b){switch(this.platform()){caseSurgecaseLooncaseStashcaseEgerncaseShadowrocketcaseQuantumult Xdefaultthis.log(,`❗️${this.name}, 错误!`,a,b)}}wait(a){return new Promise(b=setTimeout(b,a))}done(a={}){const b=new Date().getTime(),c=(b-this.startTime)1e3;switch(this.log(,`🔔${this.name}, 结束! 🕛 ${c} 秒`),this.platform()){caseSurgea.policy&&this.lodash_set(a,headers.X-Surge-Policy,a.policy),$done(a);break;caseLoona.policy&&(a.node=a.policy),$done(a);break;caseStasha.policy&&this.lodash_set(a,headers.X-Stash-Selected-Proxy,encodeURI(a.policy)),$done(a);break;caseEgern$done(a);break;caseShadowrocketdefault$done(a);break;caseQuantumult Xa.policy&&this.lodash_set(a,opts.policy,a.policy),delete a[auto-redirect],delete a[auto-cookie],delete a[binary-mode],delete a.charset,delete a.host,delete a.insecure,delete a.method,delete a.opt,delete a.path,delete a.policy,delete a[policy-descriptor],delete a.scheme,delete a.sessionIndex,delete a.statusCode,delete a.timeout,a.body instanceof ArrayBuffer(a.bodyBytes=a.body,delete a.body)ArrayBuffer.isView(a.body)(a.bodyBytes=a.body.buffer.slice(a.body.byteOffset,a.body.byteLength+a.body.byteOffset),delete a.body)a.body&&delete a.bodyBytes,$done(a)}}}(a,b)}