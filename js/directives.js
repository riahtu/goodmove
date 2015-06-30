
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
});
