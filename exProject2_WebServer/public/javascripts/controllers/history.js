app.controller("history_controller", function ($http, $location, myFactory, $rootScope, $scope) {
    if ($location.absUrl().match(/module_id/g) == 'module_id') $rootScope.header_title = "Modules";
    if ($location.absUrl().match(/project_id/g) == 'project_id') $rootScope.header_title = "Projects";

    // #region GET API: /history/.json?module_id=###
    $scope.get = function () {
        var arrURL = $location.absUrl().split("?");

        $http({
            url: '/history/.json?' + arrURL[1] + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset !== null) {
                if (data.dataset.length > 0) $scope.histories = data.dataset;
                else $scope.histories = null;
            }
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    $scope.get();
    // #endregion
});