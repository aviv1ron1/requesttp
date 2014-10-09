'use strict';


var app = angular.module('app', ['ngAnimate']);
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
