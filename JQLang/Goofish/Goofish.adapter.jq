# 引用链接: https://kelee.one/Resource/JQLang/FleaMarket/adapter_FleaMarket_remove_ads.jq
# 仅当 item 中存在 tool 字段时，更新其 exContent.tools
# 避免为不存在 tool 的 section 创建空结构
.data.container.sections[] |= (
  if .item.tool then
    .item.tool.exContent.tools = [
      [
        {
          "targetUrl": "https://h5.m.goofish.com/wow/moyu/moyu-project/fish-ad/pages/home?kun=true&fromScene=myPage",
          "exContent": {
            "title": "超级擦亮",
            "icon": "https://gw.alicdn.com/imgextra/i2/O1CN01bVNpPu1eGbSDs0GSR_!!6000000003844-2-tps-84-84.png",
            "toolId": 23
          },
          "clickParam": {
            "args": {
              "toolId": "23"
            },
            "arg1": "Function"
          }
        },
        {
          "targetUrl": "https://h5.m.goofish.com/wow/moyu/moyu-project/moyu-tb-resell/pages/newResell?isNeedRefresh=0&setTab=1",
          "exContent": {
            "title": "淘宝转卖",
            "icon": "https://gw.alicdn.com/imgextra/i2/O1CN01JTbPcx1Qrn3n9w03n_!!6000000002030-2-tps-84-84.png",
            "toolId": 11
          },
          "clickParam": {
            "args": {
              "toolId": "11"
            },
            "arg1": "Function"
          }
        },
        {
          "targetUrl": "https://h5.m.goofish.com/wow/moyu/moyu-project/experience-officer/pages/home?kun=true",
          "exContent": {
            "title": "闲鱼体验官",
            "icon": "https://gw.alicdn.com/imgextra/i1/O1CN016leRFv1N0Fprgaghl_!!6000000001507-2-tps-84-84.png",
            "toolId": 2
          },
          "clickParam": {
            "args": {
              "toolId": "2"
            },
            "arg1": "Function"
          }
        },
        {
          "targetUrl": "https://h5.m.goofish.com/wow/moyu/moyu-project/seafood-qa/pages/my-content?useCusFont=true&loadingVisible=false",
          "exContent": {
            "title": "帖子中心",
            "icon": "https://gw.alicdn.com/imgextra/i1/O1CN01Cge0QO1R2K5RfoaOw_!!6000000002053-2-tps-84-84.png",
            "toolId": 13
          },
          "clickParam": {
            "args": {
              "toolId": "13"
            },
            "arg1": "Function"
          }
        }
      ],
      [
        {
          "targetUrl": "https://h5.m.goofish.com/app/msd/buyer-aqcenter/index.html?source=316#/notice",
          "exContent": {
            "title": "闲鱼公约",
            "icon": "https://img.alicdn.com/imgextra/i4/O1CN01A9ofQ51t1EOZfykDn_!!6000000005841-2-tps-84-84.png",
            "toolId": 20
          },
          "clickParam": {
            "args": {
              "toolId": "20"
            },
            "arg1": "Function"
          }
        },
        {
          "targetUrl": "https://h5.m.goofish.com/wow/moyu/moyu-project/cro-security-center/pages/security-center",
          "exContent": {
            "title": "安全中心",
            "icon": "https://gw.alicdn.com/imgextra/i4/O1CN013kllih1NlQd6e3sRv_!!6000000001610-2-tps-84-84.png",
            "toolId": 1
          },
          "clickParam": {
            "args": {
              "toolId": "1"
            },
            "arg1": "Function"
          }
        }
      ]
    ]
  else
    .
  end
)