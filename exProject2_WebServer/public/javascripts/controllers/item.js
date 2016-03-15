app.controller("item_controller", function ($http, $location, myFactory, $rootScope, $scope) {
    $scope.mtxHours = [];
    
    for (var j = 0; j <= 24; j = j + 0.5) {
        $scope.mtxHours.push(j);
    }

    $scope.create = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var memo = $scope.item_memo;
        if ($scope.item_memo == null) memo = null;

        var data = {
            worked: $scope.item_worked,
            name: $scope.item_name,
            hours: $scope.item_hours,
            memo: memo
        };
        
        $http({
            url: '/item/?module_id=' + $scope.module_id + '&_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_items_json', $scope.module_id);
            $scope.item_name = "";
            $scope.item_hours = 0;
            $scope.item_memo = "";
            myFactory.response_behavior(status, "POST", "item");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "item", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
});
