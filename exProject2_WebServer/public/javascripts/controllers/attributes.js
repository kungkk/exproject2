app.controller("attachments_controller", function ($http, myFactory, $scope) {
    $scope.get = function () {
        $http({
            url: '/attributes/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.attributes = data.dataset;
            else $scope.attributes = null;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    $scope.get();
});