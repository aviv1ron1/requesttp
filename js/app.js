'use strict';


var app = angular.module('app', ['ngAnimate', 'ui.bootstrap']);
//, 'ngAnimate', 'ngResource', 'angularFileUpload' ]);

app.filter("truncate", function() {
    return function(text, length) {
        if (text) {
            var ellipsis = text.length > length ? "..." : "";
            return text.slice(0, length) + ellipsis;
        };
        return text;
    }
});

app.filter("j2s", function() {
    return function(obj) {
        if (obj) {
            return JSON.stringify(obj, undefined, 2);
        } else {
            return ""
        }
    }
});

var _AnalyticsCode = 'UA-58058132-1';
var _gaq = _gaq || [];
_gaq.push(['_setAccount', _AnalyticsCode]);
_gaq.push(['_trackPageview']);
(function() {
    var ga = document.createElement('script');
    ga.type = 'text/javascript';
    ga.async = true;
    ga.src = 'https://ssl.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(ga, s);
})();
