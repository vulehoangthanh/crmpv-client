(function(angular) {
    'use strict';
    angular.module('settingsModule', ["ui.router", "configModule", "ngStorage", "helper", "partial", "MyService"])
        .config(function($stateProvider) {
            $stateProvider.state('app.setting', {
                url: 'setting/:group',
                component: 'settingCommon'
            });
        })
        .component('settingCommon', {
            templateUrl: function($stateParams) {
                return 'app/settings/theme/' + $stateParams.group + '.html';
            },
            controller: function($stateParams, settingService) {
                var scope = this;
                scope.$onInit = function() {
                    scope.group = $stateParams.group;
                    scope.form = {};
                    settingService.getGroup(scope.group)
                        .then(function(rs) {
                            var data = rs.data.data;
                            if(data.length == 0) return;
                            scope.form = data;
                        });
                };

                scope.submit = function() {
                    settingService.createPairs(scope.form, scope.group)
                        .then(function (rs) {
                            scope.form = rs.data.data;
                        })
                }
            }
        });
})(window.angular);