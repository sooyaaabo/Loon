// https://klraw.pages.dev/kelv1n1n/script/refs/heads/main/js/soul.js?token=209863
//  2025-04-04
//  树先生
//  当前文件内容仅供个人学习和研究使用，若使用过程中发生任何问题概不负责

let url = $request.url;
let body = $response.body;
let obj = JSON.parse(body);

//console.log(resultArray);

if (url.indexOf("/chat/limitInfo") != -1) {
    delete obj.data.subMsg;
    delete obj.data.extMsg;
    delete obj.data.abValue;
    delete obj.data.freeEquityStatus;
    delete obj.data.msg;
    delete obj.data.remainFreeCount;
    delete obj.data.type;
    obj.data.limit = false;
} else if (url.indexOf("/planet/config") != -1){
    let soulMatch = $argument.soulMatch;
    let voiceMatch = $argument.voiceMatch;
    let partyMatch = $argument.partyMatch;
    let masked = $argument.masked;
    let maskedMatch = $argument.maskedMatch;
    let planet = $argument.planet;

    const sortIdMap = {
        soulMatch: 1,
        voiceMatch: 2,
        partyMatch: 3,
        masked: 4,
        maskedMatch: 9,
        planet: 10
    };

    let resultArray = [];
    if (soulMatch) {
        resultArray.push(sortIdMap.soulMatch);
    }
    if (voiceMatch) {
        resultArray.push(sortIdMap.voiceMatch);
    }
    if (partyMatch) {
        resultArray.push(sortIdMap.partyMatch);
    }
    if (masked) {
        resultArray.push(sortIdMap.masked);
    }
    if (maskedMatch) {
        resultArray.push(sortIdMap.maskedMatch);
    }
    if (planet) {
        resultArray.push(sortIdMap.planet);
    }
    
    obj.data.showRedMind = false;
    obj.data.chatRoomInfo.showChatRoom = false;
    obj.data.gameInfo.showGameCard = false;
    // 星球按钮入口
    //const buttonArr = [1, 3];
    //obj.data.coreCards = obj.data.coreCards.filter(card => buttonArr.includes(card.sortId));
    obj.data.coreCards = obj.data.coreCards.filter(card => resultArray.includes(card.sortId));
    obj.data.gameInfo.gameCards = [];
    obj.data.coreCards.forEach(card => {
        if (card.hasOwnProperty('showLuckyBag') && card.showLuckyBag === true) {
          card.showLuckyBag = false;
        }
        card.showLuckyBag = false;
        card.showRedMind = false;
        card.style = 1;
        delete card.bgImg;
        delete card.iconUrl;
    });

    obj.data.showLuckyBag = false;
    //  屏蔽优惠卡的图片，但是入口还在
    //delete obj.data.luckyBagEntranceImg;

} else if (url.indexOf("/chatroom/chatClassifyRoomList") != -1) {
    // 派对中间广告横幅
    obj.data.positionContentRespList = [];
    //console.log(JSON.stringify(obj.data.positionContentRespList));
    // 过滤掉派对人数大于2的
    //obj.data.roomList = obj.data.roomList.filter(i => i.roomerNum < 2);
} else if (url.indexOf("/square/header/tabs") != -1) {
    obj.data.forEach(card => {
        card.unreadFlag = 0;
    });
    // 保留tab
    obj.data = obj.data.filter(item => item.pageId === "PostSquare_Recommend");
    //obj.data = [];
} else if (url.indexOf("/homepage/metrics") != -1) {
    obj.data.recentViewNum = 0;
    obj.data.showTipsCard = false;
    obj.data.showMetric = false;
    obj.data.hasHomePageLiked = false;
    if (obj && obj.data && obj.data.homePageLikedMetric){
      obj.data.homePageLikedMetric.addNum = 0;
      obj.data.homePageLikedMetric.likedTotalNum = 0;
      obj.data.homePageLikedMetric.hasShowHistoryDynamic = false;
    }
    //obj.data.homePageLikedMetric.likedTotalNum = 0;
    //obj.data.homePageLikedMetric.hasShowHistoryDynamic = false;
} else if (url.indexOf("relation/guideUserList") != -1) {
    obj.data.userDTOList = [];
} else if (url.indexOf("/homepage/tabs/v2") != -1) {
    obj.data.selectedTagPool = {};
    const tab = ["STAR_TRAILS"];
    obj.data.headTabDTOList = obj.data.headTabDTOList.filter(t => !tab.includes(t.tabCode));
} else if (url.indexOf("/chatroom/getRoomTagInfo") != -1) {
    let hot = $argument.hot;
    let all = $argument.all;
    let emotion = $argument.emotion;
    let personal = $argument.personal;
    let play = $argument.play;
    let interest = $argument.interest;
    let argue = $argument.argue;
    let story = $argument.story;
    let chat = $argument.chat;
    let heart = $argument.heart;

    // 每个变量对应的 id
    const idMap = {
        hot: 11,
        all: 0,
        emotion: 43,
        personal: 44,
        play: 12,
        interest: 10,
        argue: 6,
        story: 5,
        chat: 4,
        heart: 2
    };

    // 创建一个空数组用于存储符合条件的 id
    let resultArray = [];

    // 检查每个变量，如果为 true 则将对应的 id 添加到结果数组中
    if (hot) {
        resultArray.push(idMap.hot);
    }
    if (all) {
        resultArray.push(idMap.all);
    }
    if (emotion) {
        resultArray.push(idMap.emotion);
    }
    if (personal) {
        resultArray.push(idMap.personal);
    }
    if (play) {
        resultArray.push(idMap.play);
    }
    if (interest) {
        resultArray.push(idMap.interest);
    }
    if (argue) {
        resultArray.push(idMap.argue);
    }
    if (story) {
        resultArray.push(idMap.story);
    }
    if (chat) {
        resultArray.push(idMap.chat);
    }
    if (heart) {
        resultArray.push(idMap.heart);
    }
    obj.data.res = obj.data.res.filter(t => resultArray.includes(t.id));
    obj.data.res.forEach(card => {
        if (card.iconConfig != null) {
            card.iconConfig = null;
        }
    });
} else if (url.indexOf("/snapchat/url") != -1) {
    try {
        console.log("响应原文obj：" + obj);
        let imageUrl = obj.data.url;
        console.log("响应原文data：" + imageUrl);
        if (imageUrl && typeof imageUrl === 'string') {
            console.log("图片地址: " + imageUrl);
            //$notify("图片预览", "点击跳转浏览器", imageUrl, {
            //    "media-url": imageUrl,
            //    "open-url": imageUrl
            //});

            var attach = {  
                "openUrl":imageUrl,
                "mediaUrl":imageUrl
                //"clipboard":"图片通知已接收"
            };
            // 调用$notification.post方法发送通知
            $notification.post("图片通知", "查看图片", "点击查看详情", attach);
        }
        
    } catch (e) {
        console.log("处理图片预览出错：" + e);
    }

}


body = JSON.stringify(obj);
$done({body});