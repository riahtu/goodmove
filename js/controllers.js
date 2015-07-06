
angular.module('gmControllers', [])
.controller('MainCtrl', function ($scope, $location, locator) {
    locator.start();
    $scope.toMeasure = function () {
        $location.path('/measure');
    };
})
.controller('MeasureCtrl', function ($scope, timer, tracker) {
    tracker.start();
    timer.start();
    $scope.running = true;
    $scope.speed = 0;
    $scope.dist = 0;
    $scope.$on('timer.tick', function (event, ticks) {
        $scope.ticks = ticks;
        $scope.$digest();
    });
    $scope.toggleState = function () {
        $scope.running = !$scope.running;
        timer.pause();
        tracker.pause(!$scope.running);
    };
    $scope.$on('tracker.change', function (event, data) {
        $scope.speed = data.speed;
        $scope.dist = data.distance;
    });
    $scope.$on('$destroy', function () {
        timer.stop();
    });
});
