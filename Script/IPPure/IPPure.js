async function request(method, params) {
  // 基于 $httpClient 的请求封装
  return new Promise((resolve) => {
    const httpMethod = $httpClient[method.toLowerCase()];
    httpMethod(params, (error, response, data) => {
      resolve({ error, response, data });
    });
  });
}

async function main() {
  // API 接口地址
  const url = "https://my.ippure.com/v1/info";

  const nodeName = $environment.params?.node;

  const { error, response, data } = await request("GET", {url, node: nodeName});

  // 网络异常
  if (error || !data) {
    return $done({
      title: "IPPure 信息概览",
      htmlMessage: "<b>网络错误</b>"
    });
  }

  let json;
  try {
    // 解析接口返回 JSON
    json = JSON.parse(data);

    // 输出原始 JSON
    console.log(JSON.stringify(json, null, 2));

  } catch {
    return $done({
      title: "IPPure 信息概览",
      htmlMessage: "<b>JSON 数据无效</b>"
    });
  }

  // 节点名称
  const nodeNameDisplay = nodeName ?? "未知节点";

  // IP 字段兼容
  const ip = json.ipAddress || json.query || json.ip || "未知";

  // 地理位置（城市 / 区域 / 国家）
  const loc =
    [json.city, json.region, json.country].filter(Boolean).join(", ") ||
    "未知";

  // ISP
  const isp = json.asOrganization || "未知";

  // ASN 字段兼容处理
  const asn =
    json.asNumber ||
    json.asn ||
    (json.as && json.as.replace(/[^0-9]/g, "")) ||
    "未知";

  // Fraud Score（风险系数）
  const score = json.fraudScore ?? "N/A";

  // 风险等级颜色与文本
  function getScoreLevel(score) {
    if (score === "N/A") return { text: "未知", color: "#000000" };

    const s = Number(score);
    if (s >= 0 && s <= 15) return { text: "极度纯净", color: "#166534" };
    if (s >= 16 && s <= 25) return { text: "纯净", color: "#22c55e" };
    if (s >= 26 && s <= 40) return { text: "中性", color: "#84cc16" };
    if (s >= 41 && s <= 50) return { text: "轻度风险", color: "#eab308" };
    if (s >= 51 && s <= 70) return { text: "中度风险", color: "#f97316" };
    if (s >= 71 && s <= 100) return { text: "极度风险", color: "#dc2626" };

    return { text: "未知", color: "#000000" };
  }

  const level = getScoreLevel(score);

  // ---- 风险系数 ----
  const scoreHtml =
    score === "N/A"
      ? `<span style="color:#000000;">N/A</span> <span style="color:#000000;">-</span> <span style="color:#000000;">未知</span>`
      : `<span style="color:${level.color};">${score}</span> <span style="color:#000000;">-</span> <span style="color:${level.color};">${level.text}</span>`;

  // IP 类型颜色高亮处理
  const isRes = Boolean(json.isResidential);  // 住宅 or 数据中心
  const isBrd = Boolean(json.isBroadcast);    // 原生 or 广播

  const typeText = isRes ? "住宅网络" : "数据中心";
  const brdText = isBrd ? "广播" : "原生";

  const typeColor = isRes ? "#48c78e" : "#fe6685";
  const brdColor = isBrd ? "#fe6685" : "#48c78e";

  // ---- HTML ----
  const html = `
<div style="margin:0;padding:0;font-family:-apple-system;font-size:large;">

<br>
<b>节点:</b> ${nodeNameDisplay}<br><br>

<b>IP 地址:</b> ${ip}<br><br>

<b>ISP:</b> ${isp}<br><br>

<b>ASN:</b> ${asn}<br><br>

<b>地理位置:</b> ${loc}<br><br>

<b>属性来源:</b>
<span style="color:${typeColor};">${typeText}</span> •
<span style="color:${brdColor};">${brdText}</span>
<br><br>

<b>风险系数:</b> ${scoreHtml}

</div>
`.trim();

  return $done({
    title: "IPPure 信息概览",
    htmlMessage: html
  });
}

// 主入口
(async () => {
  try {
    await main();
  } catch (e) {
    $done({
      title: "IPPure 信息概览",
      htmlMessage: "<b>脚本错误：</b>" + e.message
    });
  }
})();