
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
            this.pos = null;
            this.distance = 0;
        },
        pause: function (paused) {
            this.paused = paused;
        },
        track: function (pos) {
            if (this.paused) {
                return;
            }
            if (this.pos === null) {
                this.pos = pos;
                return;
            }
            var t = pos.timestamp - this.pos.timestamp;
            if (t >= 5000) {
                var d = this.calcDistance(this.pos.coords, pos.coords),
                    t = t/1000,
                    speed = d/t;
                this.distance += d;
                $rootScope.$broadcast('tracker.change', {
                    speed: speed,
                    distance: tracker.distance,
                    move: d
                });
            }
            
            
            /*if (this.positions.length === 2) {
                var p1 = this.positions.shift(),
                    p2 = this.positions.pop(),
                    d = this.calcDistance(p1.coords, p2.coords), // distance in meters
                    t = (p2.timestamp - p1.timestamp) / 1000, // time in sec
                    speed = d/t; // speed in meters per seconds
                this.distance += d;
                $rootScope.$broadcast('tracker.change', {
                    speed: speed,
                    distance: tracker.distance,
                    move: d
                });
            }*/
            
            /*var len = this.positions.length;
            if (len === 0) {
                this.positions.push(pos);
                this.lastTime = Date.now();
                return;
            }
            var t = pos.timestamp - this.lastTime;
            if (t > this.threshold) {
                var prev = this.positions[len-1],
                    d = this.calcDistance(prev.coords, pos.coords),
                    speed = d / t;
                this.positions.push(pos);
                this.lastTime = Date.now();
                this.distance += d;
                $rootScope.$broadcast('tracker.change', {
                    speed: speed,
                    distance: tracker.distance,
                    move: d
                });
            }*/
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
    $rootScope.$on('locator.pos', function (ev, pos) {
        tracker.track(pos);
    });
    return tracker;
});
