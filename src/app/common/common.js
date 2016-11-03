(function(angular) {
    'use strict';
    function sidebar() {
        angular.element('body').addClass('sidebar-collapse');
    }

    function userInfo(userService) {
        var scope = this;

        scope.$onInit = function() {
            userService.info()
                .then(function(rs) {
                    scope.user = rs.data.data;
                });
        }
    }

    angular.module("common", ["ui.router", "configModule", "ngStorage", "MyService", "helper", "partial"])
        .config(function ($stateProvider) {
            $stateProvider.state("app", {
                url: '/',
                templateUrl: 'app/common/theme/common.html',
                controller: function() {
                    angular.element('body').addClass("hold-transition skin-blue sidebar-mini");
                }
            });
            $stateProvider.state("app.dashboard", {
                url: 'dashboard',
                component: 'dashboard'
            });
        })
        .component("sidebar", {
            templateUrl: 'app/common/theme/sidebar.html',
            controller: sidebar
        })
        .component("userInfo", {
            templateUrl: 'app/common/theme/userinfo.html',
            controller: userInfo
        })
        .component("dashboard", {
            templateUrl: 'app/common/theme/dashboard.html',
            controller: function() {

            }
        });
})(window.angular);