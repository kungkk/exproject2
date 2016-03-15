app.controller("report_issues_controller", function ($http, myFactory, $scope) {
    $scope.mode = "0";

    // #region GET API: /plans/.json
    $scope.get = function () {
        $http({
            url: '/report_issues/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.issues = data.dataset;
            else $scope.issues = null;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };

    $scope.get();
    // #endregion
});