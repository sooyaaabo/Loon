// 2024-10-08 02:15

const url = $request.url;
const header = $request.headers;
const isNetEase = url.includes("/interface") && url.includes(".music.163.com/");

if (isNetEase) {
  if (
    $persistentStore.read("Music163_MConfigInfo") === undefined ||
    $persistentStore.read("Music163_MConfigInfo") === null
  ) {
    $notification.post("网易云音乐遇到问题", "参数缺失", "请在插件内填入会员数据");
    $done({});
  } else {
    header["cookie"] = $persistentStore.read("Music163_Cookie");
    header["mconfig-info"] = $persistentStore.read("Music163_MConfigInfo");
    header["user-agent"] = $persistentStore.read("Music163_UserAgent");
  }

  $done({ headers: header });
} else {
  $done({});
}

/*
var headers = $request.headers;
headers['Cookie'] = 'MUSIC_U=0067A6C11159AC6EE879D910805C643B5ED5EFC7AD046826B5072E8804BB4ACC21E3E2AC50545C39947C0E3442AFB0384EDE090E7E7F3F000F96F55832F4D36C4ACE0D6F1524E97FEF26557A1FCE6C6C5AADC62C1F8C7F829196B919DB6B18D9E0EDF3B87D426FFADA173AD6EACB634E2300AD77492560FBDF2DDCD31ACE54E0C94E110722E5C0A66119F0FC90C0BA5DC1EBD8F2DFC89192D7CE4D07E30FFD572AE55C8410907E9A8297009B18D737DACAD353C25B805501374E150DD13D780AAEC7DA3DFA35C06283BE65F9ED6D2EFFBFFBF1DDD9724C3DDC538CBFC5FB80F34E3A04D3F83EAB0F6DC5B6B363EF1E794A3252460EFF41FC39575322087170734C8B63E9FAD6B0DAE9E18525CE662689A25E9D8E09A386473128824417C75C00C8; NMTID=00Odzss1YRu1E5CBkMwvEzB-78sCncAAAGKIAPAgA; buildver=2308; channel=distribution; EVNSM=1.0.0; appver=8.5.20; deviceId=f586dfd209502d1c9a7972437083605a; os=iPhone OS; osver=15.6.1; machineid=iPhone11.6; NMCID=wcyucf.1692754229000.01.3; appkey=IuRPVVmc3WWul9fT; URS_APPID=4F1DCBEF75BA81D56AE63793ADEB48E005E067679F36FEA4B3E48A8BFEAD5C679CC2821647BBF7FC67D9350F9678A060; NMDI=Q1NKTQcBDACGTvqINPzPpHbfTwhrAAAArGJz0V1Z2fgDnmsYjY3OrmznXaW%2FkVlFbpL%2Fr4ebbyS81V5MgJtt%2FkhcSMy7bc59b7poDzhPTaurBvgeNDAMjFUsVkrMwVg4VE3Mm9A%2FEtpvtho7FLD%2Fkqrnh4FXHHg5UCPwJAmg360F9is%3D';
headers['User-Agent'] = 'NeteaseMusic 8.5.20/2308 (iPhone; iOS 15.6.1; zh-Hans_US)';
headers['MConfig-Info'] = '{"IuRPVVmc3WWul9fT":{"version":22427648,"appver":"8.5.20"},"c0Ve6C0uNl2Am0Rl":{"version":595968,"appver":"1.7.0"},"tPJJnts2H31BZXmp":{"version":2187264,"appver":"2.0.30"}}';
$done({headers:headers});
*/