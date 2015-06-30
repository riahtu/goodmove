(function ($) {
    'use strict';
    
    angular.module('GoodMove', [
        'ngRoute',
        'gmControllers',
        'gmServices',
        'gmDirectives'
    ])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
                .when('/main', {
                    templateUrl: 'partial-main.html',
                    controller: 'MainCtrl'
                })
                .when('/measure', {
                    templateUrl: 'partial-measure.html',
                    controller: 'MeasureCtrl'
                })
                .otherwise({
                    redirectTo: '/main'
                });
    }])
    .filter('timer', function () {
        return function (val) {
            val = val || 0;
            var sec = val % 60, 
                min = (val / 60) | 0,
                hour = (val / 3600) | 0;
            return ('0' + hour).slice(-2) + ':' + ('0' + min).slice(-2) + 
                        ':' + ('0' + sec).slice(-2);
        };
    });
    
    $(document).ready(function(){
        window.scrollTo(0,0);
    });
    
})(jQuery);
