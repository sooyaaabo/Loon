// 2024-05-02 13:05

const url = $request.url;
if (!$response.body) $done({});
let obj = JSON.parse($response.body);

if (url.includes("/common/getReceipt")) {
  if (obj?.payload?.adInfo) {
    delete obj.payload.adInfo;
  }
} else if (url.includes("/user/message/equipmentPara")) {
  const items = ["bottomAd", "insurance", "popTips"];
  if (obj?.payload) {
    for (let i of items) {
      delete obj.payload[i];
    }
    if (obj?.payload?.payAfterAd) {
      obj.payload.payAfterAd = false;
    }
  }
}

$done({ body: JSON.stringify(obj) });
