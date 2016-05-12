var services = ['datatables', 'datatables.columnfilter'];
var app = angular.module("myApp", services);


app.run(function ($http, myFactory, $rootScope) {
    $rootScope.action = angular.element('body').attr('data-ng-attr-action');
    $rootScope.session_user_id = angular.element('body').attr('data-ng-attr-userid');
    $rootScope.alert_status = "";
    $rootScope.messages = "";
    $rootScope.title = "";
    $rootScope.header_title = "";
    $rootScope.table_name = "";
    
    //  @link: http://stackoverflow.com/questions/576196/regular-expression-allow-letters-numbers-and-spaces-with-at-least-one-letter
    $rootScope.validate_invalid_characters = "^[a-zA-Z0-9 _-]*$";
    $rootScope.validate_int_decimal_only = "^[0-9]*(\.[0-9]{1,5})?$";
    
    $rootScope.validate_invalid_characters_and_allow_null = "^[(null)0-9]*(\.[0-9]{1,5})?$";
    
    if (configs.translator.enable == true) {
        if (configs.translator.default !== "en") {
            $http.get('/javascripts/lang/' + configs.translator.default + '.json?').success(function (data) {
                $rootScope.locales = data;
            });
        }
    }

    switch ($rootScope.action) {
        case "project":
        case "report_monthly":
        case "report_weekly":
        case "report_user_based":
            mtxTables($http, $rootScope, myFactory, 'mtxUsers');
            break;
        case "report_project_based":
            mtxTables($http, $rootScope, myFactory, 'mtxProjects');
            break;
        default:
            break;
    }
});

app.factory('myFactory', function ($http, $rootScope, $timeout, dateFilter) {
    return {
        date_time_now: function () {
            return dateFilter(new Date(), "yyyyMMddhhmmss");
        },
        get_parameter_by_name: function (name) {
            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
            
            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        },
        response_behavior: function (http_status, http_method, action, msg) {
            var response_msg = "";
            var response_status_class = "";
            switch (http_status) {
                case 200:
                    response_status_class = "progress-bar-success";
                    switch (http_method) {
                        case "GET":
                            response_msg = "Data was successfully loaded.";
                            break;
                        case "POST":
                            response_msg = "Data was successfully created.";
                            break;
                        case "PUT":
                            response_msg = "Data was successfully updated.";
                            break;
                        case "DELETE":
                            response_msg = "Data was successfully deleted.";
                            break;
                        default:
                            response_msg = "";
                            break;
                    }
                    break;
                case 400:
                    response_status_class = "alert-danger";
                    response_msg = "400 Request failed. Please try again.";
                    
                    if (typeof msg !== "undefined") response_msg = msg;
                    break;
                case 401:
                    response_status_class = "alert-danger";
                    response_msg = "401 Unauthorized.";
                    
                    if (typeof msg !== "undefined") response_msg = msg;
                    break;
                case 403:
                    response_status_class = "alert-danger";
                    response_msg = "403 Forbidden.";
                    
                    if (typeof msg !== "undefined") response_msg = msg;
                    break;
                case 404:
                    response_status_class = "alert-danger";
                    response_msg = "404 Request Not Found.";
                    break;
                case 408:
                    response_status_class = "alert-danger";
                    response_msg = "408 Request is timeout. Please try again.";
                    break;
                case 480:
                    response_status_class = "alert-danger";
                    response_msg = "480 Response is timeout.";
                    break;
                default:
                    break;
            }
            
            if (configs.msg_prompt.mode == 'flash') {
                if (configs.translator.enable == true) $rootScope.messages = $rootScope.locales[response_msg];
                else $rootScope.messages = response_msg;

                $rootScope.alert_status = response_status_class;
                
                $timeout(function () { $rootScope.messages = null; }, configs.timeout.flash_msg.ms);
            }
            else {
                if (configs.translator.enable == true) alert($rootScope.locales[response_msg]);
                else alert(response_msg);
            }
        }
    };
});

app.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function (file, uploadUrl, myFactory) {
        var fd = new FormData();
        fd.append('file', file);
        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        })
    .success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_attachments_json', true);
            myFactory.response_behavior(status, "POST", "attachment", data);
        })
    .error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "attachment", data);
        })
    .finally(function (data, status, headers, config) {
        });
    }
}]);


function mtxTables($http, $rootScope, myFactory, type) {
    switch (type) {
        case 'mtxProjects':
            $http({
                url: '/projects/.json?_=' + myFactory.date_time_now(),
                method: "GET",
                cache: false,
                headers: { 'X-Requested-With' : 'XMLHttpRequest' }
            }).success(function (data, status, headers, config) {
                $rootScope.mtxProjects = [];
                if (data.dataset.length > 0) {
                    angular.forEach(data.dataset, function (item, key) {
                        if (item.active == true || item.active == 1) $rootScope.mtxProjects.push(item);
                    });
                }
            }).error(function (data, status, headers, config) {
            }).finally(function () {
            });
            break;
        case 'mtxUsers':
            $http({
                url: '/users/.json?_=' + myFactory.date_time_now(),
                method: "GET",
                cache: false,
                headers: { 'X-Requested-With' : 'XMLHttpRequest' }
            }).success(function (data, status, headers, config) {
                $rootScope.mtxUsers = [];
                if (data.dataset.length > 0) {
                    angular.forEach(data.dataset, function (item, key) {
                        if (item.active == true) $rootScope.mtxUsers.push(item);
                    });
                }
            }).error(function (data, status, headers, config) {
            }).finally(function () {
            });
            break;
        default:
            break;
    }
}