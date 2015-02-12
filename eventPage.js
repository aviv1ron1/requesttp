 var extension_url = 'chrome-extension://' + location.host + '/main.html';

 function isOptionsUrl(url) {
         if (url == extension_url) {
             return true;
         }
         return false;
     }
     // Find options page in all opened tabs
 function goToOptions() {
         chrome.tabs.create({
             url: extension_url
         });


         // chrome.tabs.getAllInWindow(undefined, function(tabs) {
         //     for (var i = 0, tab; tab = tabs[i]; i++) {
         //         if (tab.url && isOptionsUrl(tab.url)) {
         //             chrome.tabs.update(tab.id, {
         //                 selected: true
         //             });
         //             return;
         //         }
         //     }
         //     chrome.tabs.create({
         //         url: extension_url
         //     });
         // });
     }
     // Called when the user clicks on the browser action.
 chrome.browserAction.onClicked.addListener(function(tab) {
     goToOptions();
 });

 chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
     console.log("on before request");
     console.log(JSON.stringify(details));
     var headers = details.requestHeaders,
         blockingResponse = {};

     // Each header parameter is stored in an array. Since Chrome
     // makes no guarantee about the contents/order of this array,
     // you'll have to iterate through it to find for the
     // 'User-Agent' element
     for (var i = 0, l = headers.length; i < l; ++i) {
         if (headers[i].name == 'User-Agent') {
             headers[i].value = '>>> Your new user agent string here <<<';
             console.log(headers[i].value);
             break;
         }
         // If you want to modify other headers, this is the place to
         // do it. Either remove the 'break;' statement and add in more
         // conditionals or use a 'switch' statement on 'headers[i].name'
     }

     blockingResponse.requestHeaders = headers;
     return blockingResponse;
 }, {
     urls: ["<all_urls>"]
 }, ['requestHeaders', 'blocking']);

 // chrome.webRequest.onBeforeRequest.addListener(
 //     function(details) {
 //         console.log("on before request", details);
 //         return {

 //         };
 //     }, {
 //         urls: ["*"]
 //     }, ["blocking"]);

 // chrome.webRequest.onBeforeSendHeaders.addListener(
 //     function(details) {
 //         console.log("request headers:");
 //         for (var i = 0; i < details.requestHeaders.length; ++i) {
 //             console.log(details.requestHeaders[i]);
 //             // if (details.requestHeaders[i].name === 'User-Agent') {
 //             //     details.requestHeaders.splice(i, 1);
 //             //     break;
 //             // }
 //         }
 //         return {
 //             requestHeaders: details.requestHeaders
 //         };
 //     }, {
 //         urls: ["<all_urls>"]
 //     }, ["blocking", "requestHeaders"]);
