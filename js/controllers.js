
angular.module('gmControllers', [])
.controller('MainCtrl', function ($scope, $location, locator) {
    locator.start();
    $scope.toMeasure = function () {
        $location.path('/measure');
    };
})
.controller('MeasureCtrl', function ($scope, $interval) {
    var timer;
    $scope.time = 0;
    $scope.dist = 0;
    $scope.speed = 0;
    timer = $interval(function () {
        $scope.time++;
    }, 1000);
    $scope.$on('$destroy', function () {
        $interval.cancel(timer);
        timer = null;
    });
    $scope.toggleState = function () {
        
    };
});

