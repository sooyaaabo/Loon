// 直接读取外部传入的 t.me_redirect 参数
let scheme = $argument["t.me_redirect"];

// 预定义映射关系，简化 if-else 逻辑
const mapping = {
    "Telegram": "tg",
    "Swiftgram": "sg",
    "Turrit": "turrit",
    "iMe": "ime",
    "Nicegram": "ng",
    "Lingogram": "lingo"
};

// 检查并转换 t.me_redirect 参数
scheme = mapping[scheme] || scheme;

// 如果没有有效的 scheme，直接返回
if (!scheme) {
    $done({});
}

// 获取当前请求的 URL
let url = $request.url;

// 正则匹配 t.me/xxx
let match = url.match(/(?:https:\/\/)?t\.me\/(.+)/);

if (match) {
    // 构造新的 URL 地址
    let newUrl = `${scheme}://resolve?domain=${match[1]}`;

    // 修改响应的 Location header 进行 307 重定向
    $done({
        status: 307,
        headers: {
            'Location': newUrl
        }
    });
} else {
    $done({});
}
