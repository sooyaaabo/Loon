// 2023-12-11 19:20

const url = $request.url;
const method = $request.method;
const postMethod = "POST";
const notifyTitle = "贴吧json脚本错误";
//console.log(`贴吧json-2022.11.09`);

let body = JSON.parse($response.body);
// 直接全局搜索
if (url.includes("tiebaads/commonbatch") && method === postMethod) {
  // 看图模式下的广告
  let adCmd = getUrlParamValue(url, "adcmd");
  if (adCmd) {
    if (body.error_code === 0) {
      if (body.res.ad?.length) {
        body.res.ad = [];
        // 即使ad有内容 也不一定显示广告
        // 因为如果服务器下发的数据少了一些字段同样是无广告的
      }
    }
  }
} else if (url.includes("c/f/pb/picpage")) {
  const liveLength = body.recom_live_list?.length;
  if (liveLength) {
    body.recom_live_list = [];
  }
} else if (url.includes("c/s/sync")) {
  // get post(贴吧使用了post)均可访问
  if ("floating_icon" in body) {
    if (body.floating_icon) {
      if (body.floating_icon.homepage?.icon_url) {
      }
      if (body.floating_icon.pb?.icon_url) {
      }
      body.floating_icon = null;
    }
  }
  // 回帖栏的广告
  if ("advertisement_config" in body) {
    if (body.advertisement_config?.advertisement_str) {
      body.advertisement_config = null;
    }
  }
  if ("config" in body) {
    if (body.config?.switch) {
      for (const item of body.config.switch) {
        if (["platform_csj_init", "platform_ks_init", "platform_gdt_init"]?.includes(item.name)) {
          item.type = "0";
          // 禁止初始化穿山甲/广点通/快手
        }
      }
    }
  }
  if ("screen_fill_data_result" in body) {
    let result = body.screen_fill_data_result;
    if (result.screen_fill_advertisement_bear_switch === "1") {
      result.screen_fill_advertisement_bear_switch = "0";
    }
    if (result.screen_fill_advertisement_plj_cpc_switch === "1") {
      result.screen_fill_advertisement_plj_cpc_switch = "0";
    }
    if (result.screen_fill_advertisement_plj_switch === "1") {
      result.screen_fill_advertisement_plj_switch = "0";
    }
  }
  if ("ad_stlog_switch" in body) {
    if (body.ad_stlog_switch === "1") {
      body.ad_stlog_switch = "0";
    }
  }
  if ("lcs_strategy" in body) {
    // 控制长连接开关 开启时帖子会走socket
    if (body.lcs_strategy.conn_conf === "0") {
      // 关闭
      body.lcs_strategy.conn_conf = "1";
    }
  }
} else if (url.includes("c/f/frs/page")) {
  if (body.live_fuse_forum?.length) {
    body.live_fuse_forum = [];
  }
  if (body.activityhead?.is_ad) {
    body.activityhead = {};
  }
  body.thread_list = removeLive(body.thread_list);
  removeGoodsInfo(body.forum?.banner_list?.app);
} else if (url.includes("c/f/frs/threadlist")) {
  // TODO
} else if (url.includes("c/f/pb/page")) {
  if (body.recom_ala_info?.live_id) {
    body.recom_ala_info = null;
  }
  if (body.post_list?.length) {
    for (const post of body.post_list) {
      if (post.outer_item) {
        post.outer_item = null;
      }
    }
  }
  if (body.banner_list) {
    removeGoodsInfo(body.banner_list?.app);
    removeGoodsInfo(body.banner_list?.pb_banner_ad);
  }
} else if (url.includes("c/f/excellent/personalized")) {
  removeGoodsInfo(body.banner_list?.app);
  body.thread_list = removeLive(body.thread_list);
} else if (url.includes("c/f/frs/generalTabList")) {
  // TODO
}

body = JSON.stringify(body);
$done({ body });

function getUrlParamValue(url, queryName) {
  return Object.fromEntries(
    url
      .substring(url.indexOf("?") + 1)
      .split("&")
      .map((pair) => pair.split("="))
  )[queryName];
}

function removeGoodsInfo(app) {
  if (app?.length) {
    let goodsInfoSize = 0;
    app.forEach((item) => {
      if (item.goods_info?.length) {
        goodsInfoSize++;
        item.goods_info = [];
      }
    });
  }
}

function removeLive(threadList) {
  let newThreadList = threadList;
  const beforeLength = threadList?.length;
  if (beforeLength) {
    newThreadList = threadList.filter((item) => !item.ala_info);
    if (beforeLength === newThreadList.length) {
    }
  }
  return newThreadList;
}
