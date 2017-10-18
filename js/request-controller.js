'use strict';

var protocolRegex = /\w+:\/\//;


app.controller('requestController', function($scope, $http, $q, contentTypeService, headerService, responseService) {

    $scope.methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];
    $scope.styles = [true, false, false, false, false, false];
    $scope.selectedIndex = 0;
    $scope.popup = false;
    $scope.favpopup = false;
    $scope.contentTypeService = contentTypeService;
    $scope.headers = "";
    $scope.headerService = headerService;
    $scope.url;
    $scope.data;
    $scope.oldData;
    $scope.response = responseService;
    $scope.isFavorite = false;
    $scope.favoriteUrls = [];
    $scope.dontSubmit = false;
    $scope.focusOnHeaders = false;
    $scope.focusOnUrl = false;
    $scope.focusOnData = false;
    $scope.savedHeaders = null;
    $scope.savedHeaderPopup = false;
    $scope.saveHeaderPopup = false;
    $scope.errorInHeaders = "";
    $scope.urlencodeKey = "";
    $scope.urlencodeValue = "";
    $scope.jsonencodedData = {};
    $scope.jsonencodeKey = "";
    $scope.jsonencodeValue = "";
    $scope.jsonObjectStack = [];
    $scope.jsonCurrentObj = undefined;
    $scope.focusOnUrlEncodedKey = false;
    $scope.urlEncodedPairs = [];
    $scope.urlencodePopupForUrl = false;
    $scope.history = [];

    $scope.responseCallback = function(data, status, headers, config) {
        try {
            $scope.response.setData(data, headers());
            $scope.response.setHeaders(headers());
            $scope.response.setStatus(status);
        } catch (err) {
            $scope.response.gotError(err);
        }
    }

    $scope.parseHeaders = function(callback) {
        var splitHeaders = $scope.headers.split("\n");
        var hdrs = {};
        for (var i = 0; i < splitHeaders.length; i++) {
            if (splitHeaders[i] != "") {
                var splitCtype = splitHeaders[i].split(":");
                if (splitCtype.length != 2) {
                    callback("invalid content type on line " + (i + 1), null);
                    return;
                }
                hdrs[splitCtype[0]] = splitCtype[1];
            }
        }
        callback(null, hdrs);
    }

    $scope.addToHistory = function(url) {
        for (var i = 0; i < $scope.history.length; i++) {
            if (url == $scope.history[i]) {
                $scope.history = $scope.history.splice(i, 1);
                continue;
            }
        }
        $scope.history.push(url);
        if ($scope.history.length > 50) {
            $scope.history.shift();
        }
        $scope.saveHistory(function() {});
    }

    $scope.submit = function() {
        if ($scope.dontSubmit) {
            $scope.dontSubmit = false;
            return;
        }
        $scope.errorInHeaders = null;
        $scope.response.inprog = true;
        $scope.parseHeaders(function(err, hdrs) {
            if (err) {
                $scope.response.inprog = false;
                $scope.errorInHeaders = err;
                console.log(err);
            } else {
                $scope.addToHistory($scope.url);

                $scope.response.canceller = $q.defer();
                try {
                    $http({
                            method: $scope.methods[$scope.selectedIndex],
                            url: $scope.url,
                            headers: hdrs,
                            data: $scope.data,
                            cache: false,
                            timeout: $scope.response.canceller.promise
                        })
                        .success($scope.responseCallback)
                        .error($scope.responseCallback);

                    // var client = new XMLHttpRequest();
                    // client.onreadystatechange = $scope.responseCallback;
                    // client.open($scope.methods[$scope.selectedIndex], $scope.url);
                    // client.send();

                } catch (err) {
                    $scope.response.gotError(err);
                }
            }
        });
    };

    $scope.select = function(index) {
        $scope.dontSubmit = true;
        $scope.styles[$scope.selectedIndex] = false;
        $scope.selectedIndex = index;
        $scope.styles[$scope.selectedIndex] = true;
        // if (index < 1 || index > 2) {
        //     if ($scope.data != null) {
        //         $scope.oldData = $scope.data;
        //     }
        //     $scope.data = null;
        // } else {
        //     if ($scope.data == null) {
        //         $scope.data = $scope.oldData;
        //     }
        // }
    }

    $scope.insertMacro = function() {
        $scope.popup = true;
    }

    $scope.addContentType = function(ct) {
        var arr = $scope.headers.split("\n");
        $scope.headers = "";
        var alreadyThere = false;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] != "") {
                if (arr[i].indexOf("Content-Type") == 0) {
                    arr[i] = "Content-Type: " + ct.value;
                    alreadyThere = true;
                }
                $scope.headers += arr[i] + "\n";
            }
        }
        if (!alreadyThere) {
            $scope.headers += "Content-Type: " + ct.value;
        }
        $scope.popup = false;
    }

    $scope.setHeader = function(header) {
        var arr = $scope.headers.split("\n");
        $scope.headers = "";
        var alreadyThere = false;
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] != "") {
                if (arr[i].indexOf(header) == 0) {
                    alreadyThere = true;
                }
                $scope.headers += arr[i] + "\n";
            }
        }
        if (!alreadyThere) {
            $scope.headers += header + " ";
        }
        $scope.popup = false;
        $scope.focusOnHeaders = true;
    }

    $scope.storageSet = function(data, errMsg, callback) {
        chrome.storage.sync.set(data, function() {
            if (chrome.runtime.lastError) {
                alert(errMsg);
            } else {
                if (callback) {
                    $scope.$apply(callback);
                }
            }
        });
    }

    $scope.storageGet = function(query, callback) {
        chrome.storage.sync.get(query, function(items) {
            if (chrome.runtime.lastError) {
                callback(chrome.runtime.lastError, null);
            } else {
                $scope.$apply(function() {
                    callback(null, items);
                });
            }
        });
    }



    $scope.loadSavedHeaders = function(callback) {
        $scope.storageGet('savedHeaders', function(err, data) {
            if (err) {
                alert("there was an error loading saved headers");
            } else {
                if (data && data.savedHeaders) {
                    $scope.savedHeaders = data.savedHeaders;
                } else {
                    $scope.savedHeaders = [];
                }
                callback();
            }
        });
    }

    $scope.removeHeader = function(index) {
        $scope.savedHeaders.splice(index, 1);
        $scope.saveHeaders(function() {});
    }

    $scope.saveHeaders = function(callback) {
        $scope.storageSet({
            'savedHeaders': $scope.savedHeaders
        }, "there was an error saving your headers", callback);
    }

    $scope.makeSureHeadersAreLoadedFirst = function(callback) {
        if ($scope.savedHeaders == null) {
            $scope.loadSavedHeaders(callback);
        } else {
            callback();
        }

    }

    $scope.addToSavedHeaders = function() {
        $scope.makeSureHeadersAreLoadedFirst(function() {
            $scope.savedHeaders.push({
                'name': $scope.savedHeaderName,
                'value': $scope.headers
            }); //$scope.headers);
            $scope.saveHeaders(function() {
                $scope.saveHeaderPopup = false;
            });
        });
    }

    $scope.loadHeader = function() {
        $scope.loadSavedHeaders(function() {
            $scope.savedHeaderPopup = true;
        });
    }

    $scope.loadSelectedHeader = function(index) {
        $scope.headers = $scope.savedHeaders[index].value;
        $scope.savedHeaderPopup = false;
        $scope.focusOnHeaders = true;
    }

    $scope.loadHistory = function(callback) {
        $scope.storageGet('history', function(err, data) {
            if (err) {
                console.error("there was an error loading history");
            } else {
                if (data.history) {
                    $scope.history = data.history;
                }
                callback();
            }
        });
    }

    $scope.saveHistory = function(callback) {
        $scope.storageSet({
            'history': $scope.history
        }, "there was an error saving your history", callback);
    }

    $scope.loadFavorites = function(callback) {
        $scope.storageGet('favoriteUrls', function(err, data) {
            if (err) {
                console.error("there was an error loading favorites");
            } else {
                if (data.favoriteUrls) {
                    $scope.favoriteUrls = data.favoriteUrls;
                }
                callback();
            }
        });
    }

    $scope.saveFavorites = function(callback) {
        $scope.storageSet({
            'favoriteUrls': $scope.favoriteUrls
        }, "there was an error saving your favorites", callback);
    }

    $scope.openFavorites = function() {
        $scope.loadFavorites(function() {
            $scope.favpopup = true;
        });
    }

    $scope.chooseFavorite = function(index) {
        $scope.favpopup = false;
        $scope.url = $scope.favoriteUrls[index];
        $scope.focusOnUrl = true;
    }

    $scope.addToFavorites = function() {
        var index = $.inArray($scope.url, $scope.favoriteUrls);
        if (index < 0) {
            $scope.favoriteUrls.push($scope.url);
            $scope.saveFavorites(function() {
                $scope.isFavorite = true;
            });
        } else {
            $scope.removeFavorite(index);
        }
    }

    $scope.removeFavorite = function(index) {
        $scope.favoriteUrls.splice(index, 1);
        $scope.saveFavorites(function() {
            $scope.isFavorite = false;
        });
    }

    $scope.insertProtocol = function(protocol) {
        var u = "";
        var m;
        if ($scope.url) {
            u = $scope.url;
            if ((m = protocolRegex.exec(u)) != null) {
                u = u.replace(m[0], "");
            }
        }
        $scope.url = protocol + "://" + u;
        $scope.focusOnUrl = true;
    }

    $scope.$watch('url', function(nv, ov) {
        if ($.inArray($scope.url, $scope.favoriteUrls) < 0) {
            $scope.isFavorite = false;
        } else {
            $scope.isFavorite = true;
        }
    });

    $scope.urlEncode = function(text) {
        return encodeURIComponent(text).replace(/'/g, "%27").replace(/"/g, "%22");
    }

    $scope.urlDecode = function(text) {
        return decodeURIComponent(text).replace("%27", "'").replace("%22", '"');
    }

    $scope.acceptUrlEncoded = function() {
        $scope.data = $scope.urlencodedData;
        $scope.urlencodePopup = false;
    }

    $scope.renderUrlEncoded = function() {
        $scope.urlencodedData = "";
        if ($scope.urlEncodedPairs.length > 0) {
            var len = $scope.urlEncodedPairs.length;
            for (var i = 0; i < len - 1; i++) {
                $scope.urlencodedData += $scope.urlEncode($scope.urlEncodedPairs[i].key) + "=" + $scope.urlEncode($scope.urlEncodedPairs[i].value) + "&";
            }
            $scope.urlencodedData += $scope.urlEncode($scope.urlEncodedPairs[len - 1].key) + "=" + $scope.urlEncode($scope.urlEncodedPairs[len - 1].value);
        }
    }

    $scope.addToUrlencoded = function() {
        $scope.urlEncodedPairs.push({
            key: $scope.urlencodeKey,
            value: $scope.urlencodeValue
        });

        $scope.renderUrlEncoded();
        $scope.urlencodeKey = "";
        $scope.urlencodeValue = "";
        $scope.focusOnUrlEncodedKey = true;
    }

    $scope.deleteUrlEncodedPair = function(index) {
        $scope.urlEncodedPairs.splice(index, 1);
        $scope.renderUrlEncoded();
    }

    $scope.clearUrlEncoded = function() {
        $scope.urlencodedData = '';
        $scope.urlencodeKey = '';
        $scope.urlencodeValue = '';
        $scope.urlEncodedPairs = [];
    }

    $scope.openUrlEncoder = function() {
        $scope.urlEncodedPairs = [];
        try {
            var pairs = $scope.data.split("&");
            for (var i = 0; i < pairs.length; i++) {
                var kvp = pairs[i].split("=");
                $scope.urlEncodedPairs.push({
                    key: $scope.urlDecode(kvp[0]),
                    value: $scope.urlDecode(kvp[1])
                });
            }
        } catch (err) {
            $scope.urlEncodedPairs = [];
        }
        $scope.renderUrlEncoded();
        $scope.urlencodePopup = true;
    }

    $scope.openUrlEncode = function() {
        $scope.urlencodePopupForUrl = true;
    }

    $scope.encodeAndAddToUrl = function() {
        $scope.url += $scope.urlEncode($scope.stringToEncode);
        $scope.stringToEncode = "";
    }

    $scope.openJsonEncoder = function() {
        $scope.jsonencodePopup = true;
        try {
            $scope.jsonencodedData = JSON.parse($scope.data);
            $scope.jsonCurrentObj = $scope.jsonencodedData;
        } catch (err) {
            $scope.jsonencodedData = undefined;
            $scope.jsonCurrentObj = undefined;
        }
    }


    $scope.clearJsonData = function() {
        $scope.jsonencodeKey = "";
        $scope.jsonencodeValue = "";
        $scope.jsonencodedData = undefined;
        $scope.jsonObjectStack = [];
        $scope.jsonCurrentObj = undefined;
    }

    $scope.acceptJsonEncoded = function() {
        $scope.data = JSON.stringify($scope.jsonencodedData, undefined, 2);
        $scope.jsonencodePopup = false;
    }

    $scope.addToJsonencoded = function() {
        if (!$scope.jsonencodedData) {
            $scope.jsonencodedData = {};
            $scope.jsonCurrentObj = $scope.jsonencodedData;
        }
        if ($scope.jsonCurrentObj instanceof Array) {
            $scope.jsonCurrentObj.push($scope.jsonencodeValue);
        } else {
            $scope.jsonCurrentObj[$scope.jsonencodeKey] = $scope.jsonencodeValue;
        }
        $scope.jsonencodeKey = "";
        $scope.jsonencodeValue = "";
    }

    $scope.jsonNewObject = function() {
        if (!$scope.jsonencodedData) {
            $scope.jsonencodedData = {};
            $scope.jsonCurrentObj = $scope.jsonencodedData;
        }
        $scope.jsonObjectStack.push($scope.jsonCurrentObj);
        var newObj = {};
        if ($scope.jsonCurrentObj instanceof Array) {
            $scope.jsonCurrentObj.push(newObj);
        } else {
            $scope.jsonCurrentObj[$scope.jsonencodeKey] = newObj;
        }
        $scope.jsonCurrentObj = newObj;
        $scope.jsonencodeKey = "";
        $scope.jsonencodeValue = "";
    }

    $scope.jsonCloseObject = function() {
        if ($scope.jsonObjectStack.length > 0) {
            $scope.jsonCurrentObj = $scope.jsonObjectStack.pop();
        } else {
            $scope.jsonCurrentObj = $scope.jsonencodedData;
        }
    }

    $scope.jsonNewArray = function() {
        if (!$scope.jsonencodedData) {
            $scope.jsonencodedData = [];
            $scope.jsonCurrentObj = $scope.jsonencodedData;
        } else {
            $scope.jsonObjectStack.push($scope.jsonCurrentObj);
            var newObj = [];
            if ($scope.jsonCurrentObj instanceof Array) {
                $scope.jsonCurrentObj.push(newObj);
            } else {
                $scope.jsonCurrentObj[$scope.jsonencodeKey] = newObj;
            }
            $scope.jsonCurrentObj = newObj;
        }
        $scope.jsonencodeKey = "";
        $scope.jsonencodeValue = "";
    }

    $scope.jsonCloseArray = function() {
        if ($scope.jsonObjectStack.length > 0) {
            $scope.jsonCurrentObj = $scope.jsonObjectStack.pop();
        } else {
            $scope.jsonCurrentObj = $scope.jsonencodedData;
        }
    }

    $scope.loadFavorites(function() {});
    $scope.loadHistory(function() {});
});
