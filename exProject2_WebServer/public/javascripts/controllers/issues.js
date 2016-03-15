app.controller("issues_controller", function ($filter, $http, myFactory, $scope) {
    $scope.mode = "0";
    
    $scope.mtxSolves = [{ id: 1, name: 'Solved' }, { id: 0, name: 'Unsolved' }];

    $scope.onchange_mode = function () {
        var url = null;
        
        if ($scope.mode == "all") url = '/issues/.json?_=' + myFactory.date_time_now();
        else url = '/issues/.json?is_solved=' + $scope.mode + '&_=' + myFactory.date_time_now();
        
        $http({
            url: url,
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.issues = data.dataset;
            else $scope.issues = null;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
            //$scope.spinneractive = false;
            //usSpinnerService.stop('spinner-1');
        });
    };

    // #region GET API: /plans/.json
    $scope.get = function () {
        $http({
            url: '/issues/.json?is_solved=0&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (data.dataset.length > 0) $scope.issues = data.dataset;
            else $scope.issues = null;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    if (configs.initial_get.issues == true) $scope.get();
    // #endregion
    
    // #region DELETE API: /plans
    $scope.delete_issue = function (issue_id, issue_name) {
        $scope.loading = true;
        
        if (window.confirm('Are you sure you want to delete this issue? \r\n\r\n"' + issue_name + '"')) {
            $http({
                url: "/issue/" + issue_id + "?_=" + myFactory.date_time_now(),
                method: "DELETE",
                cache: false,
                data: [],
                headers: { 'X-Requested-With' : 'XMLHttpRequest', "Content-Type": "application/json;charset=utf-8" },
            }).success(function (data, status, headers, config) {
                $scope.get();
                
                myFactory.response_behavior(status, "DELETE", "issue");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "DELETE", "issue");
            }).finally(function () {
                $scope.loading = false;
                $scope.selection = [];
            });
        }
        else {
            $scope.loading = false;
        }
    };
    // #endregion
    
    // #region listen_plural_json
    $scope.$on('on_plans_json', function (event, args) {
        $scope.get();
    });
    // #endregion
    

    $scope.onchange_issue = function (id, due_date, e) {
        var data = null;
        var is_solved = 0;
        var date = null;

        angular.forEach($scope.issues, function (issue, index) {
            if (issue.id == id) {
                if (e !== null) {
                    if (e.currentTarget.nodeName == "SELECT") {
                        console.debug(e.currentTarget[e.currentTarget.selectedIndex].text);
                        
                        if (e.currentTarget[e.currentTarget.selectedIndex].text == 'Solved') {
                            is_solved = 1;
                            $scope.issues[index].is_solved = true;
                        }

                        if (e.currentTarget[e.currentTarget.selectedIndex].text == 'Unsolved') {
                            is_solved = 0;
                            $scope.issues[index].is_solved = false;
                        }
                    }
                    else {
                        if ($scope.issues[index].is_solved == true) is_solved = 1;
                        if ($scope.issues[index].is_solved == false) is_solved = 0;
                    }
                }
                else {
                    if ($scope.issues[index].is_solved == true) is_solved = 1;
                    if ($scope.issues[index].is_solved == false) is_solved = 0;
                }
                
                date = issue.due_date;
                if (due_date !== null) date = due_date;

                data = {
                    name: issue.name,
                    description: issue.description,
                    is_solved: is_solved,
                    due_date: date,
                    solved_note: issue.solved_note,
                };
            }
        });

        if (data !== null) {
            $http({
                url: '/issue/' + id + '?_=' + myFactory.date_time_now(),
                method: "PUT",
                cache: false,
                data: data,
                headers: { 'X-Requested-With' : 'XMLHttpRequest' }
            }).success(function (data, status, headers, config) {
                $scope.onchange_mode();
                myFactory.response_behavior(status, "PUT", "issue");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "PUT", "issue", data);
            }).finally(function () {
                $scope.loading = false;
                $scope.submitted = false;
            });
        }
    };

    $scope.$watch('issues', function (newValue, oldValue) {
        if (typeof newValue !== "undefined") {
            if (newValue !== null) {
                for (var i = 0; i < newValue.length; i++) {
                    newValue[i].due_date = $filter('date')(newValue[i].due_date, 'yyyy-MM-dd');
                }
            }
        }
    }, true);
});


app.directive('myDatePickerIssue', function () {
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
                    if (element[0].name == "due_date") element[0].value = dateText;
                    scope.onchange_issue(element[0].dataset.attr, dateText, null);
                    scope.$apply();
                }
            });
        }
    }
});

app.directive('ngModel', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            element.on("change", function (e) {
                if (element.hasClass('blur')) {
                    scope.onchange_issue(attrs['issueId'], null, e);
                }
                scope.$apply();
            });
            
            ngModel.$viewChangeListeners.push(function () {
                ngModel.$dirty = false;
            });
        }
    }
});

app.directive('mySelectBox', function () {
    return {
        link: function (scope, element, attrs, ngModel) {
            element.on("change", function (e) {
                scope.onchange_issue(element[0].dataset.attr, null, e);
                scope.$apply();
            });
        }
    }
});
