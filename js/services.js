
angular.module('gmServices', [])
.service('locator', function ($rootScope) {
    var options = {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 30000
    },
    isActive = false,
    watchId = null,
    service = {
        start: function () {
            if (isActive) {
                return;
            }
            if ('geolocation' in navigator) {
                this.active(false);
                watchId = navigator.geolocation.watchPosition(
                    service.onPosition,
                    function (err) { service.onError(err.message); },
                    options
                );
            } else {
                this.onError('geolocation is not supported by your device.');
            }
        },
        stop: function () {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            this.active(false);
        },
        active: function (val) {
            isActive = val;
            $rootScope.$broadcast('locator.active', isActive);
        },
        isActive: function () {
            return isActive;
        },
        onPosition: function (pos) {
            if (!isActive) {
                service.active(true);
            }
            $rootScope.$broadcast('locator.pos', pos);
        },
        onError: function (err) {
            service.active(false);
            $rootScope.$broadcast('locator.error', err);
        }
    };
    return service;
});
