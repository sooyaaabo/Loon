// https://raw.githubusercontent.com/shuijiao1/Fly/main/server-info.js

/* 测试 api
 * 地理位置查询
 * 感谢并修改自https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/geo_location.js
 * 脚本功能：检查节点的地理位置
 * 原作者：XIAO_KOP
*/

let base_url = "https://scamalytics.com/ip/";

// 使用新的IP地理信息API
var url = "http://ip-api.com/json/";
var inputParams = $environment.params;
var nodeName = inputParams.node;

var requestParams = {
    "url": url,
    "node": nodeName
};

var message = "";
const paras = ["query", "as", "org", "isp", "countryCode", "city", "lon", "lat"];
const paran = ["远端IP地址", "远端IP ASN", "ASN所属机构", "远端ISP", "远端IP地区", "远端IP城市", "远端经度", "远端纬度"];

$httpClient.get(requestParams, (error, response, data) => {
    if (error) {
        message = "</br></br>🔴 查询超时";
        message = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: bold;">` + message + `</p>`;
        $done({"title": "  地理位置查询", "htmlMessage": message});
    } else {
        console.log(data);
        message = data ? json2info(data, paras) : "";
        let ip = JSON.parse(data)["query"];
        var scamRequestParams = {
            "url": base_url + ip,
            "node": nodeName
        };
        $httpClient.get(scamRequestParams, (error, response, scamData) => {
            if (error) {
                message = "</br></br>🔴 查询超时";
                message = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: bold;">` + message + `</p>`;
                $done({"title": "  地理位置查询", "htmlMessage": message});
            } else {
                message = message + Display(scamData);
                console.log("url: " + base_url + ip + "\n\n" + message);
                message = message + "------------------------------" + "</br>" + "<font color=#6959CD>" + "<b>节点</b> ➟ " + $environment.params.node + "</font>";
                message = `<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + message + `</p>`;
                $done({"title": "  地理位置查询", "htmlMessage": message});
            }
        });
    }
});

function json2info(cnt, paras) {
    var res = "-------------------------------";
    cnt = JSON.parse(cnt);
    console.log(cnt);
    for (var i = 0; i < paras.length; i++) {
        cnt[paras[i]] = paras[i] == "countryCode" ? cnt[paras[i]] + " ⟦" + flags.get(cnt[paras[i]].toUpperCase()) + "⟧" : cnt[paras[i]];
        res = cnt[paras[i]] ? res + "</br><b>" + "<font color=>" + paran[i] + "</font> : " + "</b>" + "<font color=>" + cnt[paras[i]] + "</font></br>" : res;
    }
    return res;
}

function Display(cnt) {
    let score = cnt.indexOf(`"score":`) != -1 ? cnt.split(`"score":`)[1].split("\n")[0] : "NA";
    score = "</br><b>" + "<font color=>" + "欺诈指数 " + "</font> : " + "</b>" + "<font color=>" + score.replace(/"|,/g, "") + "</font></br>";
    let risk = cnt.indexOf(`"risk":`) != -1 ? cnt.split(`"risk":`)[1].split("\n")[0] : "NA";
    risk = "</br><b>" + "<font color=>" + "风险等级 " + "</font> : " + "</b>" + "<font color=>" + E2C(risk.replace(/"|,/g, "")) + "</font></br>";
    return (score + risk);
}

// 极高风险🔴、高风险🟠 、 中风险🟡、 低风险🟢、未知风险 ⚪
function E2C(cnt) {
    var res = "NA";
    if (cnt.indexOf("very high") != -1) {
        res = "极高风险 🔴";
    } else if (cnt.indexOf("high") != -1) {
        res = "高风险 🟠";
    } else if (cnt.indexOf("medium") != -1) {
        res = "中风险 🟡";
    } else if (cnt.indexOf("low") != -1) {
        res = "低风险 🟢";
    } else {
        res = "未知风险 ⚪";
    }
    return res;
}

var flags = new Map([[ "AC" , "🇦🇨" ] ,["AE","🇦🇪"], [ "AF" , "🇦🇫" ] , [ "AI" , "🇦🇮" ] , [ "AL" , "🇦🇱" ] , [ "AM" , "🇦🇲" ] , [ "AQ" , "🇦🇶" ] , [ "AR" , "🇦🇷" ] , [ "AS" , "🇦🇸" ] , [ "AT" , "🇦🇹" ] , [ "AU" , "🇦🇺" ] , [ "AW" , "🇦🇼" ] , [ "AX" , "🇦🇽" ] , [ "AZ" , "🇦🇿" ] , ["BA", "🇧🇦"], [ "BB" , "🇧🇧" ] , [ "BD" , "🇧🇩" ] , [ "BE" , "🇧🇪" ] , [ "BF" , "🇧🇫" ] , [ "BG" , "🇧🇬" ] , [ "BH" , "🇧🇭" ] , [ "BI" , "🇧🇮" ] , [ "BJ" , "🇧🇯" ] , [ "BM" , "🇧🇲" ] , [ "BN" , "🇧🇳" ] , [ "BO" , "🇧🇴" ] , [ "BR" , "🇧🇷" ] , [ "BS" , "🇧🇸" ] , [ "BT" , "🇧🇹" ] , [ "BV" , "🇧🇻" ] , [ "BW" , "🇧🇼" ] , [ "BY" , "🇧🇾" ] , [ "BZ" , "🇧🇿" ] , [ "CA" , "🇨🇦" ] , [ "CF" , "🇨🇫" ] , [ "CH" , "🇨🇭" ] , [ "CK" , "🇨🇰" ] , [ "CL" , "🇨🇱" ] , [ "CM" , "🇨🇲" ] , [ "CN" , "🇨🇳" ] , [ "CO" , "🇨🇴" ] , [ "CP" , "🇨🇵" ] , [ "CR" , "🇨🇷" ] , [ "CU" , "🇨🇺" ] , [ "CV" , "🇨🇻" ] , [ "CW" , "🇨🇼" ] , [ "CX" , "🇨🇽" ] , [ "CY" , "🇨🇾" ] , [ "CZ" , "🇨🇿" ] , [ "DE" , "🇩🇪" ] , [ "DG" , "🇩🇬" ] , [ "DJ" , "🇩🇯" ] , [ "DK" , "🇩🇰" ] , [ "DM" , "🇩🇲" ] , [ "DO" , "🇩🇴" ] , [ "DZ" , "🇩🇿" ] , [ "EA" , "🇪🇦" ] , [ "EC" , "🇪🇨" ] , [ "EE" , "🇪🇪" ] , [ "EG" , "🇪🇬" ] , [ "EH" , "🇪🇭" ] , [ "ER" , "🇪🇷" ] , [ "ES" , "🇪🇸" ] , [ "ET" , "🇪🇹" ] , [ "EU" , "🇪🇺" ] , [ "FI" , "🇫🇮" ] , [ "FJ" , "🇫🇯" ] , [ "FK" , "🇫🇰" ] , [ "FM" , "🇫🇲" ] , [ "FO" , "🇫🇴" ] , [ "FR" , "🇫🇷" ] , [ "GA" , "🇬🇦" ] , [ "GB" , "🇬🇧" ] , [ "HK" , "🇭🇰" ] ,["HU","🇭🇺"], [ "ID" , "🇮🇩" ] , [ "IE" , "🇮🇪" ] , [ "IL" , "🇮🇱" ] , [ "IM" , "🇮🇲" ] , [ "IN" , "🇮🇳" ] , [ "IS" , "🇮🇸" ] , [ "IT" , "🇮🇹" ] , [ "JP" , "🇯🇵" ] , [ "KR" , "🇰🇷" ] , [ "LU" , "🇱🇺" ] , [ "MO" , "🇲🇴" ] , [ "MX" , "🇲🇽" ] , [ "MY" , "🇲🇾" ] , [ "NL" , "🇳🇱" ] , [ "PH" , "🇵🇭" ] , [ "RO" , "🇷🇴" ] , [ "RS" , "🇷🇸" ] , [ "RU" , "🇷🇺" ] , [ "RW" , "🇷🇼" ] , [ "SA" , "🇸🇦" ] , [ "SB" , "🇸🇧" ] , [ "SC" , "🇸🇨" ] , [ "SD" , "🇸🇩" ] , [ "SE" , "🇸🇪" ] , [ "SG" , "🇸🇬" ] , [ "TH" , "🇹🇭" ] , [ "TN" , "🇹🇳" ] , [ "TO" , "🇹🇴" ] , [ "TR" , "🇹🇷" ] , [ "TV" , "🇹🇻" ] , [ "TW" , "🇨🇳" ] , [ "UK" , "🇬🇧" ] , [ "UM" , "🇺🇲" ] , [ "US" , "🇺🇸" ] , [ "UY" , "🇺🇾" ] , [ "UZ" , "🇺🇿" ] , [ "VA" , "🇻🇦" ] , [ "VE" , "🇻🇪" ] , [ "VG" , "🇻🇬" ] , [ "VI" , "🇻🇮" ] , [ "VN" , "🇻🇳" ] , [ "ZA" , "🇿🇦"]])