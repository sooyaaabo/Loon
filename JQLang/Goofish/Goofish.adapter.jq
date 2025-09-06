# 重建 data.container.sections[*].item.tool.exContent.tools 数组
.data.container.sections |= map(
  if .index == "5" then 
    .item.tool.exContent.tools = [
      [
        {
          "targetUrl": "https://h5.m.goofish.com/wow/moyu/moyu-project/act-react/pages/e4mbwSjGRWxw",
          "exContent": {
            "title": "简历认证",
            "icon": "https://img.alicdn.com/imgextra/i4/O1CN01eiWw4r1GJlOaTIEfx_!!6000000000602-2-tps-84-84.png",
            "toolId": 26
          },
          "clickParam": {
            "args": {
              "toolId": "26"
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
          "targetUrl": "https://h5.m.goofish.com/wow/moyu/moyu-project/planting-notes/pages/publishCenter",
          "exContent": {
            "title": "宝贝上首页",
            "icon": "https://gw.alicdn.com/imgextra/i3/O1CN01BOqDXJ1RA6uBkvYQW_!!6000000002070-2-tps-84-84.png",
            "toolId": 34
          },
          "clickParam": {
            "args": {
              "toolId": "34"
            },
            "arg1": "Function"
          }
        },
        {
          "targetUrl": "https://h5.m.goofish.com/cea/idleFish-F2e/creator-pha/mypost?loadingVisible=false",
          "exContent": {
            "title": "我的帖子",
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