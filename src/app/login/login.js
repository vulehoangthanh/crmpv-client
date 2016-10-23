(function(angular) {
    'use strict';
    function services($http, config) {
        function authentication(email, password) {
            return $http.post(config.api + 'user/login', {
                email: email,
                password: password
            })
        }

        return {
            authentication: authentication
        }
    }

    function controller($state, $localStorage, Auth) {
        var scope = this;
        scope.$onInit = function() {
            angular.element('body').addClass('hold-transition login-page');
            scope.user = {
                email: null,
                password: null
            }
        };

        scope.login = function() {
            Auth.authentication(scope.user.email, scope.user.password)
                .then(function(rs) {
                    //store Token
                    var token = rs.data.token;
                    $localStorage.token = token;
                    $localStorage.user = {};
                    $state.go('app');
                });
        }
    }

    angular.module("login", ['ui.router', 'configModule', 'ngStorage'])
        .config(function($stateProvider, $urlRouterProvider) {
            $urlRouterProvider.otherwise('login');
            $stateProvider.state('login', {
                url: '/login',
                component: 'loginComponent'
            });

            $stateProvider.state('logout', {
                url: '/logout',
                template: '<ui-view />',
                controller: function($localStorage, $state) {
                    delete $localStorage.token;
                    delete $localStorage.user;
                    $state.go('login');
                }
            });
        })
        .factory('Auth', services)
        .component('loginComponent', {
            bindings: {},
            templateUrl: 'app/login/login.html',
            controller: controller
        });

})(window.angular);