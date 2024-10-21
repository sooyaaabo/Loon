/*
https://raw.githubusercontent.com/ZenmoFeiShi/Qx/main/TB.js
*/
//2024.08.29   17:10

const targetPaths = [
  "zone_info.1.commerce",
  "zone_info.2.banner",
  "zone_info.0.common_func",
  "zone_info.3.game",
  "zone_info.4.auxiliary_func"
];

function deleteTargetPath(data, path) {
  let parts = path.split('.');
  let last = parts.pop();
  let obj = data;
  
  for (let part of parts) {
    if (obj && obj.hasOwnProperty(part)) {
      obj = obj[part];
    } else {
      return data;
    }
  }

  if (obj && obj.hasOwnProperty(last)) {
    delete obj[last];
  }

  return data;
}

const url = $request.url;
let obj;
try {
    obj = JSON.parse($response.body);
} catch (error) {
    console.error("JSON 解析错误：", error);
    $done({});
    return;
}

if (url.includes("/sidebar/home")) {
    delete obj.vip_banner;
    delete obj.tools;
}

if (url.includes("/frs/frsBottom")) {
    delete obj.card_activity.small_card;
    delete obj.card_activity.big_card;
    delete obj.ai_chatroom_guide;
}

if (url.includes("/user/profile")) {
    delete obj.banner;
    delete obj.duxiaoman_entry;
    delete obj.recom_naws_list;
    delete obj.vip_banner;
    delete obj.namoaixud_entry;
    
    targetPaths.forEach(path => {
        obj = deleteTargetPath(obj, path);
    });
}

if (obj.hasOwnProperty("user") && obj["user"].hasOwnProperty("user_growth")) {
    delete obj["user"]["user_growth"];
}

const typesToRemove = [60, 53, 58, 50, 10, 64, 51, 52, 55, 57, 62];

if (obj.custom_grid && Array.isArray(obj.custom_grid)) {
    obj.custom_grid = obj.custom_grid.filter(item => !typesToRemove.includes(item.type));
}

if (url.includes("/livefeed/feed")) {
    delete obj.data?.banner?.items;
}

$done({body: JSON.stringify(obj)});