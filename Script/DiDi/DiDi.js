
// 2024-08-20 09:49
/* 分流规则（添加到分流配置中）
ip-cidr, 123.207.209.39/32, reject
ip-cidr, 123.207.209.60/32, reject
ip-cidr, 139.199.240.12/32, reject
ip-cidr, 139.199.240.15/32, reject
ip-cidr, 139.199.240.15/32, reject
ip-cidr, 123.207.209.60/32, reject
*/

const url = $request.url;
if (!$response.body) $done({});

let obj = JSON.parse($response.body);

// 通用广告处理
try {
  if (obj?.data?.instances?.oversea_main_banner) {
    delete obj.data.instances.oversea_main_banner;
  }
} catch (e) {
  console.log("移除广告条错误: " + e);
}

// 场景列表处理
if (url.includes("/other/pGetSceneList")) {
  if (obj?.data?.scene_list instanceof Array) {
    obj.data.scene_list = obj.data.scene_list.filter(item => item.text !== "优惠商城");
  }
  if (obj?.data?.show_data instanceof Array) {
    obj.data.show_data.forEach(block => {
      if (block.scene_ids instanceof Array) {
        block.scene_ids = block.scene_ids.filter(id => id !== "scene_coupon_mall");
      }
    });
  }
}

// 首页导航处理
if (url.includes("/homepage/v1/core")) {
  const keepNavIds = ['dache_anycar', 'driverservice', 'bike', 'carmate'];
  if (obj.data?.order_cards?.nav_list_card?.data) {
    obj.data.order_cards.nav_list_card.data = obj.data.order_cards.nav_list_card.data.filter(
      item => keepNavIds.includes(item.nav_id)
    );
  }

  const keepBottomNavIds = ['v6x_home', 'home_page', 'user_center'];
  if (obj.data?.disorder_cards?.bottom_nav_list?.data) {
    obj.data.disorder_cards.bottom_nav_list.data = obj.data.disorder_cards.bottom_nav_list.data.filter(
      item => keepBottomNavIds.includes(item.id)
    );
  }
}

// 顶部横幅处理
if (url.includes("/ota/na/yuantu/infoList")) {
  if (obj.data?.disorder_cards?.top_banner_card?.data?.[0]?.T === "yuentu_top_banner") {
    obj.data.disorder_cards.top_banner_card.data.shift();
  }
}

// 乘客中心处理
if (url.includes("/gulfstream/passenger-center/v2/other/pInTripLayout")) {
  const namesToRemove = ["passenger_common_casper"];
  if (obj.data?.order_components) {
    obj.data.order_components = obj.data.order_components.filter(
      component => !namesToRemove.includes(component.name)
    );
  }
}

// 用户中心处理
if (url.includes("/usercenter/me")) {
  const excludedTitles = ['天天领福利', '金融服务', '更多服务', '企业服务', '安全中心'];
  if (obj.data?.cards) {
    obj.data.cards = obj.data.cards.filter(card => !excludedTitles.includes(card.title));
    
    obj.data.cards.forEach(card => {
      if (card.tag === "wallet") {
        if (card.items) {
          card.items = card.items.filter(item => item.title === "优惠券");
        }
        if (card.card_type === 4 && card.bottom_items) {
          card.bottom_items = card.bottom_items.filter(item => 
            item.title === "省钱套餐" || item.title === "出行里程"
          );
        }
      }
    });
  }
}

$done({ body: JSON.stringify(obj) });