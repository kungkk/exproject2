app.controller("module_controller", function ($filter, $http, $location, myFactory, $rootScope, $scope) {

    $scope.get = function (module_id) {
        // #region GET API: /items/.json?module_id=###
        $http({
            url: '/module/'+ $scope.module_id +'/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.module_name = data.dataset[0].name;
            $scope.module_plan_started = data.dataset[0].plan_started;
            $scope.module_plan_ended = data.dataset[0].plan_ended;
            $scope.module_started = data.dataset[0].started;
            $scope.module_ended = data.dataset[0].ended;
            $scope.module_note = data.dataset[0].note;

            $scope.module_is_completed = false;
            if (data.dataset[0].is_completed == 1) $scope.module_is_completed = true;
            
            $scope.module_is_endless = false;
            if (data.dataset[0].is_endless == 1) $scope.module_is_endless = true;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
 

    // #region POST API: /user
    $scope.create = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        //if (form.$invalid) {
        //    $scope.loading = false;
        //    return;
        //}
        var data = {
            project_id: $scope.project_id,
            name: form.module_name.$modelValue
        };
        
        $http({
            url: '/module/?project_id=' + $scope.project_id + '&_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_modules_json', true);
            
            $scope.module_name = "";
            myFactory.response_behavior(status, "POST", "module");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "module", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion

    // #region PUT API: /project/###
    $scope.save = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        //if (form.$invalid) {
        //    $scope.loading = false;
        //    return;
        //}
        var plan_started = '';
        if ($scope.module_plan_started== null || $scope.module_plan_started == '') plan_started = '';

        var plan_ended = '';
        if ($scope.module_plan_ended== null || $scope.module_plan_ended == '') plan_ended = '';

        var started = '';
        if ($scope.module_started == null || $scope.module_started == '') started = '';

        var ended = '';
        if ($scope.module_ended == null || $scope.module_ended == '') ended = '';
        
        var note = '';
        if ($scope.module_note == null || $scope.module_note == '') note = '';

        var data = {
            name: $scope.module_name,
            plan_started: plan_started,
            plan_ended: plan_ended,
            started: started,
            ended: ended,
            is_completed: $scope.module_is_completed,
            is_endless: $scope.module_is_endless,
            note: note
        };
        
        $http({
            url: '/module/' + $scope.module_hidden_id + '?_=' + myFactory.date_time_now(),
            method: "PUT",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_modules_json', true);
            myFactory.response_behavior(status, "PUT", "module");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "module", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion

    $scope.$on('on_module_json', function (event, args) {
        $scope.module_name = args.name;
        
        if (args.plan_started !== null) $scope.module_plan_started = args.plan_started.substring(0, 10);
        else $scope.module_plan_started = null;

        if (args.plan_ended !== null) $scope.module_plan_ended = args.plan_ended.substring(0, 10);
        else $scope.module_plan_ended = null;

        if (args.started !== null) $scope.module_started = args.started.substring(0, 10);
        else $scope.module_started = null;

        if (args.ended !== null) $scope.module_ended = args.ended.substring(0, 10);
        else $scope.module_ended = null;

        $scope.module_note = args.note;

        $scope.module_is_completed = false;
        if (args.is_completed == 1) $scope.module_is_completed = true;
        
        $scope.module_is_endless = false;
        if (args.is_endless == 1) $scope.module_is_endless = true;
    });

    $scope.$on('on_module2_json', function (event, args) {
        $scope.module_name = "";
    });
});


app.controller("module_users_controller", function ($http, $location, myFactory, $rootScope, $scope) {
    $scope.users_checked = { items: {} };

    $scope.get = function () {
        // #region GET API: /items/.json?module_id=###
        $http({
            url: '/module/' + $scope.module_id + '/users/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.module_users = [];
            if (data.dataset.length > 0) {
                $scope.module_users = data.dataset;

                angular.forEach($scope.module_users, function (item) {
                    if (item.checkbox == 1) $scope.users_checked.items[item.user_id] = true;
                    else $scope.users_checked.items[item.user_id] = false;
                });
            }
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.get();
    
    $scope.$on('on_module_users_json', function (event, args) {
        $scope.get();
    });
    
    // #region POST API: /user
    $scope.create = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var data = {
            porject_id: $scope.project_id,
            name: $scope.module_name
        };
        
        $http({
            url: '/module/?project_id=' + $scope.project_id + '&_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_modules_json', true);
            $scope.module_name = "";
            myFactory.response_behavior(status, "POST", "module");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "module", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
    
    $scope.update = function () {
        //$scope.loading = true;
        //$scope.submitted = true;
        
        //if (form.$invalid) {
        //    $scope.loading = false;
        //    return;
        //}
        
        //var data = {
        //    name: $scope.name
        //};
        
        $http({
            url: '/module/' + $scope.module_id + '/users?_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: $scope.module_users,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_items_json', $scope.module_id);
            myFactory.response_behavior(status, "PUT", "module_users");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "module_users", data);
        }).finally(function () {
            //$scope.loading = false;
            //$scope.submitted = false;
        });
    };
    
    
    $scope.onchange = function (module_user_id) {
        angular.forEach($scope.module_users, function (item, index) {
            if (item.module_user_id == module_user_id) { 
                $scope.module_users[index].is_dirty_put = 1;
            }
        });
        
    };
    

    $scope.toggle_module_users = function (index, module_user_id, user_id) {
        if ($scope.users_checked.items[user_id] == true) {
            $scope.module_users[index].checkbox = 1;
            
            if (module_user_id == null) {
                $scope.module_users[index].is_dirty = 1;
                $scope.module_users[index].http_method = 'POST';
                $scope.module_users[index].hours = 0;
            }
            else {
                $scope.module_users[index].is_dirty = 0;
                $scope.module_users[index].http_method = null;
                $scope.module_users[index].hours = null;
            }
        }
        else {
            $scope.module_users[index].checkbox = 0;
            
            if (module_user_id == null) {
                $scope.module_users[index].is_dirty = 0;
                $scope.module_users[index].http_method = null;
            }
            else {
                $scope.module_users[index].is_dirty = 1;
                $scope.module_users[index].http_method = 'DELETE';
            }
        }
    };
});
