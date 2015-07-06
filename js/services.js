
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
})
.service('timer', function ($rootScope) {
    var ticks, id, state;
    function every() {
        id = setTimeout(function () {
            ticks++;
            $rootScope.$broadcast('timer.tick', ticks);
            every();
        }, 1000);
    }
    return {
        start: function () {
            ticks = 0;
            state = 'started';
            every();
        },
        getTicks: function () {
            return ticks;
        },
        stop: function () {
            clearTimeout(id);
            state = 'stopped';
            id = null;
        },
        pause: function () {
            if (state !== 'paused') {
                clearTimeout(id);
                state = 'paused';
            } else {
                every();
                state = 'started';
            }
        }
    };
})
.service('tracker', function ($rootScope) {
    var tracker = {
        start: function () {
            this.threshold = 5000;
            this.paused = false;
            this.positions = [];
            this.distance = 0;
            this.lastTime = 0;
        },
        pause: function (paused) {
            this.paused = paused;
        },
        stop: function () {
    
        },
        track: function (pos) {
            if (this.paused) {
                return;
            }
            this.positions.push({
                lt: pos.coords.latitude,
                ln: pos.coords.longitude,
                t: pos.timestamp,
                d: 0,
                s: 0
            });
            if (this.positions.length > 1) {
                var t = pos.timestamp - this.lastTime;
                if (t > this.threshold) {
                    var len = this.positions.length,
                        pos1 = this.positions[len - 2],
                        pos2 = this.positions[len - 1],
                        d = this.calcDistance(pos1, pos2),
                        speed = d / t;
                    this.distance += d;
                    pos2.d = d;
                    pos2.speed = speed;
                    $rootScope.$broadcast('tracker.change', {
                        speed: speed,
                        distance: tracker.distance,
                        moved: d
                    });
                }
            }
            this.lastTime = pos.timestamp;
        },
        calcDistance: function (coords1, coords2) {
            var toRad = function (num) {
                    return num * Math.PI / 180.0;
                },
                R = 6371,
                dLat = toRad(coords2.lt - coords1.lt),
                dLon = toRad(coords2.ln - coords1.ln),
                a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(coords1.lt)) * Math.cos(toRad(coords2.lt)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2),
                c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
                d = R * c;
            return d;
        }
    };
    $rootScope.$on('locator.pos', function (ev, pos) {
        tracker.track(pos);
    });
    return tracker;
});
