(function(angular) {
    'use strict';
    angular.module('contacts', ["ui.router", "configModule", "ngStorage", "helper", "partial", "MyService"])
        .config(function($stateProvider) {
            $stateProvider.state('app.contacts', {
                url: 'contacts?page=1&action_name=none&action_id=0',
                component: 'contactsComponent'
            });
            $stateProvider.state('app.contacts_view', {
                url: 'contacts/:id/view',
                component: 'contactView',
                resolve: {
                    contact: function($stateParams, contactService) {
                        return contactService.getId($stateParams.id)
                            .then(function(rs) {
                                return rs.data.data;
                            });
                    }
                }
            });
        })
        .component('contactsComponent', {
            templateUrl: 'app/contacts/theme/contacts.html',
            controller: function($scope, $element, $http, $sce, $stateParams, $state, $window, config, helperFunc) {
                function handleContactError(res) {
                    if(res.status !== 400) return res;
                    var messages = res.data.messages;
                    if(messages.email)
                        helperFunc.notifyError('Email Không Được Để Trống Hoặc Email Không Hợp Lệ');
                    if(messages.name)
                        helperFunc.notifyError('Người Đại Diện Không Được Để Trống');
                    if(messages.assigned_user_id)
                        helperFunc.notifyError('Chọn Nhân Viên Phụ Trách');
                    return res;
                }

                var scope = this;
                scope.$onInit = function() {
                    scope.links = null;
                    scope.contact = {};
                    scope.table = {
                        fields: [
                            {label: 'Khách Hàng', value: 'company_name'},
                            {label: 'Đại Diện', value: 'name'},
                            {label: 'Email', value: 'email'},
                            {label: 'Số ĐT', value: 'phone_mobile'},
                            {label: 'Địa chỉ', value: 'company_address'}
                        ],
                        actions: [
                            {name: 'detail', label: 'Chi tiết KH'},
                            {name: 'edit', label: 'Sửa'},
                            {name: 'sendmail', label: 'Gửi Mail'},
                            {name: 'sendsms', label: 'Gửi SMS'},
                            {name: 'delete', label: 'Xóa KH'}
                        ]
                    };

                    load($stateParams.page);
                };

                function load(page, params) {
                    $http.get(config.api + 'api/contacts?page=' + page)
                        .then(function(rs) {
                            scope.contacts = rs.data.data;
                            scope.links = $sce.trustAsHtml(rs.data.links);
                            scope.total = rs.data.total;
                        });
                }

                function showModal() {
                    helperFunc.showModal('#contacts-modal');
                }

                function closeModal() {
                    helperFunc.hideModal('#contacts-modal');
                }

                scope.paginate = function(p) {
                    $state.go('.', {page: p});
                };

                scope.onAction = function(event) {
                    switch (event.action) {
                        case 'add':
                            scope.contact = {};
                            scope.modal = 'add';
                            showModal();
                            break;
                        case 'detail':
                            $state.go('app.contacts_view', {id: event.id});
                            break;
                        case 'edit':
                            scope.modal = 'edit';
                            showModal();
                            $http.get(config.api + 'api/contacts/' + event.id)
                                .then(function(rs) {
                                    scope.contact = rs.data.data;
                                });
                            break;
                        case 'delete':
                            if($window.confirm('Xác Nhận Xóa Khách Hàng'))
                                $http.delete(config.api + 'api/contacts/' + event.id)
                                    .then(function() {
                                        $scope.$emit('message:success', 'Xóa Khách Hàng Thành Công');
                                        $state.reload();
                                    });
                            break;
                        case 'sendmail': break;
                        case 'sendsms': break;
                    }
                };

                scope.updateContact = function(event) {
                    var contact = event.contact;
                    $http.put(config.api + 'api/contacts/' + contact.id, contact)
                        .then(function(rs) {
                            closeModal();
                            $scope.$emit('message:success', 'Cập Nhật KH Thành Công');
                            $state.reload();
                        }, handleContactError);
                };

                scope.createContact = function(event) {
                    var contact = event.contact;
                    $http.post(config.api + 'api/contacts', contact)
                        .then(function(rs) {
                            closeModal();
                            $scope.$emit('message:success', 'Thêm Khách Hàng Thành Công');
                            $state.go('.', {page: 1});
                        }, handleContactError);
                };

                scope.closeModal = function() {
                    closeModal();
                };
            }
        })
        .component('contactInvoice', {})
        .component('contactSearch', {})
        .component('contactView', {
            bindings: {
                contact: '<'
            },
            templateUrl: 'app/contacts/theme/contact-view.html',
            controller: function(contactService) {
                var scope = this;
                scope.$onInit = function() {
                 }
            }
        })
        .component('contactInfo', {
            bindings: {contact: '<'},
            templateUrl: 'app/contacts/theme/contact-info.html'
        })
        .component('contactForm', {
            bindings: {
                contact: '<',
                error: '<',
                onCancel: '&',
                onSubmit: '&'
            },
            templateUrl: 'app/contacts/theme/contact-form.html',
            controller: function() {
                var scope = this;

                scope.submit = function() {
                    if(scope.onSubmit)
                        scope.onSubmit({
                            $event: {
                                contact: scope.contact
                            }
                        })
                };

                scope.cancel = function() {
                    if(scope.onCancel) {
                        scope.onCancel({
                            $event: {
                                contact: scope.contact
                            }
                        })
                    }
                };
            }
        })
        .component('opportunityForm', {
            bindings: {
                opportunity: '<'
            },
            templateUrl: 'app/contacts/theme/opportunity-form.html',
            controller: function() {

            }
        })
        .component('opportunities', {
            bindings: {
                contact: '<'
            },
            templateUrl: 'app/contacts/theme/opportunities.html',
            controller: function($scope, $state, $localStorage, $window, opportunityService, helperFunc) {
                function handleError(res) {
                    if(res.status !== 400) return res;
                    var messages = res.data.messages;
                    if(messages.name)
                        helperFunc.notifyError('Tên Cơ Hội Không Được Trống');
                    if(messages.assigned_user_id)
                        helperFunc.notifyError('Bạn Chưa Chọn Nhân Viên Phụ Trách');
                    return res;
                }

                var scope = this;
                scope.$onInit = function() {
                    scope.opportunities = [];
                    scope.table = {
                        actions: [
                            {name: 'edit', label: 'Chỉnh sửa'},
                            {name: 'view', label: 'Xem chi tiết'},
                            {name: 'delete', label: 'Xóa'}
                        ],
                        fields: [
                            {value: 'name', label: 'Tên Cơ Hội'},
                            {value: 'description', label: 'Chi tiết'},
                            //{value: 'amount', label: 'Giá'},
                            {value: 'probability', label: 'Xác Suất'},
                            {value: 'lead_source', label: 'Nguồn'}
                        ]
                    };
                    scope.modal = 'none';
                    scope.error = {};
                    opportunityService.getByContact(scope.contact.id)
                        .then(function(rs) {
                            scope.opportunities = rs.data.data;
                        });
                };
                
                scope.onAction = function (event) {
                    switch (event.action) {
                        case 'add':
                            scope.modal = 'add';
                            scope.opportunity = {
                                assigned_user_id: $localStorage.user.info.id
                            };
                            helperFunc.showModal('#opportunities-modal');
                            break;
                        case 'edit':
                            opportunityService.getByID(scope.contact.id, event.id)
                                .then(function(rs) {
                                    scope.modal = 'edit';
                                    scope.opportunity = rs.data.data;
                                    helperFunc.showModal('#opportunities-modal');
                                });
                            break;
                        case 'view':
                            opportunityService.getByID(scope.contact.id, event.id)
                                .then(function(rs) {
                                    scope.modal = 'view';
                                    scope.opportunity = rs.data.data;
                                    helperFunc.showModal('#opportunities-modal');
                                });
                            break;
                        case 'delete':
                            if($window.confirm('Xác nhận xóa cơ hội'))
                                opportunityService.delete(scope.contact.id, event.id)
                                    .then(function() {
                                        $scope.$emit('message:success', 'Xóa Cơ Hội Thành Công');
                                        $state.reload();
                                    });
                            break;
                    }
                };

                scope.create = function(event) {
                    var opportunity = event.item;
                    opportunityService.create(opportunity, scope.contact.id)
                        .then(function(rs) {
                            scope.opportunities = scope.opportunities.concat([rs.data.data]);
                            $scope.$emit('message:success', 'Thêm Cơ Hội Thành Công');
                            scope.cancel();
                        }, handleError);
                };

                scope.update = function(event) {
                    var opportunity = event.item;
                    opportunityService.update(opportunity, scope.contact.id, opportunity.id)
                        .then(function(rs) {
                            $scope.$emit('message:success', 'Cập Nhật Cơ Hội Thành Công');
                            scope.cancel();
                            $state.reload();
                        }, handleError);
                };
                
                scope.cancel = function () {
                    scope.modal = 'none';
                    helperFunc.hideModal('#opportunities-modal');
                }
            }
        })
        .component('contracts', {
            templateUrl: 'app/contacts/theme/contracts.html',
            bindings: {contact: '<'},
            controller: function($localStorage, $window, helperFunc) {
                var scope = this;
                scope.$onInit = function() {
                    scope.contracts = [];
                    scope.table = {
                        actions: [
                            {name: 'edit', label: 'Chỉnh sửa'},
                            {name: 'view', label: 'Xem chi tiết'},
                            {name: 'delete', label: 'Xóa'}
                        ],
                        fields: [
                            {value: 'id', label: 'ID HĐ'},
                            {value: 'contract_type', label: 'Loại HĐ'},
                            {value: 'status', label: 'Tình Trạng'},
                            {value: 'start_date', label: 'Ngày bắt đầu'},
                            {value: 'end_date', label: 'Ngày kết thúc'},
                            {value: 'description', label: 'Chi tiết'}
                        ]
                    };
                    scope.modal = 'none';
                    scope.error = {};
                };
                scope.onAction = function (event) {
                    switch (event.action) {
                        case 'add':
                            scope.modal = 'add';
                            scope.contract = {
                                assigned_user_id: $localStorage.user.info.id
                            };
                            helperFunc.showModal('#contracts-modal');
                            break;
                        case 'edit':

                            break;
                        case 'view':

                            break;
                        case 'delete':
                            //if($window.confirm('Xác nhận xóa hợp đồng'))
                            break;
                    }
                };
                scope.create = function(event) {};
                scope.update = function (event) {
                    
                };
                scope.cancel = function() {
                    helperFunc.hideModal('#contracts-modal');
                }
            }
        });
})(window.angular);