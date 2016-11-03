(function(angular) {
    'use strict';
    angular.module('helper', ['MyService'])
        .constant('vlHandleErrors', function(rs) {
            angular.element('div.overlay').remove();
        })
        .constant('vlHtmlCommon', {
            loading: '<div class="overlay"><i class="fa fa-refresh fa-spin"></i></div>'
        })
        .constant('helperFunc', {
            showModal: function(element) {
                angular.element(element).modal('show');
            },
            hideModal: function(element) {
                angular.element(element).modal('hide');
                angular.element('.modal-backdrop').remove();
                angular.element('body')
                    .removeClass('modal-open')
                    .css('padding-right', '0px');
            },
            notifySuccess: function(message) {
                setTimeout(function() {
                    //angular.element('#notification').append('<div class="alert alert-success alert-dismissible">' +
                    //'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">×</button>' +
                    //'<h4><i class="icon fa fa-check"></i> Thông Báo!</h4>' +
                    //message +
                    //'</div>');
                    $.notify({
                        title: '<strong>Thông Báo!</strong>',
                        icon: 'icon fa fa-check',
                        message: message
                    },{
                        type: 'success'
                    });
                }, 500);
            },
            notifyWarning: function(message) {},
            notifyError: function(message) {
                $.notify({
                    title: '<strong>Lỗi!</strong>',
                    icon: 'icon fa fa-ban',
                    message: message
                },{
                    type: 'danger',
                    z_index: 999999,
                });
            }
        })
        .factory('BaseApi', ['$http', 'config', function($http, config) {
            function myget(url) {
                return $http.get(url, {
                    headers: {
                        'X-Requested-With' :'XMLHttpRequest'
                    }
                });
            }

            function mypost(url, data) {
                return $http.post(url, data);
            }

            function myput(url, data) {
                return $http.put(url, data);
            }

            function mydelete(url) {
                return $http.delete(url);
            }

            function postUploadFile(file) {
                var form = new FormData();
                form.append('file', file);
                return $http.post(config.api + 'filemanager/upload-file', form, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                });
            }

            function postUpload(file) {
                var form = new FormData();
                form.append('file', file);
                return $http.post(config.api + 'filemanager/upload-image', form, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                });
            }

            function postUploads(files) {
                var form = new FormData();
                form.append('file', file);
                return $http.post(config.api + 'filemanager/upload-image', form, {
                    transformRequest: angular.identity,
                    headers: {'Content-Type': undefined}
                });
            }
            return {
                get: myget,
                post: mypost,
                put: myput,
                delete: mydelete,
                postUpload: postUpload,
                postUploadFile: postUploadFile
            }
        }])
        .factory('vlNotify', function(vlHtmlCommon, $anchorScroll) {
            function show(idElement) {
                hide(idElement);
                angular.element(idElement).append(vlHtmlCommon.loading);
            }

            function hide(idElement) {
                if(idElement) {
                    angular.element(idElement + ' div.overlay').remove();
                    //$anchorScroll(idElement.replace('#', ''));
                }
                else
                    angular.element('div.overlay').remove();
            }

            return {
                show: show,
                hide: hide
            };
        })
        .filter('arrayToText', function() {
            return function(input, char) {
                if(!input) return null;
                if(!char)
                    var char =  '\n';
                var s = '';
                angular.forEach(input, function(text) {
                    s = s.concat(char, text);
                    s = s.trim(char);
                });

                return s;
            };
        })
        .filter('textToArray', function() {
            return function(input) {
                if(!input) return null;
                var obj = [];
                input = input.trim();
                angular.forEach(input.split('\n'), function(value) {
                    if(value.length)
                        obj.push(value);
                });
                return obj;
            }
        })
        .filter('parseMetadata', function($parse) {
            return function(value) {
                var newObj = {};
                if(angular.isUndefined(value) || value.length == 0) return newObj;
                angular.forEach(value, function(obj) {
                    newObj[obj.meta_key] = obj.meta_value;
                });
                return newObj;
            };
        })
        .filter('parser', function($parse) {
            return function(value, info) {
                return $parse(info)(value);
            }
        })
        .filter('parserField', function($parse, $sce) {
            return function(value, field) {
                if(field.value)
                {
                    //var _val = $parse(field.value)(value);
                    //return $sce.trustAsHtml(_val);
                    return $parse(field.value)(value);
                }

                //return $sce.trustAsHtml(value);
                return value;
            }
        })
        .directive('vlDate', function() {
            return {
                restrict: 'A',
                scope: {model: '=ngModel'},
                link: function(scope, el) {

                }
            };
        })
        .directive('vlPagination', function() {
            return {
                restrict: 'A',
                scope: {onClick: "="},
                link: function(scope, el) {
                    el.on('click', 'ul.pagination a', function(e) {
                        e.preventDefault();
                        var url = this.href;
                        var page = url.match(/\?page=(\d+)/);
                        if(scope.onClick && page[1])
                            scope.onClick(parseInt(page[1]));

                        scope.$apply();
                        return false;
                    });
                }
            }
        })
        .directive('vlUiTinymce', function() {
            return {
                restrict: 'E',
                scope: {
                    model: '=ngModel'
                },
                template: '<textarea ui-tinymce ng-model="model" class="form-control"></textarea>'
            };
        })
        .directive('vlUpload', ['BaseApi', function(BaseApi) {
            return {
                restrict: 'E',
                scope: {
                    onDone: '=',
                    model: '=ngModel'
                },
                templateUrl: '/portal/theme/vl-upload.html',
                link: function(scope, el,attr) {
                    if(attr.accept)
                        el.find('input[type=file]').attr('accept', attr.accept);
                    el.find('i,img').click(function(e) {
                        el.find('input[type=file]').trigger('click');
                        return false;
                    });
                    el.find('input[type=file]').on('change', function(e) {
                        var files = e.target.files,
                            response = [];

                        BaseApi.postUpload(files[0])
                            .then(function(rs) {
                                var data = rs.data.data;
                                scope.model = data.path;

                                if(angular.isDefined(scope.onDone))
                                {
                                    scope.onDone(data);
                                }
                                el.find('input[type=file]').val("");
                            }, function (rs) {
                                var message = rs.data.message;
                                alert('Upload Fail');
                                el.find('input[type=file]').val("");
                            });
                    });
                }
            };
        }])
        .directive('vlUploadFile', ['$http', function($http) {
            return {
                restrict: 'E',
                scope: {
                    onDone: '=',
                    model: '=ngModel'
                },
                template: '<input type="file" style="display: none;"/> <a href="javascript:void();" class="upload">Upload</a> <div class="form-group" ng-show="model.length"> <input type="text" disabled="disabled" class="form-control" ng-value="model"/> </div>',
                link: function(scope, el, attr) {
                    if(!attr.url) {
                        alert('Please provide url at vlUploadFile Directive');
                        return;
                    }
                    if(attr.accept)
                        el.find('input[type=file]').attr('accept', attr.accept);
                    el.find('a.upload').click(function(e) {
                        el.find('input[type=file]').trigger('click');
                        return false;
                    });
                    el.find('input[type=file]').on('change', function vlUploadFileOnUpload(e) {
                        var files = e.target.files;

                        var form = new FormData();
                        form.append('file', files[0]);
                        $http.post(attr.url, form, {
                            transformRequest: angular.identity,
                            headers: {'Content-Type': undefined}
                        })
                            .then(function(rs) {
                                var data = rs.data.data;
                                scope.model = data.path;

                                if(angular.isDefined(scope.onDone))
                                {
                                    scope.onDone(data);
                                }
                                el.find('input[type=file]').val("");
                            },
                            function(rs) {
                                var message = rs.data.message;
                                alert('Upload Fail');
                                el.find('input[type=file]').val("");
                            });
                    });
                }
            };
        }])
        .directive('vlTitles', function(settingService) {
            return {
                restrict: 'E',
                scope: {
                    model: '=ngModel'
                },
                template: '<select class="form-control" ng-options="key as value for (key, value) in options" ng-model="model"></select>',
                link: function(scope, el, attrs) {
                    scope.options = {'none': attrs.title || 'Danh Xưng'};
                    settingService.getGroup('titles').then(function(rs) {
                        angular.forEach(rs.data.data, function(value, key) {
                            scope.options[key] = value;
                        });
                        if(!scope.options[scope.model])
                            scope.model = 'none';
                    });
                }
            }
        })
        .directive('vlUsers', function($timeout, userService) {
            return {
                restrict: 'E',
                scope: {
                    model: '=ngModel'
                },
                template: '<select class="form-control select2" ng-options="opt.id as opt.name for opt in options" ng-model="model" style="width: 100%;"></select>',
                link: function(scope, el, attrs) {
                    scope.options = [{
                        id: 0,
                        name: attrs.title || 'Chọn Nhân Viên'
                    }];
                    if(!scope.model)
                        scope.model = 0;
                    userService.list().then(function(rs) {
                        scope.options = scope.options.concat(rs.data.data);
                        $timeout(function(){
                            el.find(".select2").select2();
                        }, 100);
                    });
                }
            }
        })
        .directive('vlEditorSimple', function($timeout) {
            return {
                restrict: 'E',
                scope: {model: '=ngModel'},
                template: '<textarea class="textarea" style="width: 100%; height: 200px; font-size: 14px; line-height: 18px; border: 1px solid rgb(221, 221, 221); padding: 10px;"></textarea>',
                link: function(scope, el) {
                    var editor = null;
                    $timeout(function() {
                        editor = el.find('textarea').wysihtml5();
                        editor.on('load', function() {
                            console.log(arguments);
                        });
                        editor.on('change', function() {
                            console.log('change', arguments);
                        });
                    }, 100);
                }
            }
        })
        .component('itemForm', {
            bindings: {
                item: '<',
                error: '<',
                onCancel: '&',
                onSubmit: '&'
            },
            templateUrl: function($element, $attrs) {
                return $attrs.template;
            },
            controller: function() {
                var scope = this;

                scope.submit = function() {
                    if(scope.onSubmit)
                        scope.onSubmit({
                            $event: {
                                item: scope.item
                            }
                        })
                };
                scope.cancel = function() {
                    if(scope.onCancel) {
                        scope.onCancel({
                            $event: {
                                item: scope.item
                            }
                        })
                    }
                };
            }
        });
})(window.angular);