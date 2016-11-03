(function(angular) {
    'use strict';
    angular.module('usersModule', ["ui.router", "helper", "partial", "MyService"])
        .config(function($stateProvider) {
            $stateProvider.state('app.users', {
                url: 'users?page=1',
                component: 'users'
            });
        })
        .component('users', {
            templateUrl: 'app/users/theme/users.html',
            controller: function($scope, $sce, $state, $window, userService, helperFunc) {
                function handleError(res) {
                    if(res.status !== 400) return res;
                    var messages = res.data.messages;
                    if(messages.email)
                        helperFunc.notifyError('Email Không Được Để Trống Hoặc Email Không Hợp Lệ');
                    if(messages.name)
                        helperFunc.notifyError('Tên Nhân Viên Không Được Để Trống');
                    if(messages.password && messages.password[0] == 'The password confirmation does not match.')
                        helperFunc.notifyError('Mật Khẩu Và Xác Nhận Không Trùng Khớp');
                    if(messages.password && messages.password[0] == 'The password field is required.')
                        helperFunc.notifyError('Tên Nhân Viên Không Được Để Trống');
                }

                var scope = this;
                scope.$onInit = function() {
                    scope.users = [];
                    scope.links = null;
                    scope.total = 0;
                    scope.user = {};
                    scope.modal = 'none';
                    scope.table = {
                        actions: [
                            {name: 'detail', label: 'Xem Nhân Viên'},
                            {name: 'edit', label: 'Sửa'},
                            {name: 'delete', label: 'Xóa NViên'}
                        ],
                        fields: [
                            {label: 'Tên NV', value: 'name'},
                            {label: 'Email', value: 'email'},
                            {label: 'Điện Thoại', value: 'phone_work'},
                            {label: 'Địa Chỉ', value: 'primary_address'}
                        ]
                    };

                    userService.list().then(function(res) {
                        var rs = res.data;
                        scope.users = rs.data;
                        scope.total = rs.total;
                        scope.links = $sce.trustAsHtml(rs.links);
                    })
                };

                scope.onAction = function (event) {
                    switch (event.action) {
                        case 'detail': break;
                        case 'edit':
                            userService.get(event.id).then(function (res) {
                                scope.user = res.data.data;
                                scope.modal = 'edit';
                                helperFunc.showModal('#users-modal');
                            });
                            break;
                        case 'add':
                            scope.modal = 'add';
                            scope.user = {};
                            helperFunc.showModal('#users-modal');
                            break;
                        case 'delete':
                            if($window.confirm('Xác Nhận Xóa Nhân Viên?'))
                                userService.delete(event.id)
                                    .then(function() {
                                        $scope.$emit('message:success', 'Xóa Nhân Viên Thành Công');
                                        $state.reload();
                                    });

                            break;
                    }
                };

                scope.create = function (event) {
                    var user = event.item;
                    userService.create(user).then(function (rs) {
                        scope.users = [rs.data.data].concat(scope.users);
                        $scope.$emit('message:success', 'Thêm Nhân Viên Thành Công');
                        scope.closeModal();
                    }, handleError);
                };
                
                scope.update = function (event) {
                    var user = event.item,
                        id = user.id;

                    userService.update(user, id)
                        .then(function(rs) {
                            scope.closeModal();
                            $scope.$emit('message:success', 'Cập Nhật Nhân Viên Thành Công');
                            $state.reload();
                        }, handleError);
                };

                scope.closeModal = function () {
                    helperFunc.hideModal('#users-modal');
                };
            }
        });

})(window.angular);