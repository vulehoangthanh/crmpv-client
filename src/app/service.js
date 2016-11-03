(function(angular) {
    'use strict';
    angular.module('MyService',['configModule', 'ngStorage'])
        .factory('Auth', function($http, config) {
            function authentication(email, password) {
                return $http.post(config.api + 'user/login', {
                    email: email,
                    password: password
                });
            }

            return {
                authentication: authentication
            }
        })
        .factory('userService', function($http, $localStorage, $q, config) {
            return {
                info: function userInfo() {
                    if($localStorage.user && $localStorage.user.info) {
                        return $q(function(resolve) {
                            return resolve({data: {data: $localStorage.user.info}});
                        });
                    }

                    return $http.get(config.api + 'common/user-info').then(function(rs) {
                        if(!$localStorage.user)
                            $localStorage.user = {};
                        $localStorage.user.info = rs.data.data;
                        return rs;
                    });
                },
                get: function (id) {
                    return $http.get(config.api + 'api/users/' + id);
                },
                list: function userList() {
                    return $http.get(config.api + 'api/users');
                },
                create: function userCreate(form) {
                    return $http.post(config.api + 'api/users', form);
                },
                update: function userUpdate(form, id) {
                    return $http.put(config.api + 'api/users/' + id, form);
                },
                delete: function userDelete(id) {
                    return $http.delete(config.api + 'api/users/' + id);
                }
            }
        })
        .factory('settingService', function($http, $localStorage, $q, config) {
            return {
                createPairs: function createPairs(form, group) {
                    return $http.post(config.api + 'setting/pairs/' + group, {inputs: form}).then(function(rs) {
                        if(! $localStorage.setting) $localStorage.setting = {};
                        $localStorage.setting[group] = rs.data.data;
                        return rs;
                    });
                },
                createGroup: function addSetting(form, group) {
                    return $http.post(config.api + 'setting/' + group, {inputs: form}).then(function(rs) {
                        if(! $localStorage.setting) $localStorage.setting = {};
                        $localStorage.setting[group] = rs.data.data;
                        return rs;
                    });
                },
                getGroup: function(group) {
                    if($localStorage.setting && $localStorage.setting[group]) {
                        return $q(function(resolve) {
                            return resolve({data: {data: $localStorage.setting[group]}});
                        });
                    }

                    return $http.get(config.api + 'setting/' + group).then(function(rs) {
                        if(! $localStorage.setting)
                            $localStorage.setting = {};
                        $localStorage.setting[group] = rs.data.data;
                        return rs;
                    });
                }
            }
        })
        .factory('contactService', function($http, config) {
            return {
                getId: function(id) {
                    return $http.get(config.api + 'api/contacts/' + id);
                }
            }
        })
        .factory('opportunityService', function($http, config) {
            return {
                getByContact: function(contact_id) {
                    return $http.get(config.api + 'api/contacts/' + contact_id + '/opportunities');
                },
                getByID: function(contact_id, id) {
                    return $http.get(config.api + 'api/contacts/' + contact_id + '/opportunities/' + id);
                },
                update: function(form, contact_id, id) {
                    return $http.put(config.api + 'api/contacts/' + contact_id + '/opportunities/' + id, form);
                },
                create: function(form, contact_id) {
                    return $http.post(config.api + 'api/contacts/' + contact_id + '/opportunities', form);
                },
                delete: function(contact_id, id) {
                    return $http.delete(config.api + 'api/contacts/' + contact_id + '/opportunities/' + id);
                }
            }
        });
}) (window.angular);