app.controller("permissions_controller", function ($http, myFactory, $scope) {
    // #region GET API: /permissions/.json
    $scope.get = function () {
        $http({
            url: '/permissions/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.permissions = data.dataset;
            else $scope.permissions = null;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    if (configs.initial_get.permissions == true) $scope.get();
    // #endregion
    
    // #region DELETE API: /permissions
    $scope.delete = function () {
        $scope.loading = true;
        if (window.confirm('Are you sure you want to delete?')) {
            $http({
                url: "/permissions?_=" + myFactory.date_time_now(),
                method: "DELETE",
                cache: false,
                data: $scope.selection,
                headers: { 'X-Requested-With' : 'XMLHttpRequest', "Content-Type": "application/json;charset=utf-8" },
            }).success(function (data, status, headers, config) {
                $scope.get();
                
                myFactory.response_behavior(status, "DELETE", "permissions");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "DELETE", "permissions");
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
    $scope.$on('on_permissions_json', function (event, args) {
        $scope.get();
    });
    // #endregion
    
    $scope.selection = [];
    $scope.toggleSelection = function toggleSelection(id) {
        var idx = $scope.selection.indexOf(id);
        
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
            angular.forEach($scope.permissions, function (item) {
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
            angular.forEach($scope.permissions, function (item) {
                if (checkboxes[i].value == item.id) {
                    item.Selected = selectedAll;
                    
                    if (selectedAll == true) $scope.toggleSelection(item.id, null);
                    else $scope.selection = [];
                }
            });
        }
    };
});