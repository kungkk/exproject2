app.controller("report_monthly_controller", function ($http, myFactory, $rootScope, $scope) {
    var currentTime = new Date()

    var month = currentTime.getMonth() + 1;
    var year = currentTime.getFullYear();

    $scope.years = [];
    for (i = 2000; i <= 2024; i++) {
        $scope.years.push(i);
    }
    
    $scope.months = [
        { value: 1, name: "January" },
        { value: 2, name: "February" },
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
    $scope.user_id = $rootScope.session_user_id;
    $scope.month_name = null;
    $scope.dataset = [];
    $scope.plans = [];
    $scope.worked = [];
    $scope.report_monthly = [];
    
    angular.forEach($scope.months, function (month) {
        if (month.value == $scope.month) $scope.month_name = month.name;
    });

    $scope.get = function () {
        $scope.loading = true;

        $http({
            url: '/report_monthly/.json?year=' + $scope.year + '&month=' + $scope.month + '&user_id=' + $scope.user_id + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $scope.dataset = [];
            $scope.report_monthly = [];
            $scope.categories = [];
            $scope.plans = [];
            $scope.worked = [];

            if (data.dataset.length > 0) {
                $scope.report_monthly = data.dataset;
                $scope.categories = [];
                $scope.hours = [];
                $scope.dataset = [];
                $scope.plans = [];
                $scope.worked = [];
                $scope.new = 0;

                for (var i = 0; i < $scope.report_monthly.length; i++) {
                    if (typeof $scope.report_monthly[i + 1] != 'undefined') {
                        if ($scope.report_monthly[i].status == "planed") {
                            if ($scope.report_monthly[i + 1].status == "worked") {
                                if ($scope.report_monthly[i].project_id == $scope.report_monthly[i + 1].project_id && $scope.report_monthly[i].module_id == $scope.report_monthly[i + 1].module_id) {
                                    $scope.dataset.push($scope.report_monthly[i]);
                                    $scope.dataset.push($scope.report_monthly[i + 1]);
                                    $scope.new = i + 2;
                                }
                                else {
                                    $scope.dataset.push($scope.report_monthly[i]);
                                    $scope.dataset.push({ "project_id": $scope.report_monthly[i].project_id, "project_code": $scope.report_monthly[i].project_code, "project_name": $scope.report_monthly[i].project_name, "module_id": $scope.report_monthly[i].module_id, "module_name": $scope.report_monthly[i].module_name, "started": $scope.report_monthly[i].started, "ended": $scope.report_monthly[i].ended, "hours": 0, "status": "worked" });
                                }
                            }
                            else {
                                $scope.dataset.push($scope.report_monthly[i]);
                                $scope.dataset.push({ "project_id": $scope.report_monthly[i].project_id, "project_code": $scope.report_monthly[i].project_code, "project_name": $scope.report_monthly[i].project_name, "module_id": $scope.report_monthly[i].module_id, "module_name": $scope.report_monthly[i].module_name, "started": $scope.report_monthly[i].started, "ended": $scope.report_monthly[i].ended, "hours": 0, "status": "worked" });
                            }
                        }
                        else {
                            if ($scope.report_monthly[i + 1].status == "worked") {
                                $scope.dataset.push({ "project_id": $scope.report_monthly[i].project_id, "project_code": $scope.report_monthly[$scope.new].project_code, "project_name": $scope.report_monthly[$scope.new].project_name, "module_id": $scope.report_monthly[$scope.new].module_id, "module_name": $scope.report_monthly[$scope.new].module_name, "started": $scope.report_monthly[$scope.new].started, "ended": $scope.report_monthly[$scope.new].ended, "hours": 0, "status": "planed" });
                                $scope.dataset.push($scope.report_monthly[$scope.new]);
                            }
                        }
                    }
                    else {
                        if ($scope.report_monthly[i].status == "planed") { 
                            $scope.dataset.push($scope.report_monthly[i]);
                            $scope.dataset.push({ "project_id": $scope.report_monthly[i].project_id, "project_code": $scope.report_monthly[i].project_code, "project_name": $scope.report_monthly[i].project_name, "module_id": $scope.report_monthly[i].module_id, "module_name": $scope.report_monthly[i].module_name, "started": $scope.report_monthly[i].started, "ended": $scope.report_monthly[i].ended, "hours": 0, "status": "worked" });
                        }
                    }
                }

                for (var i = 0; i < $scope.dataset.length; i++) {
                    if ((i % 2) == 1) {
                        
                        var project_name = $scope.dataset[i].project_name;
                        if ($scope.dataset[i].project_name.length >= 10) {
                            project_name = $scope.dataset[i].project_name.substring(0, 10) + "...";
                        }
                        
                        var module_name = $scope.dataset[i].module_name + " - ";
                        if ($scope.dataset[i].module_name.length >= 30) {
                            module_name = $scope.dataset[i].module_name.substring(0, 30) + "...";
                        }
                        
                        $scope.categories.push(project_name + " - " + module_name);
                    }
                    
                    if ($scope.dataset[i].status == "planed") {
                        $scope.plans.push(Math.round(($scope.dataset[i].hours / 8) * 100) / 100);
                    }
                    
                    if ($scope.dataset[i].status == "worked") {
                        $scope.worked.push(Math.round(($scope.dataset[i].hours / 8) * 100) / 100);
                    }
                }
            }

            
        }).error(function (data, status, headers, config) {
        }).finally(function () {
            $scope.loading = false;
        });
    };
    
    $scope.get();

});

app.directive('myChart', function () {
    return {
        link: function (scope, element, attrs, ngModel) {
            scope.$watch('plans', function (value) {
                var sum_plan = scope.plans.reduce(function (a, b) {
                    return a + b;
                }, 0);
                
                var sum_worked = scope.worked.reduce(function (c, d) {
                    return c + d;
                }, 0);
                
                scope.total_hours_plan = sum_plan*8;
                scope.total_hours_worked = sum_worked * 8;
                scope.total_days_plan = sum_plan;
                scope.total_days_worked = sum_worked;
                            
                element.highcharts({
                    chart: {
                        type: 'bar'
                    },
                    title: {
                        text: scope.month_name + " - Year " + scope.year + " Plan"
                    },
                    subtitle: {
                        text: ''
                    },
                    xAxis: {
                        categories: scope.categories,
                        title: {
                            text: null
                        }
                    },
                    yAxis: {
                        min: 0,
                        max: Math.max.apply(null, scope.plans),
                        title: {
                            text: 'Man Days',
                            align: 'high'
                        },
                        labels: {
                            overflow: 'justify'
                        }
                    },
                    tooltip: {
                        valueSuffix: ' Days'
                    },
                    plotOptions: {
                        bar: {
                            dataLabels: {
                                enabled: true,
                                format: '{y} days'
                            }
                        }
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'top',
                        x: -40,
                        y: 80,
                        floating: true,
                        borderWidth: 1,
                        backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
                        shadow: true
                    },
                    credits: {
                        enabled: false
                    },
                    series: [{
                            name: 'Worked',
                            data: scope.worked
                        }, {
                            name: 'Plan',
                            data: scope.plans
                        }]
                });

            });
        }
    }
});