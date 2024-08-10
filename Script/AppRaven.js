/*
AppRaven



[rewrite_local]


https://appraven.net/appraven/graphql url script-response-body https://raw.githubusercontent.com/Yu9191/Rewrite/main/AppRaven.js
[mitm] 

hostname = appraven.net

**/

var body = $response.body;

body = body.replace(/"premium":false/g, '"premium":true');
body = body.replace(/"hasInAppPurchases":false/g,'"hasInAppPurchases":true');
body = body.replace(/"youOwn":false/g,
'"youOwn":true');
body = body.replace(/"arcade":false/g,
'"arcade":true');

body = body.replace(/"preorder":false/g,
'"preorder":true');

$done({ body });