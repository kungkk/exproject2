app.controller("plan_controller", function ($filter, $http, $location, myFactory, $rootScope, $scope) {
    $scope.button = angular.element('form').attr('data-ng-attr-button');
    
    var currentTime = new Date()
    
    var month = currentTime.getMonth() + 1;
    var year = currentTime.getFullYear();

    $scope.years = [];
    for (i = 2000; i <= 2024; i++) { 
        $scope.years.push(i);
    }
    
    $scope.months = [
        { value: 1, name: "January" },
        { value: 2, name: "February"},
        { value: 3, name: "March" },
        { value: 4, name: "April" },
        { value: 5, name: "May" },
        { value: 6, name: "June" },
        { value: 7, name: "July" },
        { value: 8, name: "August" },
        { value: 9, name: "September" },
        { value: 10, name: "October" },
        { value: 11, name: "November" },
        { value: 12, name: "December" }
    ];

    
    $scope.year = year.toString();
    $scope.month = month;
 
    if ($scope.button !== 'save') {
        // #region GET API: /plan view template
        $http({
            url: '/plan?_=' + myFactory.date_time_now(),
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
        // #region GET API: /plan/###.json
        $http({
            url: $location.absUrl() + '/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.id = data.dataset[0].id;
            $rootScope.header_title = data.dataset[0].month + " " + data.dataset[0].year;
            angular.forEach($scope.months, function (month) {
                if (month.value == data.dataset[0].month) $rootScope.header_title = month.name + " " + data.dataset[0].year;
            });
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
            month: $scope.month,
            year: parseInt($scope.year)
        };
        
        $http({
            url: '/plan?_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_plans_json', true);
            $scope.name = "";
            myFactory.response_behavior(status, "POST", "plan");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "plan", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
    
    // #region PUT API: /plan/###
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
            url: '/plan/' + $scope.id + '?_=' + myFactory.date_time_now(),
            method: "PUT",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "plan");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "plan", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion

    $scope.load_task = function (plan_id) {
        $http({
            url: '/task/?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.html = data;
            $scope.showModal = !$scope.showModal;
            $scope.modal_title = "Add Task to - " + $rootScope.header_title;
            $scope.plan_id = plan_id;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
});

app.controller("plan_tasks_controller", function ($filter, $http, $location, myFactory, $rootScope, $scope) {
    $scope.mtxManDays = [];
    for (var j = 0; j <= 31; j = j + 0.5) {
        $scope.mtxManDays.push({ id: j, name: j });
    }

    $scope.get = function () {
        $http({
            url: $location.absUrl() + '/tasks/.json?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.tasks = data.dataset;
            else $scope.tasks = null;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
            //$scope.spinneractive = false;
            //usSpinnerService.stop('spinner-1');
        });
    };

    $scope.get();
    
    $scope.onchange = function (task_id, e) {
        var data = null;
        var hour = 0;

        angular.forEach($scope.tasks, function (task, index) {
            if (task.id == task_id) {
                if (e !== null) {
                    if (e.currentTarget.nodeName == "SELECT") hour = e.currentTarget[e.currentTarget.selectedIndex].text;
                    else hour = $scope.tasks[index].hours;
                }
                else {
                    hour = $scope.tasks[index].hours;
                }
                data = {
                    started: $scope.tasks[index].started,
                    ended: $scope.tasks[index].ended,
                    hours: hour*8
                }; 
            }
        });
        
        if (data !== null) {
            $http({
                url: '/task/' + task_id + '?_=' + myFactory.date_time_now(),
                method: "PUT",
                cache: false,
                data: data,
                headers: { 'X-Requested-With' : 'XMLHttpRequest' }
            }).success(function (data, status, headers, config) {
                myFactory.response_behavior(status, "PUT", "task");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "PUT", "task", data);
            }).finally(function () {
                $scope.loading = false;
                $scope.submitted = false;
            });
        }
    };

    $scope.update = function (task_id) {
        var data = null;
        angular.forEach($scope.tasks, function (task) {
            if (task.id == task_id) {
                data = {
                    started: task.started,
                    ended: task.ended,
                    hours: task.hours
                };
            }
        });

        if (data !== null) {
            $http({
                url: '/task/' + task_id + '?_=' + myFactory.date_time_now(),
                method: "PUT",
                cache: false,
                data: data,
                headers: { 'X-Requested-With' : 'XMLHttpRequest' }
            }).success(function (data, status, headers, config) {
                myFactory.response_behavior(status, "PUT", "task");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "PUT", "task", data);
            }).finally(function () {
                $scope.loading = false;
                $scope.submitted = false;
            });
        }
    };
    
    $scope.delete_task = function (task_id, task_project_name, task_module_name) {
        $scope.loading = true;
        
        if (window.confirm('Are you sure you want to delete this task? \r\n\r\n"' + task_project_name + " : " + task_module_name + '"')) {
            $http({
                url: "/task/" + task_id + "?_=" + myFactory.date_time_now(),
                method: "DELETE",
                cache: false,
                data: [],
                headers: { 'X-Requested-With' : 'XMLHttpRequest', "Content-Type": "application/json;charset=utf-8" },
            }).success(function (data, status, headers, config) {
                $scope.get();
                
                myFactory.response_behavior(status, "DELETE", "task");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "DELETE", "task");
            }).finally(function () {
                $scope.loading = false;
                $scope.selection = [];
            });
        }
        else {
            $scope.loading = false;
        }
    };

    $scope.$on('on_tasks_json', function (event, args) {
        $scope.get();
    });

    $scope.$watch('tasks', function (newValue, oldValue) {
        if (isEmpty(newValue) == false) {
            for (var i = 0; i < newValue.length; i++) {
                newValue[i].started = $filter('date')(newValue[i].started, 'yyyy-MM-dd');
                
                var arrEndDate = newValue[i].ended.split('T');
                newValue[i].ended = $filter('date')(arrEndDate[0], 'yyyy-MM-dd');
            }
        }
    }, true);
});

app.directive('ngcdPlan', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdPlan, function (html) {
                element.html(html);
                $compile(element.contents())(scope);
            });
        },
    };
});

app.directive('ngcdTask', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdTask, function (html) {
                element.html(html);
                $compile(element.contents())(scope);
            });
        },
    };
});

app.directive('modal', function () {
    return {
        template: '<div class="modal fade">' + 
                      '<div class="modal-dialog ">' + 
                        '<div class="modal-content">' + 
                          '<div class="modal-header">' + 
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                            '<h4 class="modal-title">{{ modal_title }}</h4>' + 
                          '</div>' + 
                          '<div class="modal-body" ng-transclude></div>' + 
                        '</div>' + 
                      '</div>' + 
                    '</div>',
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: true,
        link: function postLink(scope, element, attrs) {
            scope.$watch(attrs.visible, function (value) {
                if (value == true) {
                    $(element).modal('show');
                }
                else {
                    $(element).modal('hide');
                }
            });
            
            $(element).on('shown.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = true;
                });
            });
            
            $(element).on('hidden.bs.modal', function () {
                scope.$apply(function () {
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    };
});

app.directive('myDatePickerTask', function () {
    return {
        link: function (scope, element, attrs, ngModel) {
            element.datepicker({
                changeMonth: true,
                changeYear: true,
                showWeek: true,
                dateFormat: "yy-mm-dd",
                firstDay: 1,
                showOtherMonths: true,
                onSelect: function (dateText, inst) {
                    element[0].value = dateText;
                    
                    angular.forEach(scope.tasks, function (task, index) {
                        if (task.id == element[0].dataset.attr) {
                            if (element[0].name == "started") scope.tasks[index].started = dateText;
                            if (element[0].name == "ended") scope.tasks[index].ended = dateText;
                            scope.onchange(element[0].dataset.attr, null);
                        }
                    });
                    scope.$apply();
                }
            });
        }
    }

    $scope.$watch('plans', function (newValue, oldValue) {
        if (typeof newValue !== "undefined") {
            for (var i = 0; i < newValue.length; i++) {
                for (var j = 0; j < newValue[i].Items.length; j++) {
                    newValue[i].Items[j].worked = $filter('date')(newValue[i].Items[j].worked, 'yyyy-MM-dd');
                }
            }
        }
    }, true);
});


app.directive('mySelectBox', function () {
    return {
        link: function (scope, element, attrs, ngModel) {
            element.on("change", function (e) {
                scope.onchange(element[0].dataset.attr, e);

                scope.$apply();
            });
        }
    }
});


function isEmpty(str) {
    return (!str || 0 === str.length);
}

