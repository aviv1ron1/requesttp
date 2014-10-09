'use strict';

app.directive('popup', function($animate) {
    return {
        restrict: 'A',
        scope: {
            watch: "=popup"
        },
        compile: function(element, attributes) {
            element.addClass("popup-hide");
            var link = function($scope, element, attributes) {
                $scope.$watch('watch', function(newVal) {
                    if (newVal) {
                        $animate.addClass(element, "popup-show");
                    } else {
                        $animate.removeClass(element, "popup-show");
                    }
                });
            }
            return link;
        }
    };
});

app.directive('hideIfArray', function($animate) {
    return {
        restrict: 'A',
        scope: {
            watch: "=hideIfArray"
        },
        compile: function(element, attributes) {
            var link = function($scope, element, attributes) {
                $scope.$watch('watch', function(newVal) {
                    console.log(newVal);
                    if (newVal instanceof Array) {
                        element.hide();
                    } else {
                        element.show();
                    }
                });
            }
            return link;
        }
    };
});

app.directive('showIfArray', function($animate) {
    return {
        restrict: 'A',
        scope: {
            watch: "=showIfArray"
        },
        compile: function(element, attributes) {
            var link = function($scope, element, attributes) {
                $scope.$watch('watch', function(newVal) {
                    console.log(newVal);
                    if (newVal instanceof Array) {
                        element.show();
                    } else {
                        element.hide();
                    }
                });
            }
            return link;
        }
    };
});


app.directive('focusMe', function($timeout) {
    return {
        scope: {
            trigger: '=focusMe'
        },
        link: function(scope, element) {
            scope.$watch('trigger', function(value) {
                if (value === true) {
                    //element[0].focus();
                    var el = element[0];
                    if (typeof el.selectionStart == "number") {
                        el.selectionStart = el.selectionEnd = el.value.length;
                    } else if (typeof el.createTextRange != "undefined") {
                        el.focus();
                        var range = el.createTextRange();
                        range.collapse(false);
                        range.select();
                    }
                    scope.trigger = false;
                }
            });
        }
    };
});
