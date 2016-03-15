app.controller("change_password_controller", function ($scope, $http, myFactory, $rootScope) {
    $scope.loading = false;
    $scope.current_password = "";
    $scope.new_password = "";
    $scope.confirm_password = "";
    
    // #region PUT API: /change_password
    $scope.update = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        // If form is invalid, return and let AngularJS show validation errors.
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var data = {
            current_password: $scope.current_password,
            new_password: $scope.new_password,
            confirm_password: $scope.confirm_password
        };
        
        $http({
            url: '/change_password?_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "change_password");
            
            window.location.href = "/user/" + $rootScope.session_user_id;
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "change_password", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
});

// @link: http://rogeralsing.com/2013/08/26/angularjs-directive-to-check-that-passwords-match-followup/
app.directive('passwordMatch', [function () {
        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function (scope, elem , attrs, control) {
                var checker = function () {
                    
                    //get the value of the first password
                    var e1 = scope.$eval(attrs.ngModel);
                    
                    //get the value of the other password  
                    var e2 = scope.$eval(attrs.passwordMatch);
                    return e1 == e2;

                console.debug(e1+" == "+e2)
                };
                scope.$watch(checker, function (n) {
                    //set the form control to valid if both 
                    //passwords are the same, else invalid
                    control.$setValidity("unique", n);
                });
            }
        };
    }]);
