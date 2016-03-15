app.controller("report_project_based_controller", function ($filter, $http, $location, myFactory, $rootScope, $scope) {
    $scope.today = new Date();
    
    $scope.get = function () {
        $http({
            url: '/report_project_based/' + $scope.project_id + '/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.dataset = data.dataset;
            else $scope.dataset = null;
            
            if ($scope.dataset !== null) {
                for (var i = 0; i < $scope.dataset.length; i++) {
                    $scope.dataset[i].total_worked = 0;
                    $scope.dataset[i].total_pm_assigned = 0;
                }
            }
        }).error(function (data, status, headers, config) {
        }).finally(function () {
            //$scope.spinneractive = false;
            //usSpinnerService.stop('spinner-1');
        });
    };

    $scope.get_modules = function (project_id) {
        $http({
            url: '/report_project_based/' + $scope.project_id + '/modules/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.dataset2 = data.dataset;
            else $scope.dataset2 = null;
            
            if ($scope.dataset2 !== null) {
                var sum_worked = 0;
                var sum_pm_assigned = 0;
                for (var j = 0; j < $scope.dataset2.length; j++) {
                    if (project_id == $scope.dataset2[j].project_id) {
                        sum_worked += parseFloat($scope.dataset2[j].items_hours);
                        sum_pm_assigned += parseFloat($scope.dataset2[j].mu_hours);
                    }
                }
                
                for (var i = 0; i < $scope.dataset.length; i++) {
                    if ($scope.dataset[i].id == project_id) {
                        $scope.dataset[i].total_worked = sum_worked;
                        $scope.dataset[i].total_pm_assigned = sum_pm_assigned;
                    }
                }
            }
        }).error(function (data, status, headers, config) {
        }).finally(function () {
            //$scope.spinneractive = false;
            //usSpinnerService.stop('spinner-1');
        });
    };
});


app.filter("calRemainingDay", function () { // register new filter
    return function (date, today) {
        var ended = new Date(date);
        var today = new Date(today);
        
        var timeDiff = Math.abs(ended.getTime() - today.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

        var remaining_days = diffDays;
        return remaining_days;
    };
});


app.directive("addModuleUsers", function ($http, $compile, myFactory) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            
            var html = "";
            element.bind("click", function () {
                //$('tr.user').remove();
                //$('#'+element[0].offsetParent.parentElement.id).nextUntil('tr.module').css('background-color', 'red');
                //$compile(element.contents())(scope);
                //scope.$apply();
                $http({
                    url: '/report_project_based/' + attrs['projectId'] + '/module/' + attrs['moduleId'] + '/users/.json?_=' + myFactory.date_time_now(),
                    method: "GET",
                    cache: false,
                    headers: { 'X-Requested-With' : 'XMLHttpRequest' }
                }).success(function (data, status, headers, config) {
                    if (data.dataset.length > 0) scope.dataset3 = data.dataset;
                    else scope.dataset3 = null;
                    
                    if (html == "") {
                        html = "<tr id='{{data2.id}}_{{data3.user_id}}' data-ng-repeat='data3 in dataset3' class='user'>" +
                                    "<td colspan='6'>" +
                                        "<a class='pointer' style='margin-left:70px;' add-module-user-items project-id='{{data2.project_id}}' module-id='{{data2.id}}' user-id='{{data3.user_id}}'><span data-ng-bind='data3.family_name'></span> <span data-ng-bind='data3.given_name'></span></a>" +
                                    "</td>" +
                                    "<td data-ng-bind='data3.hours' class='text-right'></td>" +
                                    "<td data-ng-bind='data3.mu_hours' class='text-right'></td>" +
                                    "<td data-ng-if='data3.mu_hours==0 || data3.mu_hours==null' class='text-right'><small class='badge bg-red' title='0 hour are assigned by PM'>error</small></td>" +
                                    "<td data-ng-if='data3.mu_hours>0' data-ng-bind='data3.hours/data3.mu_hours*100 | number:0' class='text-right'></td>" +
                                    "<td data-ng-if='data3.mu_hours==0 || data3.mu_hours==null' class='text-right'><small class='badge bg-red' title='0 hour are assigned by PM'>error</small></td>" +
                                    "<td data-ng-if='data3.mu_hours > 0 && data3.hours / data3.mu_hours * 100 < 100' data-ng-bind='data3.hours / data3.mu_hours * 100 | number:0' class='text-right'></td>" + 
                                    "<td data-ng-if='data3.mu_hours > 0 && data3.hours/data3.mu_hours*100 == 100' class='text-right'>-</td>" +
                                "</tr>";

                        $($compile(html)(scope)).insertAfter(angular.element(document.getElementById(element[0].offsetParent.parentElement.id)));
                    }
                
                }).error(function (data, status, headers, config) {
                }).finally(function () {
    
                });
            });
        }
    };
});


app.directive("addModuleUserItems", function ($http, $compile, myFactory) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var html = "";

            element.bind("click", function () {
                $http({
                    url: '/report_project_based/' + attrs['projectId'] + '/module/' + attrs['moduleId'] + '/items/.json?user_id='+ attrs['userId']+'&_=' + myFactory.date_time_now(),
                    method: "GET",
                    cache: false,
                    headers: { 'X-Requested-With' : 'XMLHttpRequest' }
                }).success(function (data, status, headers, config) {
                    if (data.dataset.length > 0) scope.dataset4 = data.dataset;
                    else scope.dataset4 = null;
                    
                    if (html == "") {
                        html = "<tr id='{{data2.id}}_{{data3.user_id}}_{{data4.id}}' data-ng-repeat='data4 in dataset4' class='item'>" +
                                    "<td colspan='6'><span data-ng-bind='data4.worked | date:&quot;yyyy-MM-dd&quot; : &quot;UTC&quot;' style='margin-left:100px;'></span> - <span data-ng-bind='data4.name' style='margin-left:10px;'></span></td>" +
                                    "<td data-ng-bind='data4.hours' class='text-right'></td>" +
                                    "<td></td>" +
                                    "<td></td>" +
                                    "<td></td>" +
                                "</tr>";
                        
                        element.addClass("open");
                        
                        $($compile(html)(scope)).insertAfter(angular.element(document.getElementById(element[0].offsetParent.parentElement.id)));
                    }

                    
                }).error(function (data, status, headers, config) {
                }).finally(function () {
                });
            });
        }
    };
});
