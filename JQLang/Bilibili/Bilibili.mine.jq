.data |= (
    del(.answer, .live_tip, .vip_section, .vip_section_v2, .modular_vip_section) | 
    .vip_type = 2 | 
    .vip |= if . != null and .status == 0
        then . + { 
            status: 1, 
            type: 2, 
            due_date: 9005270400000, 
            role: 15, 
            vip_type: 2, 
            vip_pay_type: 1, 
            label: {
                bg_color: "#FB7299",
                border_color: "",
                bg_style: 1,
                text: "年度大会员",
                path: "",
                image: "https://i0.hdslb.com/bfs/vip/8d4f8bfc713826a5412a0a27eaaac4d6b9ede1d9.png",
                label_theme: "annual_vip",
                text_color: "#FFFFFF"
            }, 
            nickname_color: "#FB7299" 
        } 
        else . 
    end | 
    if .sections_v2 then .sections_v2 = 
        [
            {
                "items": [
                    {
                        "id": 396,
                        "title": "离线缓存",
                        "uri": "bilibili://user_center/download",
                        "icon": "http://i0.hdslb.com/bfs/archive/5fc84565ab73e716d20cd2f65e0e1de9495d56f8.png",
                        "common_op_item": {}
                    },
                    {
                        "id": 397,
                        "title": "历史记录",
                        "uri": "bilibili://user_center/history",
                        "icon": "http://i0.hdslb.com/bfs/archive/8385323c6acde52e9cd52514ae13c8b9481c1a16.png",
                        "common_op_item": {}
                    },
                    {
                        "id": 3072,
                        "title": "我的收藏",
                        "uri": "bilibili://user_center/favourite?version=2",
                        "icon": "http://i0.hdslb.com/bfs/archive/d79b19d983067a1b91614e830a7100c05204a821.png",
                        "common_op_item": {}
                    },
                    {
                        "id": 2830,
                        "title": "稍后再看",
                        "uri": "bilibili://user_center/watch_later_v2",
                        "icon": "http://i0.hdslb.com/bfs/archive/63bb768caa02a68cb566a838f6f2415f0d1d02d6.png",
                        "need_login": 1,
                        "common_op_item": {}
                    }
                ],
                "style": 1,
                "button": {}
            },
            {
                "title": "推荐服务",
                "items": [
                    {
                        "id": 402,
                        "title": "个性装扮",
                        "uri": "https://www.bilibili.com/h5/mall/home?navhide=1&f_source=shop&from=myservice",
                        "icon": "http://i0.hdslb.com/bfs/archive/0bcad10661b50f583969b5a188c12e5f0731628c.png",
                        "common_op_item": {}
                    },
                    {
                        "id": 622,
                        "title": "会员购",
                        "uri": "bilibili://mall/home",
                        "icon": "http://i0.hdslb.com/bfs/archive/19c794f01def1a267b894be84427d6a8f67081a9.png",
                        "common_op_item": {}
                    },
                    {
                        "id": 404,
                        "title": "我的钱包",
                        "uri": "bilibili://bilipay/mine_wallet",
                        "icon": "http://i0.hdslb.com/bfs/archive/f416634e361824e74a855332b6ff14e2e7c2e082.png",
                        "common_op_item": {}
                    },
                    {
                        "id": 406,
                        "title": "我的直播",
                        "uri": "bilibili://user_center/live_center",
                        "icon": "http://i0.hdslb.com/bfs/archive/1db5791746a0112890b77a0236baf263d71ecb27.png",
                        "common_op_item": {},
                    }
                ],
                "style": 1,
                "button": {}
            },
            {
                "title": "更多服务",
                "items": [
                    {
                        "id": 407,
                        "title": "联系客服",
                        "uri": "bilibili://user_center/feedback",
                        "icon": "http://i0.hdslb.com/bfs/archive/7ca840cf1d887a45ee1ef441ab57845bf26ef5fa.png",
                        "common_op_item": {}
                    },
                    {
                        "id": 410,
                        "title": "设置",
                        "uri": "bilibili://user_center/setting",
                        "icon": "http://i0.hdslb.com/bfs/archive/e932404f2ee62e075a772920019e9fbdb4b5656a.png",
                        "common_op_item": {}
                    }
                ],
                "style": 2,
                "button": {}
            }
        ]
    end | 
    if .ipad_sections then .ipad_sections = 
        [
            {
                "id": 747,
                "title": "离线缓存",
                "uri": "bilibili://user_center/download",
                "icon": "http://i0.hdslb.com/bfs/feed-admin/9bd72251f7366c491cfe78818d453455473a9678.png",
                "mng_resource": { "icon_id": 0, "icon": "" }
            },
            {
                "id": 748,
                "title": "历史记录",
                "uri": "bilibili://user_center/history",
                "icon": "http://i0.hdslb.com/bfs/feed-admin/83862e10685f34e16a10cfe1f89dbd7b2884d272.png",
                "mng_resource": { "icon_id": 0, "icon": "" }
            },
            {
                "id": 749,
                "title": "我的收藏",
                "uri": "bilibili://user_center/favourite",
                "icon": "http://i0.hdslb.com/bfs/feed-admin/6ae7eff6af627590fc4ed80c905e9e0a6f0e8188.png",
                "mng_resource": { "icon_id": 0, "icon": "" }
            },
            {
                "id": 750,
                "title": "稍后再看",
                "uri": "bilibili://user_center/watch_later",
                "icon": "http://i0.hdslb.com/bfs/feed-admin/928ba9f559b02129e51993efc8afe95014edec94.png",
                "mng_resource": { "icon_id": 0, "icon": "" }
            }
        ] 
    end | 
    if .ipad_upper_sections then .ipad_upper_sections = 
        [
            {
                "id": 752,
                "title": "创作首页",
                "uri": "/uper/homevc",
                "icon": "http://i0.hdslb.com/bfs/feed-admin/d20dfed3b403c895506b1c92ecd5874abb700c01.png",
                "mng_resource": { "icon_id": 0, "icon": "" }
            }
        ] 
    end | 
    if .ipad_recommend_sections then .ipad_recommend_sections = 
        [
            {
                "id": 755,
                "title": "我的关注",
                "uri": "bilibili://user_center/myfollows",
                "icon": "http://i0.hdslb.com/bfs/feed-admin/fdd7f676030c6996d36763a078442a210fc5a8c0.png",
                "mng_resource": { "icon_id": 0, "icon": "" }
            },
            {
                "id": 756,
                "title": "我的消息",
                "uri": "bilibili://link/im_home",
                "icon": "http://i0.hdslb.com/bfs/feed-admin/e1471740130a08a48b02a4ab29ed9d5f2281e3bf.png",
                "mng_resource": { "icon_id": 0, "icon": "" }
            }
        ] 
    end | 
    if .ipad_more_sections then .ipad_more_sections = 
        [
            {
                "id": 763,
                "title": "我的客服",
                "uri": "bilibili://user_center/feedback",
                "icon": "http://i0.hdslb.com/bfs/feed-admin/7801a6180fb67cf5f8ee05a66a4668e49fb38788.png",
                "mng_resource": { "icon_id": 0, "icon": "" }
            },
            {
                "id": 764,
                "title": "设置",
                "uri": "bilibili://user_center/setting",
                "icon": "http://i0.hdslb.com/bfs/feed-admin/34e8faea00b3dd78977266b58d77398b0ac9410b.png",
                "mng_resource": { "icon_id": 0, "icon": "" }
            }
        ] 
    end
)