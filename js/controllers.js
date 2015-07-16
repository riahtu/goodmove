
angular.module('gmControllers', [])
.controller('MainCtrl', function ($scope, $location, locator) {
    locator.start();
})
.controller('MeasureCtrl', function ($scope, $location, timer, tracker) {
    function reset() {
        $scope.speed = 0;
        $scope.dist = 0;
        $scope.stopped = false;
        tracker.start();
        timer.start();
    }
    reset();
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
    $scope.reset = reset;
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
        function val(x) {
            return isNaN(parseFloat(x)) ? '?' : x.toFixed(2);
        }
        $scope.speed = val(data.speed);
        $scope.dist = val(data.distance);
    });
    $scope.$on('$destroy', function () {
        timer.pause(true);
        tracker.pause(true);
    });
})
.controller('ResultCtrl', function () {
    
});
