(function(angular) {
    'use strict';
    angular.module("myCRM", ['login', 'common', 'contacts', 'usersModule', 'settingsModule', 'ngStorage', 'configModule'])
        .run(function ($rootScope, helperFunc) {
            $rootScope.$on('message:success', function(e, message) {
                helperFunc.notifySuccess(message);
            });
        })
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
                        if (response.status === 401) {
                            $state.go('login');
                        }

                        if(response.status === 403) {

                        }

                        if(response.status === 400) {

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