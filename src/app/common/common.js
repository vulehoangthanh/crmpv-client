(function(angular) {
    function sidebar() {

    }

    function userInfo($http, $localStorage, config) {
        var scope = this;

        scope.$onInit = function() {
            if($localStorage.user.info)
                scope.user = $localStorage.user.info;
            $http.get(config.api + 'common/user-info')
                .then(function(rs) {
                    $localStorage.user.info = rs.data.data;
                    scope.user = rs.data.data;
                });
        }
    }

    angular.module("common", ["ui.router", "configModule", "ngStorage"])
        .config(function ($stateProvider) {
            $stateProvider.state("app", {
                url: '/',
                templateUrl: 'app/common/common.html',
                controller: function() {
                    angular.element('body').addClass("hold-transition skin-blue sidebar-mini");
                }
            });
        })
        .component("sidebar", {
            templateUrl: 'app/common/sidebar.html',
            controller: sidebar
        })
        .component("userInfo", {
            templateUrl: 'app/common/userinfo.html',
            controller: userInfo
        });
})(window.angular);