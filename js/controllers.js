
angular.module('gmControllers', [])
.controller('MainCtrl', function (locator, pulse) {
    locator.start();
    pulse.reset();
})
.controller('MeasureCtrl', function ($scope, pulse) {
    pulse.start().pause(false);
    $scope.state = pulse.state;
    $scope.togglePause = pulse.pause;
    $scope.reset = function () {
        pulse.reset().start();
        $scope.state = pulse.state;
    };
    $scope.$on('locator.error', function (event, err) {
        pulse.pause(true);
        $scope.message = err;
    });
    $scope.$on('timer.tick', function (event, ticks) {
        $scope.state.ticks = ticks;
        $scope.$digest();
    });
    $scope.$on('locator.active', function (event, active) {
        if (active) {
            $scope.message = '';
            if ($scope.state.paused) pulse.pause(false);
        }
    });
    $scope.$on('tracker.change', function (event, data) {
        function val(x) {
            return isNaN(parseFloat(x)) ? '?' : x.toFixed(2);
        }
        $scope.state.speed = val(data.speed);
        $scope.state.dist = val(data.distance);
    });
    $scope.$on('$destroy', function () {
        pulse.pause(true);
    });
})
.controller('ResultCtrl', function ($scope, pulse) {
    pulse.pause(true);
});
