app.controller("permission_controller", function ($http, $location, myFactory, $rootScope, $scope) {
    $scope.button = angular.element('form').attr('data-ng-attr-button');
    
    if ($scope.button !== 'save') {
        // #region GET API: /permission view template
        $http({
            url: '/permission?_=' + myFactory.date_time_now(),
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
        // #region GET API: /permission/###.json
        $http({
            url: $location.absUrl() + '/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.id = data.dataset[0].id;
            $scope.name = data.dataset[0].name;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
        // #endregion
    }
    
    
    // #region POST API: /form
    $scope.create = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var data = {
            name: $scope.name
        };
        
        $http({
            url: '/permission?_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_permissions_json', true);
            $scope.name = "";
            myFactory.response_behavior(status, "POST", "permission");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "permission", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
    
    // #region PUT API: /permission/###
    $scope.save = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var data = {
            name: $scope.name
        };
        
        $http({
            url: '/permission/' + $scope.id + '?_=' + myFactory.date_time_now(),
            method: "PUT",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "permission");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "permission", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
});

app.directive('ngcdPermission', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdPermission, function (html) {
                element.html(html);
                $compile(element.contents())(scope);
            });
        },
    };
});