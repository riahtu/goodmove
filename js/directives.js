
angular.module('gmDirectives', [])
.directive('locatorActivated', function (locator) {
    return {
        restrict: 'A',
        link: function (scope, element) {
            var toggleState = function (state) {
                if (state) {
                    element.removeAttr('disabled');
                } else {
                    element.attr('disabled', 'disabled');
                }
            }
            toggleState(locator.isActive());
            scope.$on('locator.active', function (event, state) {
                toggleState(state);
            });
        }
    };
})
.directive('gmView', function ($location) {
    return {
        //restrict: 'A',
        link: function (scope, element, attrs) {
            var spec = attrs.gmView.split('?'), params = {};
            element.bind('click', function () {
                scope.$apply(function () {
                    if (spec.length > 1) {
                        for (var i = 1; i < spec.length; i++) {
                            var p = spec[i].split('=');
                            params[p[0]] = p[1] || true;
                        }
                    }
                    $location.path('/' + spec[0]).search(params);
                });
            });
        }
    };
});
