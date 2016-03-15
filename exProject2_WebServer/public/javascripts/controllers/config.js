app.controller("config_controller", function ($http, $location, myFactory, $rootScope, $scope) {
    
    // #region GET API: /config/.json
    $scope.get = function () {
        $http({
            url: $location.absUrl() + '/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.config = data.dataset;
            console.debug($scope.config.session_stores.file.reapInterval);
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    $scope.get();
    // #endregion


    $scope.update = function () {
        $scope.loading = true;
        $scope.submitted = true;
        
        //if (form.$invalid) {
        //    $scope.loading = false;
        //    return;
        //}
        
        //var data = {
        //    name: $scope.name
        //};
        
        $http({
            url: '/config?_=' + myFactory.date_time_now(),
            method: "PUT",
            cache: false,
            data: $scope.config,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "config");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "config", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
});
