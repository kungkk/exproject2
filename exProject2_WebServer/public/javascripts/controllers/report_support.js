app.controller("report_weekly_controller", function ($filter, $http, myFactory, $rootScope, $scope) {
    var currentTime = new Date();
    
    Date.prototype.getWeek = function () {
        var onejan = new Date(this.getFullYear(), 0, 1);
        return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()) / 7);
    }
    
    var today = new Date();
    var week = today.getWeek()-1;
    var year = currentTime.getFullYear();

    $scope.years = [];
    for (i = 2000; i <= 2024; i++) {
        $scope.years.push(i);
    }
    
    $scope.mtxHours = [];
    for (var j = 0; j <= 24; j = j + 0.5) {
        $scope.mtxHours.push({ id: j, name: j });
    }
    
    $scope.year = year.toString();
    $scope.week = week;
    $scope.user_id = $rootScope.session_user_id;
    $scope.show_preview = true;
    $scope.show_chart = false;
    $scope.charts = [];
    

    $scope.get = function (item_id, table) {
        $scope.loading = true;
        $scope.show_chart = false;
        $scope.show_preview = true;

        $http({
            url: '/report_weekly/.json?year=' + $scope.year + '&week=' + $scope.week + '&user_id=' + $scope.user_id + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.dataset = [];
            $scope.issues = [];
            $scope.attachments = [];

            if (data.dataset.length > 0) {
                $scope.dataset = data.dataset;
                
                if (item_id !== null && table !== null) {
                    for (var i = 0; i < $scope.dataset.length; i++) {
                        
                        if (table == 'attachment') {
                            for (var j = 0; j < $scope.dataset[i].Attachments.length; j++) {
                                if ($scope.dataset[i].id == item_id) {
                                    $scope.attachments.push($scope.dataset[i].Attachments[j]);
                                }
                            }
                        }
                        
                        if (table == 'issue') {
                            for (var k = 0; k < $scope.dataset[i].Issues.length; k++) {
                                if ($scope.dataset[i].id == item_id) {
                                    $scope.issues.push($scope.dataset[i].Issues[k]);
                                }
                            }
                        }
                    }
                }
            }
        }).error(function (data, status, headers, config) {
        }).finally(function () {
            $scope.loading = false;
        });
    };
    
    $scope.get(null, null);
    
    $scope.onchange = function (module_id, item_id, e) {
        $scope.show_chart = false;
        $scope.show_preview = true;

        var data = null;
        var hour = 0;

        for (var j = 0; j < $scope.dataset.length; j++) {
            if ($scope.dataset[j].id == item_id) {
                if (e !== null) {
                    if (e.currentTarget.nodeName == "SELECT") {
                        hour = e.currentTarget[e.currentTarget.selectedIndex].text;
                        $scope.dataset[j].hours = hour;
                    }
                    else {
                        hour = $scope.dataset[j].hours;
                    }
                }
                else {
                    hour = $scope.dataset[j].hours;
                }
                
                data = {
                    name: $scope.dataset[j].name,
                    worked: $scope.dataset[j].worked,
                    memo: $scope.dataset[j].memo,
                    hours: hour
                };
                break;
            }
        }

        if (data !== null) {
            $http({
                url: '/item/' + item_id + '?_=' + myFactory.date_time_now(),
                method: "PUT",
                cache: false,
                data: data,
                headers: { 'X-Requested-With' : 'XMLHttpRequest' }
            }).success(function (data, status, headers, config) {
                myFactory.response_behavior(status, "PUT", "item");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "PUT", "item", data);
            }).finally(function () {
                $scope.loading = false;
                $scope.submitted = false;
            });
        }
    };
    
    $scope.chart = function () {
        $scope.show_chart = true;
        $scope.show_preview = false;

        $http({
            url: '/report_weekly/charts/.json?year=' + $scope.year + '&week=' + $scope.week + '&user_id=' + $scope.user_id + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.charts = [];
            if (data.dataset.length > 0) {
                
                angular.forEach(data.dataset, function (data, index) {
                    $scope.charts.push({ 'name': data.module_name, 'y': data.hours});
                });
            }

        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.generate_report = function (mode) {
        $http({
            url: '/report_weekly/.xlsx?year=' + $scope.year + '&week=' + $scope.week + '&user_id=' + $scope.user_id + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            if (mode == "email") {
                $scope.email();
            }
            else { 
                downloadFile(data);
            }
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.email = function () {
        $http({
            url: '/report_weekly/email?year=' + $scope.year + '&week=' + $scope.week + '&user_id=' + $scope.user_id + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            alert("Email has successfully sent.");
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.load_attachments = function (module_id, item_id, item_name, mode, signal) {
        var url = '/attachments/?item_id=' + item_id + '&_=' + myFactory.date_time_now();
        if (mode == 'add') url = '/attachment/?item_id=' + item_id + '&_=' + myFactory.date_time_now();
        
        $http({
            url: url,
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.html = data;
            $scope.item_id = item_id;
            $scope.item_name = item_name;
            $scope.module_id = module_id;
            $scope.signal = signal;
            $scope.files = "";
            
            $scope.show_issue = false;
            $scope.show_attachment = true;
            
            if (signal == false) $scope.showModal = !$scope.showModal;
            
            if (mode == 'list') {
                $scope.modal_title = "List Attachments for - " + item_name;
                $scope.get(item_id, 'attachment');

                $scope.link_text = "Go to Add Attachment";
                $scope.mode = 'add';
            }
            else {
                $scope.modal_title = "Add Attachment for - " + item_name;
                $scope.link_text = "Go to List Attachments";
                $scope.mode = 'list';
            }
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.load_issues = function (module_id, item_id, item_name, mode, signal) {
        var url = '/issues/?item_id=' + item_id + '&_=' + myFactory.date_time_now();
        if (mode == 'add') url = '/issue/?item_id=' + item_id + '&_=' + myFactory.date_time_now();
        
        $http({
            url: url,
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.html = data;
            $scope.item_id = item_id;
            $scope.item_name = item_name;
            $scope.module_id = module_id;
            $scope.signal = signal;
            
            $scope.show_issue = true;
            $scope.show_attachment = false;
            
            if (signal == false) $scope.showModal = !$scope.showModal;
            
            if (mode == 'list') {
                $scope.modal_title = "List Issues for - " + item_name;
                
                $scope.get(item_id, 'issue');
                
                $scope.link_text = "Go to Add Issue";
                $scope.mode = 'add';
            }
            else {
                $scope.modal_title = "Add Issue for - " + item_name;
                $scope.link_text = "Go to List Issues";
                $scope.mode = 'list';
            }
            
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.delete_issue = function (item_id, issue_id, issue_name) {
        $scope.loading = true;
        
        if (window.confirm('Are you sure you want to delete this issue? \r\n\r\n"' + issue_name + '"')) {
            $http({
                url: "/issue/" + issue_id + "?_=" + myFactory.date_time_now(),
                method: "DELETE",
                cache: false,
                data: [],
                headers: { 'X-Requested-With' : 'XMLHttpRequest', "Content-Type": "application/json;charset=utf-8" },
            }).success(function (data, status, headers, config) {
                $scope.get(item_id, 'issue');

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
    
    
    $scope.delete_attachment = function (item_id, attachment_id, attachment_name) {
        $scope.loading = true;
        if (window.confirm('Are you sure you want to delete this attachment? \r\n\r\n"' + attachment_name + '"')) {
            $http({
                url: "/attachment/" + attachment_id + "?_=" + myFactory.date_time_now(),
                method: "DELETE",
                cache: false,
                data: [],
                headers: { 'X-Requested-With' : 'XMLHttpRequest', "Content-Type": "application/json;charset=utf-8" },
            }).success(function (data, status, headers, config) {
                angular.forEach($scope.modules, function (module, index) {
                    if (module.id == $scope.module_id) {
                        angular.forEach(module.Items, function (item, index) {
                            if (item.id == item_id) {
                                $scope.attachments = [];
                                angular.forEach(item.Attachments, function (attachment, index) {
                                    if (attachment.id !== attachment_id) {
                                        $scope.attachments.push(attachment);
                                    }
                                });
                            }
                        });
                    }
                });
                
                $scope.get(item_id, 'attachment');
                
                myFactory.response_behavior(status, "DELETE", "attachment");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "DELETE", "attachment");
            }).finally(function () {
                $scope.loading = false;
                $scope.selection = [];
            });
        }
        else {
            $scope.loading = false;
        }
    };

    $scope.$watch('dataset', function (newValue, oldValue) {
        if (typeof newValue !== "undefined") {
            for (var i = 0; i < newValue.length; i++) {
               newValue[i].worked = $filter('date')(newValue[i].worked, 'yyyy-MM-dd');
            }
        }
    }, true);
});


app.directive('modal', function () {
    return {
        template: '<div class="modal fade">' + 
                      '<div class="modal-dialog ">' + 
                        '<div class="modal-content">' + 
                          '<div class="modal-header">' + 
                            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
                            '<h4 class="modal-title">{{ modal_title }}</h4>' + 
                            '<a class="pointer pull-right" data-ng-click="load_issues(module_id, item_id, item_name, mode, true)" style="position:absolute;top:20px;right:50px;z-index:99999" data-ng-show="show_issue">{{ link_text }}</h4>' + 
                            '<a class="pointer pull-right" data-ng-click="load_attachments(module_id, item_id, item_name, mode, true)" style="position:absolute;top:20px;right:50px;z-index:99999" data-ng-show="show_attachment">{{ link_text }}</h4>' + 
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

app.directive('ngcdElement', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdElement, function (html) {
                element.html(html);
                $compile(element.contents())(scope);
                scope.itemid = scope.item_id;
            });
        },
    };
});

app.directive('myChart', function () {
    return {
        link: function (scope, element, attrs, ngModel) {
            scope.$watch('charts', function (value) {
                var sum = 0;
                angular.forEach(scope.charts, function (chart, index) {
                    sum = sum + chart.y;
                });
                
                element.highcharts({
                    chart: {
                        plotBackgroundColor: null,
                        plotBorderWidth: null,
                        plotShadow: false,
                        type: 'pie'
                    },
                    title: {
                        text: 'Year ' + scope.year + ' Weekly Report - Week ' + scope.week
                    },
                    tooltip: {
                        pointFormat: '{series.name}: <b>{point.y} / ' + sum + '</b>'
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true,
                            cursor: 'pointer',
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                                }
                            }
                        }
                    },
                    series: [{
                            name: 'Hours',
                            colorByPoint: true,
                            data: scope.charts
                        }]
                });
            });
        }
    }
});

app.directive('myDatePicker', function () {
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
                    var week = $.datepicker.iso8601Week(new Date(dateText));
                    var date = new Date(dateText);
                    var year = date.getFullYear();
                    element[0].value = week;
                    scope.year = year;
                    scope.week = week;
                    
                    scope.$apply();
                }
            });
        }
    }
});

app.directive('myDatePickerItem', function () {
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
                    angular.forEach(scope.dataset, function (data, index) {
                        if (data.id == attrs['itemId']) {
                            scope.dataset[index].worked = dateText;  
                        }
                    });
                    
                    scope.onchange(attrs['moduleId'], attrs['itemId'], null);
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
                    scope.onchange(attrs['moduleId'], attrs['itemId'], e);
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
                scope.onchange(attrs['moduleId'], attrs['itemId'], e);
                
                scope.$apply();
            });
        }
    }
});


app.filter("sumByKey", function () { // register new filter
    return function (data, user_id) {
        if (typeof (data) === 'undefined' || typeof (user_id) === 'undefined') {
            return 0;
        }
        
        var sum = 0;
        for (var i = data.length - 1; i >= 0; i--) {
            if (data[i].user_id == user_id) {
                sum += parseFloat(data[i].hours);
            }
        }
        
        return sum;
    };
});

app.filter("filterFileName", function () { // register new filter
    return function (file_name) {
        var arrFileName = file_name.split("___");
        return arrFileName[1];
    };
});



window.downloadFile = function (filename) {
    //Creating new link node.
    var link = document.createElement('a');
    link.href = "/excel/" + filename;
    
    if (link.download !== undefined) {
        //Set HTML5 download attribute. This will prevent file from opening if supported.
        var fileName = link.href.substring(link.href.lastIndexOf('/') + 1, link.href.length);
        link.download = fileName;
    }
    
    //Dispatching click event.
    if (document.createEvent) {
        var e = document.createEvent('MouseEvents');
        e.initEvent('click', true, true);
        link.dispatchEvent(e);
        return true;
    }
    
    return true;
}