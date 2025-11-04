/**
 * @name Apple 系统更新监控
 * @description 监控 Apple 官方 RSS 中的系统更新
 * @platform Loon
 * @author sooyaaabo
 */

// 持久化键：用于记录已推送过的条目 GUID
const SEEN_ITEMS_KEY = 'AppleSystemUpdate_Seen_Items';

// Apple 官方系统更新 RSS 地址
const RSS_URL = 'https://developer.apple.com/news/releases/rss/releases.rss';

// 各系统对应的 Bark 通知图标 URL
const SYSTEM_ICONS = {
  ios: 'https://raw.githubusercontent.com/sooyaaabo/Loon/main/Icon/Other-Icon/iOS.png',
  ipados: 'https://raw.githubusercontent.com/sooyaaabo/Loon/main/Icon/Other-Icon/iPadOS.png',
  macos: 'https://raw.githubusercontent.com/sooyaaabo/Loon/main/Icon/Other-Icon/macOS.png',
  tvos: 'https://raw.githubusercontent.com/sooyaaabo/Loon/main/Icon/Other-Icon/tvOS.png',
  watchos: 'https://raw.githubusercontent.com/sooyaaabo/Loon/main/Icon/Other-Icon/watchOS.png',
  visionos: 'https://raw.githubusercontent.com/sooyaaabo/Loon/main/Icon/Other-Icon/visionOS.png'
};

// 默认图标
const DEFAULT_ICON = 'https://raw.githubusercontent.com/sooyaaabo/Loon/main/Icon/App-Icon/Apple.png';

/**
 * 从 RSS XML 文本中解析出 <item> 条目
 * 提取 title、link、guid 字段，并清理多余空白字符
 */
function parseRSS(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const content = match[1];
    const titleMatch = /<title>(.*?)<\/title>/i.exec(content);
    const linkMatch = /<link>(.*?)<\/link>/i.exec(content);
    const guidMatch = /<guid[^>]*>(.*?)<\/guid>/i.exec(content);

    if (titleMatch && linkMatch) {
      items.push({
        title: titleMatch[1].trim(),
        link: linkMatch[1].trim().replace(/\s+/g, ''),
        guid: guidMatch ? guidMatch[1].trim().replace(/\s+/g, '') : linkMatch[1].trim().replace(/\s+/g, '')
      });
    }
  }
  return items;
}

/**
 * 根据标题判断属于哪个 Apple 系统（如 iOS、macOS 等）
 * 返回系统类型键（如 'ios'），若不匹配则返回 null
 */
function getSystemType(title) {
  const systemMap = {
    ios: ['iOS '],
    ipados: ['iPadOS '],
    macos: ['macOS '],
    tvos: ['tvOS '],
    watchos: ['watchOS '],
    visionos: ['visionOS ']
  };
  for (const [key, prefixes] of Object.entries(systemMap)) {
    if (prefixes.some(p => title.startsWith(p))) {
      return key;
    }
  }
  return null;
}

/**
 * 从标题中提取主版本号（如 "iOS 26.1 RC" → "26"）
 * 使用正则匹配系统名称后的第一个数字
 */
function extractMajorVersion(title) {
  const match = /^(iOS|iPadOS|macOS|tvOS|watchOS|visionOS)\s+(\d+)/i.exec(title);
  return match ? match[2] : null;
}

/**
 * 判断是否为测试版（包含 "beta" 或 "RC" 字样，不区分大小写）
 */
function isBetaVersion(title) {
  return /(?:beta|RC)/i.test(title);
}

/**
 * 发送通知（支持 Bark 和 Loon 原生通知）
 * @param {string} title 通知标题
 * @param {string} subtitle 副标题（可选）
 * @param {string} body 正文
 * @param {string} url 点击跳转链接
 * @param {string} barkKey Bark 推送密钥
 * @param {string} barkSound Bark 铃声（可选）
 * @param {string} icon 图标 URL（用于 Bark）
 */
function sendNotification(title, subtitle, body, url, barkKey, barkSound, icon) {
  if (barkKey) {
    // 使用 Bark 推送
    $httpClient.post({
      url: `https://api.day.app/${barkKey}/`,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        title: title,
        body: body,
        ...(subtitle ? { subtitle: subtitle } : {}),
        icon: icon,
        ...(url ? { url: url } : {}),
        ...(barkSound ? { sound: barkSound } : {})
      })
    }, () => {});
  } else {
    // 使用 Loon 原生通知
    $notification.post(title, subtitle || '', body, url || '');
  }
}

/**
 * 主函数：执行整个监控逻辑
 */
async function main() {
  // 各系统开关，默认关闭
  let enable_ios = false;
  let enable_ipados = false;
  let enable_macos = false;
  let enable_tvos = false;
  let enable_watchos = false;
  let enable_visionos = false;
  
  // system 参数：用户输入的主版本号列表（如 "26,18"）
  let systemInput = '';
  // version 参数：版本类型过滤（"all" / "beta" / "official"）
  let versionFilter = 'all';
  
  // Bark 配置
  let barkKey = '';
  let barkSound = '';

  // 从 Loon 的 Argument 中读取配置（支持对象格式）
  if (typeof $argument === 'object') {
    enable_ios = Boolean($argument.enable_ios);
    enable_ipados = Boolean($argument.enable_ipados);
    enable_macos = Boolean($argument.enable_macos);
    enable_tvos = Boolean($argument.enable_tvos);
    enable_watchos = Boolean($argument.enable_watchos);
    enable_visionos = Boolean($argument.enable_visionos);
    systemInput = String($argument.system || '').trim();
    versionFilter = String($argument.version || 'all').toLowerCase();
    barkKey = String($argument.bark_key || '').trim();
    barkSound = String($argument.bark_sound || '').trim();
  }

  // 若 bark_sound 为 "system"，则清空（使用 Bark 默认铃声）
  if (barkSound === 'system') barkSound = '';

  // 解析用户输入的主版本号，存入 Set 便于快速查找
  const targetVersions = new Set();
  if (systemInput) {
    systemInput.split(/[,，\s]+/)
      .map(v => v.trim())
      .filter(v => /^\d+$/.test(v))
      .forEach(v => targetVersions.add(v));
  }
  const monitorAllVersions = targetVersions.size === 0; // 是否监控所有主版本

  // 从持久化存储中读取已推送的条目 GUID
  let seenItems = new Set();
  const storedSeen = $persistentStore.read(SEEN_ITEMS_KEY);
  if (storedSeen) {
    try {
      seenItems = new Set(JSON.parse(storedSeen));
    } catch (e) {
      seenItems = new Set(); // 解析失败则清空
    }
  }

  // 获取 RSS 内容
  let rssText = '';
  try {
    const resp = await new Promise((resolve) => {
      $httpClient.get({ url: RSS_URL }, (err, res, data) => {
        resolve(!err && res?.status === 200 ? data || '' : '');
      });
    });
    rssText = resp;
  } catch (e) {
    console.log('RSS 获取失败:', e);
    $done();
    return;
  }

  if (!rssText) {
    console.log('无法获取 Apple 更新 RSS');
    $done();
    return;
  }

  // 解析 RSS 条目
  const items = parseRSS(rssText);
  console.log(`共解析到 ${items.length} 条 RSS 条目`);

  let newItems = 0;
  // 遍历每条 RSS 条目，进行过滤和推送判断
  for (const item of items) {
    const sys = getSystemType(item.title);          // 判断系统类型
    const majorVer = extractMajorVersion(item.title); // 提取主版本号
    const isBeta = isBetaVersion(item.title);       // 判断是否为测试版

    // 打印详细日志（用于调试）
    console.log(`\n检查条目: ${item.title}`);
    console.log(`GUID: ${item.guid}`);
    console.log(`系统类型: ${sys || '未知'}`);
    console.log(`主版本号: ${majorVer || '无法提取'}`);
    console.log(`是否 Beta/RC: ${isBeta}`);

    // 跳过非系统更新条目（如 Xcode、Transporter 等）
    if (!sys) {
      console.log(`跳过：非系统更新条目`);
      continue;
    }

    // 检查该系统是否启用监控
    const enabledMap = {
      ios: enable_ios,
      ipados: enable_ipados,
      macos: enable_macos,
      tvos: enable_tvos,
      watchos: enable_watchos,
      visionos: enable_visionos
    };

    if (!enabledMap[sys]) {
      console.log(`跳过：${sys} 未启用监控`);
      continue;
    }

    // 无法提取主版本号则跳过
    if (!majorVer) {
      console.log(`跳过：无法提取主版本号`);
      continue;
    }

    // 如果用户指定了主版本号，且当前版本不在列表中，则跳过
    if (!monitorAllVersions && !targetVersions.has(majorVer)) {
      console.log(`跳过：主版本 ${majorVer} 不在监控列表 [${Array.from(targetVersions).join(', ')}]`);
      continue;
    }

    // 根据 versionFilter 过滤正式版/测试版
    if (versionFilter === 'official' && isBeta) {
      console.log(`跳过：仅监控正式版，但当前为 Beta/RC`);
      continue;
    }
    if (versionFilter === 'beta' && !isBeta) {
      console.log(`跳过：仅监控 Beta/RC，但当前为正式版`);
      continue;
    }

    // 已推送过则跳过
    if (seenItems.has(item.guid)) {
      console.log(`跳过：已推送过`);
      continue;
    }

    // 准备推送
    const systemName = {
      ios: 'iOS',
      ipados: 'iPadOS',
      macos: 'macOS',
      tvos: 'tvOS',
      watchos: 'watchOS',
      visionos: 'visionOS'
    }[sys];

    // 提取显示用的完整版本号（如 "26.1 RC"）
    const versionMatch = item.title.match(/(?:iOS|iPadOS|macOS|tvOS|watchOS|visionOS)\s+([^\s]+)/i);
    const displayVersion = versionMatch ? versionMatch[1] : '';

    // 选择对应系统的图标
    const icon = SYSTEM_ICONS[sys] || DEFAULT_ICON;

    // 发送通知
    sendNotification(
      `「${systemName}」新版本发布！`,
      displayVersion ? `版本：${displayVersion}` : '',
      item.title,
      item.link,
      barkKey,
      barkSound,
      icon
    );

    // 记录已推送
    seenItems.add(item.guid);
    newItems++;
    console.log(`已推送通知`);
  }

  // 更新持久化记录
  if (newItems > 0) {
    console.log(`\n总计推送 ${newItems} 条新系统更新`);
    $persistentStore.write(JSON.stringify([...seenItems]), SEEN_ITEMS_KEY);
  } else {
    console.log(`\n本次无符合条件的新系统更新`);
  }

  $done();
}

// 启动主函数，并捕获异常
main().catch(err => {
  console.error('脚本异常:', err);
  $done();
});