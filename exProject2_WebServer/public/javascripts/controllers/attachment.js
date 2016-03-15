app.controller("attachment_controller", function ($http, $location, myFactory, $rootScope, $scope, fileUpload) {
    $scope.submit = function (form) {
        if (form.$valid) {
            form.commit();
        }
    };

    $scope.uploadFile = function () {
        var file = $scope.myFile;
        var fd = new FormData();
        fd.append('file', file);

        $http({
            url: "/attachment?item_id=" + $scope.item_id + '&_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: fd,
            transformRequest: angular.identity,
            headers: { 'Content-Type': undefined }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_items_json', $scope.module_id);
            myFactory.response_behavior(status, "POST", "attachment", data);
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "attachment", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
});



app.directive('myFormCommit', function () {
    return {
        require: "form",
        link: function (scope, element, attrs, form) {
            form.commit = function () {
                element[0].action = '/attachment/?item_id=' + scope.item_id;

                scope.data = 'none';
                scope.add = function () {
                    var f = document.getElementById('file').files[0],
                        r = new FileReader();
                    r.onloadend = function (e) {
                        $scope.data = e.target.result;
                    }
                    r.readAsBinaryString(f);
                }


                //element[0].submit();
            };
        }
    }

    
});

app.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;
                
                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

 
