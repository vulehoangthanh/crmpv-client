(function(angular) {
    'use strict';
    angular.module('partial', [])
        .component('partialList', {
            bindings: {
                items: '<',
                fields: '<',
                actions: '<',
                onAction: '&'
            },
            templateUrl: 'app/partials/theme/list.html',
            controller: function() {
                var scope = this;

                scope.$onInit = function() {

                };

                scope.click = function(actionName, item) {
                    scope.onAction({
                        $event: {
                            action: actionName,
                            item: item,
                            id: item
                        }
                    })
                };
            }
        });
})(window.angular);