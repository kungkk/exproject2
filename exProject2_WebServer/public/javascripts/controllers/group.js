app.controller("group_controller", function ($http, $location, myFactory, $rootScope, $scope) {
    $scope.button = angular.element('form').attr('data-ng-attr-button');

    if ($scope.button !== 'save') {
        // #region GET API: /group view template
        $http({
            url: '/group?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.html = data;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
        // #endregion
    }
    else {
        // #region GET API: /group/###/.json
        $http({
            url: $location.absUrl() + '/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.id = data.dataset[0].id;
            $scope.name = data.dataset[0].name;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
        // #endregion
    }
    
    
    // #region POST API: /group
    $scope.create = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var data = {
            name: $scope.name
        };
        
        $http({
            url: '/group?_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_groups_json', true);
            $scope.name = "";
            myFactory.response_behavior(status, "POST", "group");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "group", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
    
    // #region PUT API: /group/###
    $scope.save = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var data = {
            name: $scope.name
        };
        
        $http({
            url: '/group/' + $scope.id + '?_=' + myFactory.date_time_now(),
            method: "PUT",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "group");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "group", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
});


app.controller("group_permissions_controller", function ($http, $location, myFactory, $rootScope, $scope, DTDefaultOptions, $timeout) {
    DTDefaultOptions.setDisplayLength(50);

    $scope.permissions_checked = {
        items: {}, 
        items_select: {}, 
        items_insert: {}, 
        items_update: {}, 
        items_delete: {}
    };

    // #region GET API: /group/###/permissions/.json
    $scope.get = function () {
        
        //$timeout(function () {
        //    $scope.spinneractive = true;
        //    usSpinnerService.spin('spinner-1');
        //}, 100);  
        

        $http({
            url: $location.absUrl() + '/permissions/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.permissions = data.dataset;
            else $scope.permissions = null;
            
            angular.forEach($scope.permissions, function (item) {
                if (item.checkbox == 1) $scope.permissions_checked.items[item.permission_id] = true;
                else $scope.permissions_checked.items[item.permission_id] = false;
                
                if (item.select_ == 1) $scope.permissions_checked.items_select[item.permission_id] = true;
                else $scope.permissions_checked.items_select[item.permission_id] = false;
                
                if (item.insert_ == 1) $scope.permissions_checked.items_insert[item.permission_id] = true;
                else $scope.permissions_checked.items_insert[item.permission_id] = false;
                
                if (item.update_ == 1) $scope.permissions_checked.items_update[item.permission_id] = true;
                else $scope.permissions_checked.items_update[item.permission_id] = false;
                
                if (item.delete_ == 1) $scope.permissions_checked.items_delete[item.permission_id] = true;
                else $scope.permissions_checked.items_delete[item.permission_id] = false;
            });
        }).error(function (data, status, headers, config) {
        }).finally(function () {
            //$scope.spinneractive = false;
            //usSpinnerService.stop('spinner-1');
        });
    };
    
    $scope.get();
    // #endregion

    // #region POST API: /group/###/permissions
    $scope.submit = function () {
        $scope.loading = true;

        $http({
            url: $location.absUrl() + '/permissions?_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: $scope.permissions,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.get();
            myFactory.response_behavior(status, "POST", "group_permissions");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "group_permissions");
        }).finally(function () {
            $scope.loading = false;
        });
    };
    // #endregion

    // #region CHECKBOX BEHAVIOR
    // #region MASTER CHECKBOX
    $scope.toggle_permissions = function (index, group_permission_id, permission_id) {
        if ($scope.permissions_checked.items[permission_id] == true) {
            $scope.permissions[index].checkbox = 1;
            $scope.permissions[index].select_ = 1;
            $scope.permissions_checked.items_select[permission_id] = 1;
            
            if (group_permission_id == null) {
                $scope.permissions[index].is_dirty = 1;
                $scope.permissions[index].http_method = 'POST';
            }
            else {
                $scope.permissions[index].is_dirty = 0;
                $scope.permissions[index].http_method = null;
            }
        }
        else {
            $scope.permissions[index].checkbox = 0;
            
            if (group_permission_id == null) {
                $scope.permissions[index].is_dirty = 0;
                $scope.permissions[index].http_method = null;
            }
            else {
                $scope.permissions[index].is_dirty = 1;
                $scope.permissions[index].http_method = 'DELETE';
            }
        }
    };
    // #endregion 

    // #region SUB CHECKBOX
    $scope.toggle_permissions_sub = function (index, permission_id, action) {
        $scope.permissions[index].is_dirty_put = 1;
        
        switch (action) {
            case "select":
                if ($scope.permissions_checked.items_select[permission_id] == true) $scope.permissions[index].select_ = 1;
                else $scope.permissions[index].select_ = 0;
                break;
            case "insert":
                if ($scope.permissions_checked.items_insert[permission_id] == true) $scope.permissions[index].insert_ = 1;
                else $scope.permissions[index].insert_ = 0;
                break;
            case "update":
                if ($scope.permissions_checked.items_update[permission_id] == true) $scope.permissions[index].update_ = 1;
                else $scope.permissions[index].update_ = 0;
                break;
            case "delete":
                if ($scope.permissions_checked.items_delete[permission_id] == true) $scope.permissions[index].delete_ = 1;
                else $scope.permissions[index].delete_ = 0;
                break;
            default:
                break;
        }
    };
    // #endregion 
    // #endregion
});

app.controller("group_users_controller", function ($http, $location, myFactory, $rootScope, $scope) {
    $scope.users_checked = { items: {} };
    
    // #region GET API: /group/###/users/.json
    $scope.get = function () {
        $http({
            url: $location.absUrl() + '/users/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.users = data.dataset;
            else $scope.users = null;

            angular.forEach($scope.users, function (item) {
                if (item.checkbox == 1) $scope.users_checked.items[item.user_id] = true;
                else $scope.users_checked.items[item.user_id] = false;
            });
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.get();
    // #endregion
    
    
    // #region POST API: /group/###/users
    $scope.submit2 = function () {
        $scope.loading = true;
        
        $http({
            url: $location.absUrl() + '/users?_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: $scope.users,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.get();
            myFactory.response_behavior(status, "POST", "group_users");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "group_users");
        }).finally(function () {
            $scope.loading = false;
        });
    };
    // #endregion
    
    // #region CHECKBOX BEHAVIOR
    $scope.toggle_users = function (index, group_user_id, user_id) {
        if ($scope.users_checked.items[user_id] == true) {
            $scope.users[index].checkbox = 1;
            
            if (group_user_id == null) {
                $scope.users[index].is_dirty = 1;
                $scope.users[index].http_method = 'POST';
            }
            else {
                $scope.users[index].is_dirty = 0;
                $scope.users[index].http_method = null;
            }
        }
        else {
            $scope.users[index].checkbox = 0;
            
            if (group_user_id == null) {
                $scope.users[index].is_dirty = 0;
                $scope.users[index].http_method = null;
            }
            else {
                $scope.users[index].is_dirty = 1;
                $scope.users[index].http_method = 'DELETE';
            }
        }
    };

    
    //#endregion
});

app.directive('ngcdGroup', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdGroup, function (html) {
                element.html(html);
                $compile(element.contents())(scope);
            });
        },
    };
});