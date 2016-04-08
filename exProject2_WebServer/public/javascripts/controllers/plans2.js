app.controller("plans2_controller", function ($http, myFactory, $scope) {
    var currentTime = new Date()
    $scope.years = currentTime.getFullYear();

    $scope.months = [
        { value: 1, name: "January" },
        { value: 2, name: "February" },
        { value: 3, name: "March" },
        { value: 4, name: "April" },
        { value: 5, name: "May" },
        { value: 6, name: "June" },
        { value: 7, name: "July" },
        { value: 8, name: "August" },
        { value: 9, name: "September" },
        { value: 10, name: "October" },
        { value: 11, name: "November" },
        { value: 12, name: "December" }
    ];
    
    $scope.prev = function () {
        $scope.years = $scope.years - 1;
    };
    
    $scope.next = function () {
        $scope.years = $scope.years + 1;
    };
    
    $scope.onclick = function (month) {
        $http({
            url: '/plan2/'+ $scope.years+'/'+month+'/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            window.location.href = "/plan/" + data[0].id;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };


    // #region GET API: /plans/.json
    $scope.get = function () {
        $http({
            url: '/plans/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.plans = data.dataset;
            else $scope.plans = null;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    if (configs.initial_get.plans == true) $scope.get();
    // #endregion
    
    // #region DELETE API: /plans
    $scope.delete_plan = function (plan_id, plan_year, plan_month) {
        $scope.loading = true;
        
        var month = null;
        for (var i = 0; i < $scope.months.length; i++) {
            if ($scope.months[i].value == plan_month) {
                month = $scope.months[i].name;
                break;
            }
        }

        if (window.confirm('Are you sure you want to delete this plan? \r\n\r\n"' + plan_year + " - " + month + '"')) {
            $http({
                url: "/plan/" + plan_id + "?_=" + myFactory.date_time_now(),
                method: "DELETE",
                cache: false,
                data: [],
                headers: { 'X-Requested-With' : 'XMLHttpRequest', "Content-Type": "application/json;charset=utf-8" },
            }).success(function (data, status, headers, config) {
                $scope.get();
                
                myFactory.response_behavior(status, "DELETE", "plan");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "DELETE", "plan");
            }).finally(function () {
                $scope.loading = false;
                $scope.selection = [];
            });
        }
        else {
            $scope.loading = false;
        }
    };
    // #endregion
    
    // #region listen_plural_json
    $scope.$on('on_plans_json', function (event, args) {
        $scope.get();
    });
    // #endregion
    
    $scope.selection = [];
    $scope.toggleSelection = function toggleSelection(id) {
        var idx = $scope.selection.indexOf(id);
        
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
            angular.forEach($scope.plans, function (item) {
                if (item.id == id && item.Selected == true) $scope.selection.push(id);
            });
        }
        else {
            $scope.selection.push(id);
        }
        
        var checkboxes = document.getElementsByName('chk');
        if (checkboxes.length == $scope.selection.length) document.getElementById("chkAll").checked = true;
        else document.getElementById("chkAll").checked = false;
    };
    
    $scope.checkAll = function (selectedAll) {
        $scope.selectedAll = selectedAll;
        
        var checkboxes = document.getElementsByName('chk');
        for (var i = 0; i < checkboxes.length; i++) {
            angular.forEach($scope.plans, function (item) {
                if (checkboxes[i].value == item.id) {
                    item.Selected = selectedAll;
                    
                    if (selectedAll == true) $scope.toggleSelection(item.id, null);
                    else $scope.selection = [];
                }
            });
        }
    };
});