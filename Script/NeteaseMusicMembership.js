// 2024-08-05 19:25

const url = $request.url;
const header = $request.headers;
const isNetEase = url.includes("/interface") && url.includes(".music.163.com/");

if (isNetEase) {
    if ($persistentStore.read("Music163_MConfigInfo") === undefined || $persistentStore.read("Music163_MConfigInfo") === null) {
        $notification.post("脚本出错", "参数缺失", "请在插件内填入数据");
        $done({});
      } else {
        header["cookie"] = $persistentStore.read("Music163_Cookie");
        header["mconfig-info"] = $persistentStore.read("Music163_MConfigInfo");
        header["user-agent"] = $persistentStore.read("Music163_UserAgent");
      } else {
      $done({});
  }
  $done({ headers: header });
} else {
  $done({});
}
