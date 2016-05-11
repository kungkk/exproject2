app.controller("user_controller", function ($http, $location, myFactory, $rootScope, $scope) {
    $scope.button = angular.element('form').attr('data-ng-attr-button');

    if ($scope.button !== 'save') {
        // #region GET API: /user view template
        $http({
            url: '/user?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.html = data;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
        // #endregion
    }
    else {
        // #region GET API: /user/###.json
        $http({
            url: $location.absUrl() + '/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.id = data.dataset[0].id;
            $scope.username = data.dataset[0].username;
            $scope.email = data.dataset[0].email;
            $scope.family_name = data.dataset[0].family_name;
            $scope.given_name = data.dataset[0].given_name;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
        // #endregion
    }
    
    // #region POST API: /user
    $scope.create = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        if ($scope.family_name == null || $scope.family_name == "") $scope.family_name = "";
        if ($scope.given_name == null || $scope.given_name == "") $scope.given_name = "";

        
        var data = {
            username: $scope.username,
            password: $scope.password,
            email: $scope.email,
            position: $scope.position,
            family_name: $scope.family_name,
            given_name: $scope.given_name
        };
        
        $http({
            url: '/user?_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_users_json', true);
            $scope.username = "";
            $scope.password = "";
            $scope.email = "";
            $scope.super = "";
            $scope.position = "";
            $scope.family_name = "";
            $scope.given_name = "";
            myFactory.response_behavior(status, "POST", "user");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "user", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
    
    // #region PUT API: /user/###
    $scope.save = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var data = {
            username: $scope.username,
            email: $scope.email,
            family_name: $scope.family_name,
            given_name: $scope.given_name
        };

        $http({
            url: '/user/' + $scope.id + '?_=' + myFactory.date_time_now(),
            method: "PUT",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "user");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "user");
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
});


app.directive('ngcdUser', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdUser, function (html) {
                element.html(html);
                $compile(element.contents())(scope);
            });
        },
    };
});

