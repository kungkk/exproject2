app.controller("projects_controller", function ($http, myFactory, $scope) {

    // #region GET API: /projects/.json
    $scope.get = function () {
        $http({
            url: '/projects/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.projects = data.dataset;
            else $scope.projects = null;
            console.debug($scope.projects);
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    if (configs.initial_get.projects == true) $scope.get();
    // #endregion
    
    // #region DELETE API: /projects
    $scope.delete_project = function (project_id, project_name) {
        $scope.loading = true;

        if (window.confirm('Are you sure you want to delete this project? \r\n\r\n"' + project_name + '"')) {
            $http({
                url: "/project/" + project_id + "?_=" + myFactory.date_time_now(),
                method: "DELETE",
                cache: false,
                data: [],
                headers: { 'X-Requested-With' : 'XMLHttpRequest', "Content-Type": "application/json;charset=utf-8" },
            }).success(function (data, status, headers, config) {
                for (var i = 0; i < $scope.projects.length; i++) {
                    if ($scope.projects[i].id == project_id) {
                        $scope.projects.splice(i, 1);
                        break;
                    }
                }
                
                myFactory.response_behavior(status, "DELETE", "project");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "DELETE", "project");
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
    $scope.$on('on_projects_json', function (event, args) {
        $scope.get();
    });
    // #endregion

    $scope.selection = [];
    $scope.toggleSelection = function toggleSelection(id) {
        var idx = $scope.selection.indexOf(id);
        
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
            angular.forEach($scope.data, function (item) {
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
            angular.forEach($scope.users, function (item) {
                if (checkboxes[i].value == item.id) {
                    item.Selected = selectedAll;
                    
                    if (selectedAll == true) $scope.toggleSelection(item.id, null);
                    else $scope.selection = [];
                }
            });
        }
    };
});

app.filter("getdays", function () { // register new filter
    return function (start, end) { // filter arguments
        var d1 = new Date(start); //"now"
        var d2 = new Date(end)// some date
        var diff = Math.abs(d1 - d2);  // difference in milliseconds
        var days = diff / 86400000;
        return days.toFixed(0);
    };
});
