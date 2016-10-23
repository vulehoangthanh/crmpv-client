(function(angular) {
    'use strict';
    angular.module("myCRM", ['login', 'common', 'ngStorage', 'configModule'])
        .config(function($httpProvider) {
            $httpProvider.interceptors.push(['$q', '$state', '$localStorage', function ($q, $state, $localStorage) {
                return {
                    'request': function (config) {
                        config.headers = config.headers || {};
                        if ($localStorage.token) {
                            config.headers.Authorization = 'Bearer ' + $localStorage.token;
                        }
                        return config;
                    },
                    'responseError': function (response) {
                        if (response.status === 401 || response.status === 403) {
                            $state.go('/login');
                        }
                        return $q.reject(response);
                    }
                };
            }]);
        })
        .component('app', {
            template: '<ui-view></ui-view>'
        });
})(window.angular);