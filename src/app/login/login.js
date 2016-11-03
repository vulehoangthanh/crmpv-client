(function(angular) {
    'use strict';
    function controller($element, $state, $localStorage, Auth) {
        var scope = this;
        scope.$onInit = function() {
            angular.element('body').addClass('hold-transition login-page');
            scope.user = {
                email: null,
                password: null
            }
        };

        scope.login = function() {
            $element.find('#login-error')
                .addClass('hide');
            Auth.authentication(scope.user.email, scope.user.password)
                .then(function(rs) {
                    //store Token
                    var token = rs.data.token;
                    $localStorage.token = token;
                    $localStorage.user = {};
                    $state.go('app.dashboard');
                }, function(rs) {
                    if(rs.status == 401) {
                        $element.find('#login-error')
                            .removeClass('hide')
                            .text('Đăng Nhập Thất Bại');
                    }
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
                    delete $localStorage.setting;
                    $state.go('login');
                }
            });
        })
        .component('loginComponent', {
            bindings: {},
            templateUrl: 'app/login/login.html',
            controller: controller
        });

})(window.angular);