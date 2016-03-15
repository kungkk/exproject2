app.controller("report_user_based_controller", function ($filter, $http, $location, myFactory, $rootScope, $scope) {
    $scope.user_id = $rootScope.session_user_id;
    $scope.today = new Date();
    
    $scope.calcTotal = function (items) {
        var total = 0;
        angular.forEach(items, function (item) {
            if (item.active == true) {
                total = total + item.hours;
            }
        })
        
        return total;
    };
    
    $scope.dataset = [];
    
    $scope.get = function () {
        $scope.loading = true;

        $http({
            url: '/report_user_based/' + $scope.user_id + '/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.dataset = data.dataset;
            else $scope.dataset = null;

            if ($scope.dataset !== null) {
                for (var i = 0; i < $scope.dataset.length; i++) {
                    $scope.dataset[i].total_modules = '-';
                    $scope.dataset[i].total_items = '-';
                    $scope.dataset[i].total_worked = '-';
                    $scope.dataset[i].total_pm_assigned = '-';
                }
            }
        }).error(function (data, status, headers, config) {
        }).finally(function () {
            $scope.loading = false;
        });
    };

    $scope.get_projects = function (user_id) {
        $http({
            url: '/report_user_based/' + user_id + '/projects/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.dataset2 = data.dataset;
            else $scope.dataset2 = null;
            
            if ($scope.dataset2 !== null) {
                for (var i = 0; i < $scope.dataset2.length; i++) {
                    $scope.dataset2[i].total_items = '-';
                    $scope.dataset2[i].total_worked = '-';
                    $scope.dataset2[i].total_pm_assigned = '-';
                }
            }

        }).error(function (data, status, headers, config) {
        }).finally(function () {
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


app.directive("addProjectModules", function ($http, $compile, myFactory) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            
            var html = "";
            element.bind("click", function () {
                $http({
                    url: '/report_user_based/' + attrs['userId'] + '/project/' + attrs['projectId'] + '/modules/.json?_=' + myFactory.date_time_now(),
                    method: "GET",
                    cache: false,
                    headers: { 'X-Requested-With' : 'XMLHttpRequest' }
                }).success(function (data, status, headers, config) {
                    if (data.dataset.length > 0) scope.dataset3 = data.dataset;
                    else scope.dataset3 = null;
                    
                    if (html == "") {
                        var sum_total_items = 0;
                        var sum_worked = 0;
                        var sum_pm_assigned = 0;
                        for (var j = 0; j < scope.dataset3.length; j++) {
                            sum_total_items += scope.dataset3[j].Items.length; 
                            sum_worked += scope.calcTotal(scope.dataset3[j].Items);
                            sum_pm_assigned += scope.calcTotal(scope.dataset3[j].ModuleUsers);
                        }
                        
                        for (var i = 0; i < scope.dataset2.length; i++) {
                            if (scope.dataset2[i].id == attrs['projectId']) {
                                scope.dataset2[i].total_items = sum_total_items;
                                scope.dataset2[i].total_worked = sum_worked;
                                scope.dataset2[i].total_pm_assigned = sum_pm_assigned;
                            }
                        }
                        

                        html = "<tr id='{{data2.id}}_{{data3.id}}' data-ng-repeat='data3 in dataset3' class='module'>" +
                                    "<td colspan='3'><span data-ng-bind='data3.name' style='margin-left:60px;'></span>&nbsp;&nbsp;<small data-ng-if='data3.is_endless==1' class='badge bg-yellow'>Endless</small></td>" +
                                    "<td data-ng-bind='data3.Items.length' class='text-right'></td>" +
                                    "<td data-ng-bind='calcTotal(data3.Items)' class='text-right'></td>" +
                                    "<td data-ng-bind='data3.ModuleUsers[0].hours' class='text-right'></td>" +


                                    "<td data-ng-if='data3.ModuleUsers[0].hours == 0 || data3.ModuleUsers[0].hours == null' class='text-right'><small class='badge bg-red' title='0 hour are assigned by PM'>error</small></td>" +
                                    "<td data-ng-if='data3.ModuleUsers[0].hours > 0' data-ng-bind='calcTotal(data3.Items)/data3.ModuleUsers[0].hours*100 | number:0' class='text-right'></td>" +

                                    "<td data-ng-if='data3.ModuleUsers[0].hours == 0 || data3.ModuleUsers[0].hours == null' class='text-right'><small class='badge bg-red' title='0 hour are assigned by PM'>error</small></td>" +
                                    "<td data-ng-if='data3.ModuleUsers[0].hours > 0 && calcTotal(data3.Items)/data3.ModuleUsers[0].hours*100 > 100' data-ng-bind='100-calcTotal(data3.Items)/data3.ModuleUsers[0].hours*100 | number:0' class='text-right'></td>" + 
                                    "<td data-ng-if='data3.ModuleUsers[0].hours > 0 && calcTotal(data3.Items)/data3.ModuleUsers[0].hours*100 < 100' data-ng-bind='100-calcTotal(data3.Items)/data3.ModuleUsers[0].hours*100 | number:0' class='text-right'></td>" + 
                                    "<td data-ng-if='data3.ModuleUsers[0].hours > 0 && calcTotal(data3.Items)/data3.ModuleUsers[0].hours*100 == 100' class='text-right'>0</td>" +
                                    "<td class='text-right'>" +
                                        "<i data-ng-if='data3.is_completed==true' class='fa fa-check' style='color:green;'></i>" +
                                        "<i data-ng-if='data3.is_completed==false' class='fa fa-times' style='color:red;'></i>" +
                                    "</td>" +
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


app.filter("sumByKey", function () { // register new filter
    return function (data) {
        if (typeof (data) === 'undefined') {
            return 0;
        }
        var sum = 0;
        for (var i = data.length - 1; i >= 0; i--) {
            sum += parseFloat(data[i].hours);
        }
        return sum;
    };
});