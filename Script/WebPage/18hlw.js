// 2024.11.29 01:33
// https://raw.githubusercontent.com/ZenmoFeiShi/Qx/main/18hlw.js

let body = $response.body;
const url = $request.url;

// 删除广告块
body = body.replace(/<div class="list-sec" data-v-ce3d4daa>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');

// 删除 infomation 部分
body = body.replace(/<div class="infomation" data-v-069c08b5>[\s\S]*?<\/div>/g, '');


// 移除特定的 <div> 元素
body = body.replace(/<div id="share-text" style="display: none">[\s\S]*?<\/div>/, '');

// 移除底部广告链接
body = body.replace(/<div class="footer" data-v-0bca6db2>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

// 删除 Google Analytics 脚本
body = body.replace(/<script async src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-D19N9LPLRP"><\/script>[\s\S]*?<script>[\s\S]*?<\/script>/, '');

// 删除统计图像加载脚本
body = body.replace(/<script>\s*let img1 = new Image\(\);\s*img1\.src = "https:\/\/wlar9\.pnqzqsa\.cc\/index\/statistics_common";\s*<\/script>/, '');

//删除首页广告
if (/^https:\/\/18hlw\.com/.test(url)) {
    body = body.replace(
        /<style>/,
        `<style> .gotoclick{ display:none !important } .modal{ display:none !important } .addbox{ display:none !important }`
    );
} 

const blockSelectors = [
  /<blockquote>[\s\S]*?<\/blockquote>/g,  
  /<p>🔥火爆热瓜推荐🔥：<\/p>[\s\S]*?<hr \/>/g,
];

blockSelectors.forEach(selector => {
  body = body.replace(selector, '');
});

$done({ body });





