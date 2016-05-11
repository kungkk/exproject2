app.controller("attributes_controller", function ($http, myFactory, $scope, $rootScope) {
    $scope.attributes = [{ table_name: "users", key_id: $rootScope.session_user_id, key_name: 'to', key_value: '' },
                         { table_name: "users", key_id: $rootScope.session_user_id, key_name: 'cc', key_value: '' },
                         { table_name: "users", key_id: $rootScope.session_user_id, key_name: 'bcc', key_value: '' }];

    $scope.get = function () {
        $http({
            url: '/attributes/.json?table_name=users&key_id='+ $rootScope.session_user_id+'&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) {
                $scope.attributes = data.dataset;

                for (var i = 0; i < data.dataset.length; i++) {
                    for (var j = 0; j < $scope.attributes.length; j++) {
                        if (data.dataset[i].key_name == $scope.attributes[j].key_name) { 
                            $scope.attributes[j].key_name = data.dataset[i].key_name;
                        }
                    }
                }
            }
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    $scope.get();

    $scope.get_view = function () {
        $http({
            url: '/attributes?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.html2 = data;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };

    $scope.get_view();

    $scope.blur = function (key_name) {
        $scope.$watch('attributes', function () {
            var url = '/attribute?table_name=users&key_id=' + $rootScope.session_user_id + '&key_name=&key_value=&_=' + myFactory.date_time_now();
            for (var i = 0; i < $scope.attributes.length; i++) {
                if ($scope.attributes[i].key_name == key_name) { 
                    url = '/attribute?table_name=users&key_id=' + $rootScope.session_user_id + '&key_name='+ $scope.attributes[i].key_name+'&key_value='+ $scope.attributes[i].key_value+'&_=' + myFactory.date_time_now();
                }
            }
            

            $http({
                url: url,
                method: "POST",
                cache: false,
                data: [],
                headers: { 'X-Requested-With' : 'XMLHttpRequest' }
            }).success(function (data, status, headers, config) {
                myFactory.response_behavior(status, "POST", "attribute");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "POST", "attribute", data);
            }).finally(function () {
                $scope.loading = false;
                $scope.submitted = false;
            });
        });
    };

});


app.directive('ngcdAttributes', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdAttributes, function (html2) {
                element.html(html2);
                $compile(element.contents())(scope);
            });
        },
    };
});