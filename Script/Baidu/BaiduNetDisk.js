// 2023-09-19 18:35

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (url.includes("/api/getsyscfg?")) {
  const switchs = [
    "active_sigin_text", // 签到文案
    "ai_search_h5", // ai搜索
    "album_story_config", // 首页视频故事卡片开关配置
    "application_area", // 相册 视频 文档 小说 已过期配置
    "appstore_review_area", // iOS审核配置
    "background_task_scheduler_config_area", // 后台拉活任务配置
    "backup_area", // 新用户促活备份节点
    "bdnc_commerce_config_area", // ai看节点
    "bdnc_commerce_expire_alert_area", // 联合会员会员频道弹窗展示开关
    "bdnc_commerce_video_ad_area_pad", // 视频贴片广告跳转链接
    "bdpan_home_launched_alert_config_area", // 首页弹窗管理配置
    "business_ad_config_area", // 穿山甲激励视频 商业广告 度小满送新人福利
    "certification_user_area", // 官方认证V标
    "cloud_image_service", // iOS新版工具
    "content_search_incremental_diff_area", // 内容搜索liang lian jie diff 开关
    "enterprise_banner_area", // 企业运营位
    "enterprise_bottom_banner", // 企业版banner
    "enterprise_hot_tools_area", // 企业首页热门工具
    "enterprise_share_file_list", // 去企业空间
    "enterprise_space_area", // 企业空间权限管理开关（iOS）
    "enterprise_space_config_area", // 企业空间
    "enterprise_space_document_pay_guide", // 企业空间PDF工具付费引导配置
    "file_tag_area", // 文件列表tag
    "flow_package_config_area", // iOS流量包配置
    "flutter_business_area", // 企业认证配置节点
    "freeFlow_area", // 免流入口节点
    "home_card_area", // 首页卡片(推荐服务工具配置)
    "home_recnet_chasing_card_switch", // 首页最近在追tab开关
    "home_tool_area_all_tool_item_area", // 工具区域-全部工具角标
    "iOS_inspire_config", // iOS端龙年新春灵感卡
    "ios_carplay_config_area", // 网盘iOS端CarPlay引导功能节点
    "ios_netdisk_mnp_config_area", // 小猴文档打印开关配置
    "local_push", // 本地Push活跃检测
    "magictrick", // 云一朵底部入口小流量iOS
    "magictrick_inspiration_area", // 学霸神器 玩点有趣 社交情感
    "my_person_service", // 我的服务title 度小满
    "my_personal_page_settings", // 个人页面配置
    "my_settings", // 我的页面各种卡片
    "my_share_tag_area", // 企业权益基础包
    "new_feed_home_area", // iOS新首页节点
    "new_user_card", // 新人必看
    "ocr_ai_scan_entrance_area", // 拍一拍home页相机入口飘条
    "plus_panel_entrance_config", // +号面板引导描述文字配置
    "private_background_upload", // 后台传输备份push
    "public_guide_config", // 引导飘条
    "public_home_config", // 首页运营
    "public_imprint_config", // 印迹制作相关配置
    "push_active_area", // push引导弹窗
    "share_Im_idol_area", // 吴磊idol特权解锁展示
    "share_tool_area", // 共享tab顶部菜单
    "splash_advertise_fetch_config_area", // 开屏广告
    "splash_advertise_type_area", // 开屏广告
    "switch_config_area", // 个人空间企业套餐购买入口展示开关
    "tabbar_vip_config_area", // 发现页tab
    "theme_skin_active_area", // 十周年皮肤配置节点
    "thrid_ad_buads_service", // 穿山甲SDK初始化开关
    "thrid_ad_funads_service", // 小熊SDK初始化开关
    "universal_card_area", // 通用卡片
    "upload_retrieve", // 自动上报配置
    "video_player_magic_trick_entrance_area", // 视频云一朵入口开关配置
    "voip_push_config" // VoIP功能配置
  ];
  for (let i of switchs) {
    if (obj?.[i]?.cfg_list?.length > 0) {
      obj[i].cfg_list = [];
      // for (let ii of obj[i].cfg_list) {
      //   if (ii?.switch) {
      //     ii.switch = "0";
      //   }
      //   if (ii?.open) {
      //     ii.open = "0";
      //   }
      // }
    }
  }
} else if (url.includes("/membership/user?")) {
  obj = {
    product_infos: [
      {
        cur_svip_type: "Crack",
        product_name: "svip2_nd",
        product_description: "解锁倍速+画质",
        function_num: 510004015,
        start_time: 1672502400,
        buy_description: "无下载加速",
        buy_time: 980784000,
        product_id: "问好",
        auto_upgrade_to_svip: 0,
        end_time: 4070880000,
        cluster: "vip",
        detail_cluster: "svip",
        status: 0
      }
    ],
    level_info: { current_level: 10 }
  };
}

$done({ body: JSON.stringify(obj) });
