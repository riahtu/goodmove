
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
    var ticks, id, paused;
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
            paused = false;
            if (id !== null) clearTimeout(id);
            every();
        },
        getTicks: function () {
            return ticks;
        },
        isPaused: function () {
            return paused;
        },
        pause: function (_paused) {
            paused = (typeof _paused === 'boolean') ? _paused : !paused;
            if (paused) {
                clearTimeout(id);
                id = null;
            } else if (id === null) {
                every();
            }
        }
    };
})
.service('tracker', function ($rootScope) {
    var tracker = {
        start: function () {
            this.paused = false;
            this.lastPos = null;
            this.distance = 0;
            $rootScope.$on('locator.pos', function (ev, pos) {
                tracker.track(pos);
            });
        },
        pause: function (paused) {
            this.paused = paused;
        },
        track: function (pos) {
            var self = this,
                speed = pos.coords.speed || null;
            if (this.paused) { // Tracking paused.
                return;
            }
            if (speed == 0) { // No movement.
                this.lastPos = null;
                return;
            }
            if (this.lastPos === null) {
                this.lastPos = pos;
                return;
            }
            var t = (pos.timestamp - this.lastPos.timestamp) / 1000; // time in seconds
            if (t > 9) {
                // Stale position - reupdate it.
                this.lastPos = pos;
                return;
            }
            var d = this.calcDistance(this.lastPos.coords, pos.coords); // distance in meters
            this.distance += d;
            this.lastPos = pos;
            $rootScope.$broadcast('tracker.change', {
                speed: speed,
                distance: self.distance,
                moved: d,
                time: pos.timestamp
            });
        },
        calcDistance: function (coords1, coords2) {
            var toRad = function (num) {
                    return num * Math.PI / 180.0;
                },
                R = 6371000,
                dLat = toRad(coords2.latitude - coords1.latitude),
                dLon = toRad(coords2.longitude - coords1.longitude),
                a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(coords1.latitude)) * Math.cos(toRad(coords2.latitude)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2),
                c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
                d = R * c;
            return d;
        }
    };
    return tracker;
})
.service('pulse', function (timer, tracker) {
    var pulse;
    pulse = {
        state: null,
        start: function () {
            if (!this.state) {
                timer.start();
                tracker.start();
                this.state = {
                    speed: 0,
                    dist: 0,
                    ticks: 0,
                    paused: false
                };
            }
            return this;
        },
        reset: function () {
            this.state = null;
            return this;
        },
        pause: function (paused) {
            paused = (typeof paused === 'boolean') ? paused : !this.state.paused;
            timer.pause(paused);
            tracker.pause(paused);
            this.state.paused = paused;
            return this;
        }
    };
    return pulse;
});
