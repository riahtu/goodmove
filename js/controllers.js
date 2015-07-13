
angular.module('gmControllers', [])
.controller('MainCtrl', function ($scope, $location, locator) {
    locator.start();
    $scope.toMeasure = function () {
        $location.path('/measure');
    };
})
.controller('MeasureCtrl', function ($scope, $location, timer, tracker) {
    tracker.start();
    timer.start();
    $scope.speed = 0;
    $scope.dist = 0;
    $scope.stopped = false;
    $scope.$on('timer.tick', function (event, ticks) {
        $scope.ticks = ticks;
        $scope.$digest();
    });
    function switchPause(state) {
        timer.pause(state);
        $scope.stopped = timer.isPaused();
        tracker.pause($scope.stopped);
    }
    $scope.toggleState = switchPause;
    $scope.btnBack = function () {
        $location.path('/');
    };
    $scope.$on('locator.error', function (event, err) {
        switchPause(true);
        $scope.message = err;
    });
    $scope.$on('locator.active', function (event, active) {
        if (active) {
            $scope.message = '';
            if ($scope.stopped) switchPause(false);
        }
    });
    $scope.$on('tracker.change', function (event, data) {
        $scope.speed = data.speed.toFixed(2);
        $scope.dist = data.distance.toFixed(2);
    });
    $scope.$on('$destroy', function () {
        timer.pause(true);
        tracker.pause(true);
    });
});
