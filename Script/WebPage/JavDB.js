// 2024-06-30 11:40

if (!/html>/.test($response.body)) $done({});

// 去顶部域名,底部下载提醒,播放页广告
const body = $response.body.replace(
  /<\/head>/,
  "<style> .sub-header, .app-desktop-banner, .moj-content {display:none!important;} </style> \n </head>"
);

$done({ body });
