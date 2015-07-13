
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
    $scope.state = 'running';
    $scope.speed = 0;
    $scope.dist = 0;
    $scope.$on('timer.tick', function (event, ticks) {
        $scope.ticks = ticks;
        $scope.$digest();
    });
    function switchPause(state) {
        timer.pause(state);
        tracker.pause(state);
    }
    $scope.toggleState = function () {
        $scope.state = $scope.state == 'running' ? 'paused' : 'running';
        switchPause($scope.state == 'running');
    };
    $scope.$on('locator.active', function (event, active) {
        if (!active) {
            $scope.state = 'search';
            switchPause(true);
        } else {
            $scope.state = 'running';
            switchPause(false);
        }
        $scope.$digest();
    });
    $scope.$on('tracker.change', function (event, data) {
        $scope.speed = data.speed.toFixed(2);
        $scope.dist = data.distance.toFixed(2);
    });
    $scope.$on('$destroy', function () {
        timer.stop();
    });
});
