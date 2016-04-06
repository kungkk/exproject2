app.controller("task_controller", function ($http, $location, myFactory, $rootScope, $scope) {
    $scope.mtxHours = [];
    
    for (var j = 0; j <= 31; j = j + 0.5) {
        $scope.mtxHours.push(j);
    }
    
    $scope.is_hide = true;
    $scope.hours = 0;
    
    $scope.get_projects = function () {
        $http({
            url: '/projects/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.projects = data.dataset;
            else $scope.projects = null;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.get_projects();

    // #region POST API: /user
    $scope.create = function (form) {
        //$scope.loading = true;
        //$scope.submitted = true;
        
        //if (form.$invalid) {
        //    $scope.loading = false;
        //    return;
        //}

        var data ={
            plan_id: $scope.plan_id,
            module_id: $scope.module_id,
            started: $scope.started,
            ended: $scope.ended,
            hours: $scope.hours*8
        };
        
        $http({
            url: '/task/?plan_id=' + $scope.plan_id + '&_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_tasks_json', true);
            
            $scope.project_id = "";
            //$scope.plan_id = "";
            $scope.module_id = "";
            $scope.started = "";
            $scope.ended = "";
            $scope.hours = 0;
            
            $scope.is_hide = true;

            myFactory.response_behavior(status, "POST", "task");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "task", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
    
    $scope.onchange = function () {
        $http({
            url: '/modules/.json?project_id=' + $scope.project_id + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) {
                $scope.modules = data.dataset;
                $scope.is_hide = false;
            }
            else {
                $scope.modules = null;
                $scope.is_hide = true;
            }
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };


});


app.directive('myDatePickerTask2', function () {
    return {
        link: function (scope, element, attrs, ngModel) {
            element.datepicker({
                changeMonth: true,
                changeYear: true,
                showWeek: true,
                dateFormat: "yy-mm-dd",
                firstDay: 1,
                showOtherMonths: true,
                onSelect: function (dateText, inst) {
                    element[0].value = dateText;
                    if (element[0].name == "started") scope.started = dateText;
                    if (element[0].name == "ended") scope.ended = dateText;
                    scope.$apply();
                }
            });
        }
    }
});

