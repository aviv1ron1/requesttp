'use strict';

app.directive('copy', function() {
	return {
		restrict: 'A',
		link: function(scope, elem, attrs) {
			 scope.$watch('copy', function(v) {
            	elem.select();
            	document.execCommand('copy');
            	window.getSelection().removeAllRanges();
          });
		}
	}
});

app.controller('encodersController', function($scope) {

    $scope.encoderPopup = false;
    $scope.encoderType = 1;
    $scope.from = "";
    $scope.to = "";
    $scope.names = ["Base64", "URL"];
    $scope.copy = "";

    $scope.encode;
    $scope.decode;

    $scope.copyAndClose = function() {
    	$scope.copy = $scope.to;
    	$scope.encoderPopup = false;
    }

    $scope.encoder = function(encType) {
    	$scope.encoderType = encType;
    	$scope.from = "";
    	$scope.to = "";
    	$scope.encoderPopup = true;
    	switch($scope.encoderType) {
    		case 0:
    			$scope.encode = function() { $scope.to = btoa($scope.from); }
    			$scope.decode = function() { $scope.to = atob($scope.from); }
    			break;
			case 1:
    			$scope.encode = function() { $scope.to = encodeURIComponent($scope.from).replace(/'/g, "%27").replace(/"/g, "%22"); }
    			$scope.decode = function() { $scope.to = decodeURIComponent($scope.from).replace("%27", "'").replace("%22", '"'); }
    			break;
    	}
    }

});

  