/**
 * @name App Store 更新监控
 * @description 监控指定 App Store 应用的多区域更新，支持自定义区域顺序，自动检测新增、更新及已移除的应用，并推送通知。
 * @platform Loon
 * @author sooyaaabo
 */

// --- 配置键 ---
// 存储 AppID 列表的键名
// 示例：444934666,414478124,930368978
const APP_IDS_KEY = 'AppStore_AppID';

// 可选：持久化数据中自定义区域顺序的键名
// 示例：cn,us,hk
const REGIONS_KEY = 'AppStore_Region';

// 存储所有被监控 App 详细信息的键名
const MONITORED_APPS_KEY = 'AppStore_Monitored_Apps';

// DeepL API Key 的键名
const DEEPL_API_KEY = 'AppStore_DeepL_API_Key';

// 并发数
const CONCURRENCY = 5;

// App Store 系统通知图标
const APP_STORE_ICON_URL = "https://raw.githubusercontent.com/sooyaaabo/Loon/main/Icon/App-Icon/AppStore-01.png";

// --- 工具函数 ---
function extractAppIds(rawArg) {
  if (!rawArg) return [];
  let rawStr = String(rawArg).trim();
  if (!rawStr) return [];
  const items = rawStr
    .split(/[\s,;，\n\r]+/)
    .map(s => s.trim())
    .filter(Boolean);
  const ids = items.filter(id => {
    if (!/^\d+$/.test(id)) return false;
    if (id.length > 1 && id[0] === '0') return false;
    return true;
  });
  return [...new Set(ids)];
}

function extractRegions(rawArg) {
  if (!rawArg) return [];
  let rawStr = String(rawArg).trim();
  if (!rawStr) return [];
  return rawStr
    .split(/[\s,;，\n\r]+/)
    .map(r => r.trim().toLowerCase())
    .filter(r => /^[a-z]{2}$/.test(r));
}

// 判断字符串是否包含非中文简体字符
function containsNonChinese(text) {
  // 正则表达式匹配中文简体字符范围
  const chineseRegex = /^[\u4e00-\u9fff\s.,!?;:'"()\[\]{}*#\-_=+<>~`@&$%^|\\\/0-9a-zA-Z]*$/;
  return !chineseRegex.test(text);
}

// --- DeepL 翻译工具函数 ---
async function translateViaDeepL(text, apiKey) {
  if (!apiKey || !text) {
    return text; // 如果没有密钥或文本，返回原文
  }
  const url = 'https://api-free.deepl.com/v2/translate'; // 使用免费版 API URL
  // 如果需要使用 Pro 版，将 URL 改为: https://api.deepl.com/v2/translate

  const headers = {
    'Authorization': `DeepL-Auth-Key ${apiKey}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'Loon Script'
  };

  const body = `text=${encodeURIComponent(text)}&target_lang=ZH`;

  return new Promise((resolve) => {
    $httpClient.post({
      url,
      headers,
      body
    }, (error, response, data) => {
      if (error || !response || response.status !== 200) {
        console.log(`[DeepL Error] ${error || `HTTP ${response?.status}`}. Returning original text.`);
        resolve(text); // 发生错误，返回原文
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        if (jsonData.translations && jsonData.translations[0] && jsonData.translations[0].text) {
          resolve(jsonData.translations[0].text);
        } else {
          console.log('[DeepL Error] Unexpected response format. Returning original text.');
          resolve(text);
        }
      } catch (e) {
        console.log(`[DeepL Error] Parsing response failed: ${e}. Returning original text.`);
        resolve(text);
      }
    });
  });
}


// 返回 { status: 'found' | 'notfound' | 'error', ... }
function lookupApp(region, appId) {
  return new Promise(resolve => {
    const url = `https://itunes.apple.com/${region}/lookup?id=${appId}&l=zh-CN&t=${Date.now()}`;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    };

    $httpClient.get({ url, headers }, (error, response, data) => {
      if (error || !response) {
        return resolve({ status: 'error', region, appId, reason: error || 'No response' });
      }

      if (response.status !== 200) {
        return resolve({ status: 'error', region, appId, reason: `HTTP ${response.status}` });
      }

      try {
        const json = JSON.parse(data);
        if (json.resultCount > 0) {
          resolve({ status: 'found', region, appId, appInfo: json.results[0] });
        } else {
          resolve({ status: 'notfound', region, appId });
        }
      } catch (e) {
        resolve({ status: 'error', region, appId, reason: 'JSON parse failed' });
      }
    });
  });
}

function compareVersions(v1, v2) {
  try {
    const parse = v => {
      v = String(v).trim();
      let main = v;
      let build = 0;
      const m = v.match(/^(.+?)\s*\((\d+)\)$/);
      if (m) {
        main = m[1].trim();
        build = parseInt(m[2], 10) || 0;
      }
      const parts = main
        .split('.')
        .map(p => {
          const n = parseInt(p, 10);
          return isNaN(n) ? 0 : n;
        });
      return { parts, build };
    };

    const a = parse(v1);
    const b = parse(v2);

    const len = Math.max(a.parts.length, b.parts.length);
    for (let i = 0; i < len; i++) {
      const x = a.parts[i] || 0;
      const y = b.parts[i] || 0;
      if (x > y) return 1;
      if (x < y) return -1;
    }

    if (a.build > b.build) return 1;
    if (a.build < b.build) return -1;
    return 0;
  } catch (e) {
    return v1 === v2 ? 0 : v1 > v2 ? 1 : -1;
  }
}

function handleDeletions(newIds, monitoredData) {
  const oldIds = Object.keys(monitoredData);
  const deletedIds = oldIds.filter(id => !newIds.includes(id));

  if (deletedIds.length > 0) {
    console.log('----- 移除监控 -----');
    deletedIds.forEach(id => {
      const appName = monitoredData[id].name || `ID: ${id}`;
      console.log(`[${appName}] (ID: ${id})`);
      delete monitoredData[id];
    });
    console.log('------------------\n');
  }
}

// --- 并发控制函数 ---
async function runWithConcurrency(tasks, limit) {
  const results = [];
  const executing = [];
  for (const task of tasks) {
    const p = Promise.resolve().then(() => task());
    results.push(p);
    if (limit <= tasks.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

function sendNotFoundNotification(appId, message, barkKey, barkSound) {
  if (barkKey) {
    $httpClient.post({
      url: `https://api.day.app/${barkKey}/`,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        title: `AppID [${appId}] 未找到`,
        body: message,
        icon: APP_STORE_ICON_URL,
        ...(barkSound ? { sound: barkSound } : {})
      })
    }, () => {});
  } else {
    $notification.post(`AppID [${appId}] 未找到`, '', message);
  }
}

async function checkAppUpdate(appId, monitoredData, regions, logs, barkKey, barkSound) {
  const existingAppData = monitoredData[appId];
  let searchRegions = [...regions];

/*
  // 如果已监控过，优先查询上次成功的区域
  if (existingAppData && existingAppData.region) {
    const lastKnownRegion = existingAppData.region;
    if (searchRegions.includes(lastKnownRegion)) {
      searchRegions = searchRegions.filter(r => r !== lastKnownRegion);
      searchRegions.unshift(lastKnownRegion);
    }
  }
*/

  let finalResult = null;
  let notFoundRegions = [];
  let errorRegions = [];

  for (const region of searchRegions) {
    let attempt = 0;
    let result = null;
    while (attempt < 2) {
      result = await lookupApp(region, appId);
      if (result.status !== 'error') {
        break;
      }
      attempt++;
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    if (result.status === 'found') {
      finalResult = result;
      break;
    } else if (result.status === 'notfound') {
      notFoundRegions.push(region);
    } else if (result.status === 'error') {
      errorRegions.push(region);
    }
  }

  // 成功找到
  if (finalResult) {
    const { appInfo, region } = finalResult;
    const appName = appInfo.trackName.split(/[-:–：]/)[0].trim();
    const newVersion = appInfo.version;
    let releaseNotes = appInfo.releaseNotes || '暂无更新说明';
    const updateDate = appInfo.currentVersionReleaseDate;
    const storedVersion = monitoredData[appId]?.version || null;
    const storedRegion = monitoredData[appId]?.region || null;

    if (!storedVersion) {
      logs.initial.push(
        `[${region.toUpperCase()}] ${appName} (ID: ${appId}) 初始化监控，版本 ${newVersion}。`
      );
    } else {
      const cmp = compareVersions(newVersion, storedVersion);
      if (cmp > 0) {
        logs.updated.push(
          `[${region.toUpperCase()}] ${appName} (ID: ${appId}) 有更新，版本变动 ${storedVersion} → ${newVersion}。`
        );
      } else if (cmp < 0) {
        logs.noUpdate.push(
          `[${region.toUpperCase()}] ${appName} (ID: ${appId}) 当前版本 (${newVersion}) 低于已记录版本 (${storedVersion})，可能区域变更。`
        );
      } else {
        if (storedRegion && storedRegion !== region) {
          logs.noUpdate.push(
            `[${region.toUpperCase()}] ${appName} (ID: ${appId}) 区域变更 ${storedRegion.toUpperCase()} → ${region.toUpperCase()}，版本 (${newVersion}) 未变。`
          );
        } else {
          logs.noUpdate.push(
            `[${region.toUpperCase()}] ${appName} (ID: ${appId}) 已是最新版本 (${newVersion})，无需更新。`
          );
        }
      }
    }

    if (!storedVersion || compareVersions(newVersion, storedVersion) > 0 || (storedRegion && storedRegion !== region)) {
      monitoredData[appId] = {
        version: newVersion,
        region: region,
        name: appName,
      };

      // 仅在首次或版本更新时发通知
      if (!storedVersion || compareVersions(newVersion, storedVersion) > 0) {
        const formattedDate = new Date(updateDate)
          .toLocaleString('zh-CN', {
            hour12: false,
            timeZone: 'Asia/Shanghai',
          })
          .replace(/\//g, '-');

        let title, subtitle, body;
        if (storedVersion) {
          title = `「${appName}」有更新啦！`;
          subtitle = `版本：${storedVersion} → ${newVersion}`;
          body = `更新时间：${formattedDate}\n更新内容：\n${releaseNotes}`;
        } else {
          title = `「${appName}」已添加监控`;
          subtitle = `区域：${region.toUpperCase()}　版本：${newVersion}`;
          body = `更新时间：${formattedDate}\n将从此版本开始监控更新。`;
        }

        // --- 新增翻译逻辑 ---
        const deeplApiKey = $persistentStore.read(DEEPL_API_KEY); // 从持久化存储读取
        if (containsNonChinese(releaseNotes) && deeplApiKey) {
             console.log(`[DeepL] 检测到非中文更新日志，尝试翻译...`);
             releaseNotes = await translateViaDeepL(releaseNotes, deeplApiKey);
             // 更新 body，使其包含翻译后的日志
             if (storedVersion) {
                 body = `更新时间：${formattedDate}\n更新内容：\n${releaseNotes}`;
             } else {
                 body = `更新时间：${formattedDate}\n将从此版本开始监控更新。`;
                 // 对于初始监控，一般不会有复杂的 releaseNotes 需要翻译
             }
         }

        if (barkKey) {
          let iconUrl = null;
          if (appInfo.artworkUrl100) {
            iconUrl = appInfo.artworkUrl100.replace(/\/\d+x\d+bb\.jpg$/, '/512x512bb.jpg');
          }

          const payload = {
            title: title,
            body: body,
            subtitle: subtitle,
            url: `itms-apps://itunes.apple.com/app/id${appId}`,
            ...(iconUrl ? { icon: iconUrl } : {}),
            ...(barkSound ? { sound: barkSound } : {})
          };

          $httpClient.post({
            url: `https://api.day.app/${barkKey}/`,
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            body: JSON.stringify(payload)
          }, () => {});
        } else {
          $notification.post(title, subtitle, body, `itms-apps://itunes.apple.com/app/id${appId}`);
        }
      }

    } else if (!monitoredData[appId]) {
      monitoredData[appId] = {
        version: newVersion,
        region: region,
        name: appName,
      };
    }
    return;
  }

  // 全部 notfound，无 error
  if (notFoundRegions.length === searchRegions.length && errorRegions.length === 0) {
    const message = `[${appId}] 在 ${regions.join(', ').toUpperCase()} 均未找到，请检查 AppID 是否正确或尝试添加新区域。`;
    logs.notFound.push(message);
    sendNotFoundNotification(appId, message, barkKey, barkSound);
    return;
  }

  // 存在 error（可能是限流/网络问题）
  const message = `[${appId}] 查询异常（可能因请求频繁），未获取有效结果。`;
  logs.error.push(message);
  console.log(`[ERROR] AppID ${appId}: error regions=${errorRegions.join(',')}, notfound=${notFoundRegions.join(',')}`);
}

// --- 主程序 ---
async function main() {
  // --- 1. 解析 argument ---
  let rawAppIdsStr = "";
  let rawRegionsStr = "";
  let barkKey = "";
  let barkSound = "";
  let deeplApiKeyValue = ""; // 新增变量

  if (typeof $argument !== "undefined" && $argument) {
    if (typeof $argument === 'object') {
      rawAppIdsStr = String($argument.app_ids || "");
      rawRegionsStr = String($argument.regions || "");
      barkKey = String($argument.bark_key || "").trim();
      barkSound = String($argument.bark_sound || "").trim();
      deeplApiKeyValue = String($argument.deepl_api || "").trim(); // 新增解析
    } else if (typeof $argument === 'string') {
      rawAppIdsStr = $argument;
    }
  }

  // 如果传入值为 "system"，则视为空，使用 Bark 默认铃声
  if (barkSound === 'system') {
    barkSound = '';
  }

  // 写入持久化（AppID、Regions 和 DeepL API Key）
  $persistentStore.write(extractAppIds(rawAppIdsStr).join(','), APP_IDS_KEY);
  $persistentStore.write(extractRegions(rawRegionsStr).join(','), REGIONS_KEY);
  $persistentStore.write(deeplApiKeyValue, DEEPL_API_KEY); // 新增写入


  // --- 2. 读取配置 ---
  const appStoreIds = $persistentStore.read(APP_IDS_KEY);
  const newIds = appStoreIds ? appStoreIds.split(',').map(id => id.trim()).filter(Boolean) : [];
  const storedData = $persistentStore.read(MONITORED_APPS_KEY);

  // --- 3. 未配置处理 ---
  if (!appStoreIds && (!storedData || storedData === '{}' || storedData === '')) {
    const message = `未配置 AppStore AppID，请在插件 Argument 中传入 AppID。`;
    console.log(message);
    if (barkKey) {
      $httpClient.post({
        url: `https://api.day.app/${barkKey}/`,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          title: 'App Store 监控未配置',
          body: message,
          icon: APP_STORE_ICON_URL,
          ...(barkSound ? { sound: barkSound } : {})
        })
      }, () => {});
    } else {
      $notification.post('App Store 监控未配置', '', message);
    }
    $done();
    return;
  }

  // --- 4. 清空逻辑 ---
  if (newIds.length === 0) {
    if (storedData && storedData !== '{}' && storedData !== '') {
      console.log('AppID 列表为空，正在清理所有监控记录...');
      $persistentStore.write('', MONITORED_APPS_KEY);
      console.log('所有监控记录已清除。');
    } else {
      console.log('AppID 列表为空，且无历史记录，无需操作。');
    }
    $done();
    return;
  }

  // --- 5. 加载监控数据 ---
  let monitoredData = {};
  if (storedData) {
    try {
      monitoredData = JSON.parse(storedData);
    } catch (e) {
      monitoredData = {};
    }
  }

  handleDeletions(newIds, monitoredData);

  // --- 6. 加载区域 ---
  const defaultRegions = ['us', 'ca', 'jp', 'kr', 'sg', 'hk', 'mo', 'tw', 'tr', 'cn'];
  let regions = defaultRegions;
  const customRegionsRaw = $persistentStore.read(REGIONS_KEY);
  let usingCustomRegions = false;

  if (customRegionsRaw) {
    const customRegions = customRegionsRaw.split(',').map(r => r.trim().toLowerCase()).filter(Boolean);
    if (customRegions.length > 0) {
      regions = customRegions;
      usingCustomRegions = true;
    }
  }

  console.log(`查询区域顺序: ${regions.join('→').toUpperCase()}${usingCustomRegions ? ' (自定义)' : ' (默认)'}`);
  console.log(`开始检测 ${newIds.length} 个应用更新...`);

  const logs = { initial: [], updated: [], noUpdate: [], notFound: [], error: [] };

  try {
    await runWithConcurrency(
      newIds.map(id => async () => {
        await checkAppUpdate(id, monitoredData, regions, logs, barkKey, barkSound);
      }),
      CONCURRENCY
    );

    console.log('');
    if (logs.initial.length > 0) {
      console.log('----- 首次监控 -----');
      logs.initial.forEach(log => console.log(log));
      console.log('------------------\n');
    }
    if (logs.updated.length > 0) {
      console.log('----- 应用更新 -----');
      logs.updated.forEach(log => console.log(log));
      console.log('------------------\n');
    }
    if (logs.noUpdate.length > 0) {
      console.log('----- 无需更新 -----');
      logs.noUpdate.forEach(log => console.log(log));
      console.log('------------------\n');
    }
    if (logs.notFound.length > 0) {
      console.log('----- 未找到应用 -----');
      logs.notFound.forEach(log => console.log(log));
      console.log('--------------------\n');
    }
    if (logs.error.length > 0) {
      console.log('----- 查询异常 -----');
      logs.error.forEach(log => console.log(log));
      console.log('--------------------\n');
    }

    $persistentStore.write(JSON.stringify(monitoredData), MONITORED_APPS_KEY);
    console.log('App Store 多区更新检查完成。');
  } catch (error) {
    console.log(`脚本执行出错: ${error}。`);
  } finally {
    $done();
  }
}

main().catch(err => {
  console.error(`致命错误: ${err}`);
  $done();
});