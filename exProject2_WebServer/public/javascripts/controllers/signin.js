app.controller("signin_controller", function ($http, myFactory, $scope) {
    $scope.submit = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var data = {
            username: $scope.username,
            password: $scope.password
        };
        
        $http({
            url: '/signin?_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            window.location.href = "/projects";
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "signin", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
});