'use strict';

app.controller('responseController', function($scope, responseService) {
    $scope.response = responseService;
    $scope.dataPopup = false;
    $scope.formats = ["html", "json", "css", "xml", "plain"];

    $scope.formatAs = function(format) {
        $scope.response.formatAs($scope.formats[format]);
    }

    $scope.cancelRequest = function() {
        console.log("canceling");
        $scope.response.canceller.resolve();
    }
});
