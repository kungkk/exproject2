app.controller("member_controller", function ($http, $location, myFactory, $rootScope, $scope) {
    // #region POST API: /member
    $scope.create = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }

        var data = {
            user_id: $scope.user_id,
            project_leader: $scope.project_leader
        };
        
        $http({
            url: '/member/?project_id=' + $scope.project_id + '&_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_members_json', true);
            $scope.user_id = "";
            $scope.project_leader = false;
            myFactory.response_behavior(status, "POST", "member");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "member", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
});
