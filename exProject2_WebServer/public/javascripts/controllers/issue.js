app.controller("issue_controller", function ($http, $location, myFactory, $rootScope, $scope) {
    $scope.create = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var description = "";
        if ($scope.description != '') {
            description = $scope.description;
        }
        
        var data = {
            name: $scope.issue_name,
            description: description
        };
        
        $http({
            url: '/issue/?item_id=' + $scope.item_id + '&_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_items_json', $scope.module_id);
            $scope.issue_name = "";
            $scope.description = "";
            myFactory.response_behavior(status, "POST", "issue");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "issue", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
});
