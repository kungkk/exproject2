app.controller("project_controller", function ($filter, $http, $location, myFactory, $rootScope, $scope) {
    $rootScope.table_name = "modules";
    $scope.button = angular.element('form').attr('data-ng-attr-button');
    $scope.show_issue = false;
    $scope.show_attachment = false;
    $scope.show_module = true;
    $scope.module_status = "0";
    $scope.to = "";
    $scope.cc = "";
    $scope.bcc = "";
    
    $scope.attributes = [{ id: 1, table_name: $rootScope.table_name, key_id: $rootScope.session_user_id, key_name: 'to', key_value: '' },
                         { id: 2, table_name: $rootScope.table_name, key_id: $rootScope.session_user_id, key_name: 'cc', key_value: '' },
                         { id: 3, table_name: $rootScope.table_name, key_id: $rootScope.session_user_id, key_name: 'bcc', key_value: '' }];
    
    $scope.attributes.sort(function (a, b) {
        return a.id - b.id;
    });
    
    var currx = new Date();
    var today = currx.getFullYear() + "-" + n(currx.getMonth() + 1) + "-" + n(currx.getDate());
    var firstday = new Date(currx.setDate(currx.getDate() - currx.getDay() + 1));
    var lastday = new Date(currx.setDate(currx.getDate() - currx.getDay() + 5));
    var first_day_of_week = firstday.getFullYear() + "-" + n(firstday.getMonth() + 1) + "-" + n(firstday.getDate());
    var last_day_of_week = lastday.getFullYear() + "-" + n(lastday.getMonth() + 1) + "-" + n(lastday.getDate());
    
    $scope.items_filter_from_date = first_day_of_week;
    $scope.items_filter_to_date = last_day_of_week;

    $scope.mtxHours = [];
    for (var j = 0; j <= 24; j=j+0.5) {
        $scope.mtxHours.push({ id:j, name:j });
    }
    
    $scope.calcTotal = function (items) {
        var total = 0;
        angular.forEach(items, function (item) {
            if (item.active == true) {
                total = total + item.hours;
            }
        })
        
        return total;
    };
    
    $scope.mtxSolves = [{ id: 1, name: 'Solved' }, { id: 0, name: 'Unsolved' }];

    $scope.get = function () {
        // #region GET API: /project/###.json
        $http({
            url: $location.absUrl() + '/.json?from_date=' + first_day_of_week + '&to_date=' + last_day_of_week + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.title = " - " + data.dataset[0].name;
            $scope.project_id = data.dataset[0].id;
            $scope.code = data.dataset[0].code;
            $scope.name = data.dataset[0].name;

            var arrPlanStarted = data.dataset[0].plan_started.split('T');
            $scope.plan_started = arrPlanStarted[0];
            var arrPlanEnded = data.dataset[0].plan_ended.split('T');
            $scope.plan_ended = arrPlanEnded[0];
            var arrStarted = data.dataset[0].started.split('T');
            $scope.started = arrStarted[0];
            var arrEnded = data.dataset[0].ended.split('T');
            $scope.ended = arrEnded[0];

            if (data.dataset[0].note == null || data.dataset[0].note == "null") $scope.note = "";
            else $scope.note = data.dataset[0].note;
            
            $scope.modules = data.dataset[0].Modules;
            $scope.members = data.dataset[0].Members;

            angular.forEach($scope.modules, function (module, index) {
                $scope.modules[index].from_date = first_day_of_week;
                $scope.modules[index].to_date = last_day_of_week;
              
            });
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
        // #endregion
    };

    if ($scope.button !== 'save') {
        // #region GET API: /project view template
        $http({
            url: '/project?_=' + myFactory.date_time_now(),
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
        $scope.get();
    }

    $scope.create = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var data = {
            code: $scope.code,
            name: $scope.name,
            plan_started: $scope.plan_started,
            plan_ended: $scope.plan_ended,
            started: $scope.started,
            ended: $scope.ended
        };
        
        $http({
            url: '/project?_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            $rootScope.$broadcast('on_projects_json', true);
            $scope.code = "";
            $scope.name = "";
            $scope.plan_started = "";
            $scope.plan_ended = "";
            $scope.started = "";
            $scope.ended = "";
            myFactory.response_behavior(status, "POST", "project");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "project", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    
    
    // #region PUT API: /project/###
    $scope.save = function (form) {
        $scope.loading = true;
        $scope.submitted = true;
        
        if (form.$invalid) {
            $scope.loading = false;
            return;
        }
        
        var data = {
            code: $scope.code,
            name: $scope.name,
            plan_started: $scope.plan_started,
            plan_ended: $scope.plan_ended,
            started: $scope.started,
            ended: $scope.ended,
            note: $scope.note
        };
        
        $http({
            url: '/project/' + $scope.project_id + '?_=' + myFactory.date_time_now(),
            method: "PUT",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "project");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "PUT", "project", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    // #endregion
    
    $scope.delete_item = function (module_id, item_id, item_name) {
        $scope.loading = true;
        if (window.confirm('Are you sure you want to delete this item? \r\n\r\n"' + item_name + '"')) {
            $http({
                url: "/item/"+ item_id + "?_=" + myFactory.date_time_now(),
                method: "DELETE",
                cache: false,
                data: [],
                headers: { 'X-Requested-With' : 'XMLHttpRequest', "Content-Type": "application/json;charset=utf-8" },
            }).success(function (data, status, headers, config) {
                $scope.get();
                
                myFactory.response_behavior(status, "DELETE", "item");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "DELETE", "item");
            }).finally(function () {
                $scope.loading = false;
                $scope.selection = [];
            });
        }
        else {
            $scope.loading = false;
        }
    };
    
    $scope.delete_member = function (member_id, member_familyname, member_givenname) {
        $scope.loading = true;
        if (window.confirm('Are you sure you want to delete this member? \r\n\r\n"' + member_familyname + ' ' + member_givenname + '"')) {
            $http({
                url: "/member/" + member_id + "?_=" + myFactory.date_time_now(),
                method: "DELETE",
                cache: false,
                data: [],
                headers: { 'X-Requested-With' : 'XMLHttpRequest', "Content-Type": "application/json;charset=utf-8" },
            }).success(function (data, status, headers, config) {
                for (var i = 0; i < $scope.members.length; i++) {
                    if ($scope.members[i].id == member_id) {
                        $scope.members.splice(i, 1);
                        break;
                    }
                }
                
                myFactory.response_behavior(status, "DELETE", "member");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "DELETE", "member");
            }).finally(function () {
                $scope.loading = false;
                $scope.selection = [];
            });
        }
        else {
            $scope.loading = false;
        }
    };

    $scope.delete_module = function (module_id, module_name) {
        $scope.loading = true;
        if (window.confirm('Are you sure you want to delete this module? \r\n\r\n"' + module_name + '"')) {
            $http({
                url: "/module/" + module_id + "?_=" + myFactory.date_time_now(),
                method: "DELETE",
                cache: false,
                data: [],
                headers: { 'X-Requested-With' : 'XMLHttpRequest', "Content-Type": "application/json;charset=utf-8" },
            }).success(function (data, status, headers, config) {
                for (var i = 0; i < $scope.modules.length; i++) {
                    if ($scope.modules[i].id == module_id) {
                        $scope.modules.splice(i, 1);
                        break;
                    }
                }
                
                myFactory.response_behavior(status, "DELETE", "module");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "DELETE", "module");
            }).finally(function () {
                $scope.loading = false;
                $scope.selection = [];
            });
        }
        else {
            $scope.loading = false;
        }
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
                for (var i = 0; i < $scope.issues.length; i++) {
                    if ($scope.issues[i].id == issue_id) {
                        $scope.issues.splice(i, 1);
                        break;
                    }
                }
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
                
                $scope.get();
                
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
    
    $scope.load_issues = function (item_id, item_name, module_id, mode, signal) {
        var url = '/issues/?item_id=' + item_id + '&_=' + myFactory.date_time_now();
        if (mode == true) url = '/issue/?item_id=' + item_id + '&_=' + myFactory.date_time_now();

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

            if (mode == false) {
                $scope.modal_title = "List Issues for - " + item_name;
               
                for (var i = 0; i < $scope.modules.length; i++) {
                    if ($scope.modules[i].id == module_id) {
                        for (var j = 0; j < $scope.modules[i].Items.length; j++) {
                            if ($scope.modules[i].Items[j].id == item_id) {
                                $scope.issues = null
                                $scope.issues = $scope.modules[i].Items[j].Issues;
                                break;
                            }
                        }
                    }
                }

                $scope.link_text = "Go to Add Issue";
                $scope.mode = true;
            }
            else {
                $scope.modal_title = "Add Issue";
                $scope.link_text = "Go to List Issues";
                $scope.mode = false;
            }
            
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.load_attachments = function (item_id, item_name, module_id, mode, signal) {
        var url = '/attachments/?item_id=' + item_id + '&_=' + myFactory.date_time_now();
        if (mode == true) url = '/attachment/?item_id=' + item_id + '&_=' + myFactory.date_time_now();
        
        $http({
            url: url,
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.attachments = [];
            $scope.html = data;
            $scope.item_id = item_id;
            $scope.item_name = item_name;
            $scope.module_id = module_id;
            $scope.signal = signal;
            $scope.files = "";
            
            $scope.show_issue = false;
            $scope.show_attachment = true;
            
            if (signal == false) $scope.showModal = !$scope.showModal;

            if (mode == false) {
                $scope.modal_title = "List Attachments for - " + item_name;
                
                for (var i = 0; i < $scope.modules.length; i++) {
                    if ($scope.modules[i].id == module_id) {
                        for (var j = 0; j < $scope.modules[i].Items.length; j++) {
                            if ($scope.modules[i].Items[j].id == item_id) {
                                $scope.attachments = null
                                $scope.attachments = $scope.modules[i].Items[j].Attachments;
                                break;
                            }
                        }
                    }
                }

                $scope.link_text = "Go to Add Attachment";
                $scope.mode = true;
            }
            else {
                $scope.modal_title = "Add Attachment";
                $scope.link_text = "Go to List Attachments";
                $scope.mode = false;
            }          
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.load_attributes = function (module_id, module_name, signal) {
        
        for (var k = 0; k < $scope.attributes.length; k++) {
                $scope.attributes[k].key_value = '';
        }

        $http({
            url: '/attributes?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.html = data;
            $scope.module_id = module_id;
            $scope.modal_title = "Set receiver's email for - " + module_name;
            if (signal == false) $scope.showModal = !$scope.showModal;

            $http({
                url: '/attributes/.json?table_name=' + $rootScope.table_name + '&key_id=' + module_id + '&_=' + myFactory.date_time_now(),
                method: "GET",
                cache: false,
                headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
            }).success(function (data, status, headers, config) {
                if (data.dataset.length > 0) {
                    for (var i = 0; i < data.dataset.length; i++) {
                        for (var j = 0; j < $scope.attributes.length; j++) {
                            
                            if (data.dataset[i].key_name == $scope.attributes[j].key_name) {
                                $scope.attributes[j].key_value = data.dataset[i].key_value;
                            }
                        }
                    }
                }
            }).error(function (data, status, headers, config) {
            }).finally(function () {
            });
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        }); 
    };
    
    $scope.load_item = function (module_id) {
        //var curr = new Date();
        //var today = curr.getFullYear() + "-" + n(curr.getMonth() + 1) + "-" + n(curr.getDay());

        $http({
            url: '/item/?module_id=' + module_id + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.html = data;
            $scope.showModal = !$scope.showModal;
            $scope.modal_title = "Add Item";
            $scope.element_id = module_id;
            $scope.module_id = module_id;
            $scope.item_name = "";
            $scope.item_worked = today;
            $scope.item_hours = "0";
            $scope.show_issue = false;
            $scope.show_attachment = false;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };

    $scope.load_module = function (module_id, inx) {
        $http({
            url: '/module/?project_id=' + $scope.project_id + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.html = data;
            $scope.showModal = !$scope.showModal;
            $scope.modal_title = "Add New Module";
            $scope.element_id = module_id;
            $scope.is_edit = true;

            $scope.module_name = null;
            $scope.show_issue = false;
            $scope.show_attachment = false;
            $scope.show_module = true;
            
            $rootScope.$broadcast('on_module2_json', true);

            if (module_id > 0) {
                $http({
                    url: '/module/' + module_id + '/.json?_=' + myFactory.date_time_now(),
                    method: "GET",
                    cache: false,
                    headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
                }).success(function (data, status, headers, config) {
                    $rootScope.$broadcast('on_module_json', data.dataset[0]);
                    $scope.is_edit = false;
                    $scope.module_hidden_id = data.dataset[0].id;
                    $scope.modal_title = "Edit Module - " + data.dataset[0].name;
                    $scope.module_name = data.dataset[0].name;
                    
                    if (data.dataset[0].plan_started !== null) $scope.module_plan_started = data.dataset[0].plan_started.substring(0, 10);
                    else $scope.module_plan_started = null;

                    if (data.dataset[0].plan_ended !== null) $scope.module_plan_ended = data.dataset[0].plan_ended.substring(0, 10);
                    else $scope.module_plan_ended = null;

                    if (data.dataset[0].started !== null) $scope.module_started = data.dataset[0].started.substring(0, 10);
                    else $scope.module_started = null;

                    if (data.dataset[0].ended !== null) $scope.module_ended = data.dataset[0].ended.substring(0, 10);
                    else $scope.module_ended = null;

                    $scope.module_note = data.dataset[0].note;

                    $scope.module_is_completed = false;
                    if (data.dataset[0].is_completed == 1) $scope.module_is_completed = true;
                    
                    $scope.module_is_endless = false;
                    if (data.dataset[0].is_endless == 1) $scope.module_is_endless = true;
                        
                }).error(function (data, status, headers, config) {
                }).finally(function () {
                });
            }

        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.load_module_users = function (module_id, module_name) {
        $http({
            url: '/module/?project_id=' + $scope.project_id + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.show_module = false;
            $scope.html = data;
            $scope.showModal = !$scope.showModal;
            $scope.modal_title = "Developers of Module: " + module_name;
            $scope.element_id = module_id;
            $scope.module_id = module_id;
            $scope.is_edit = true;
            $scope.module_name = "";
            
            $scope.show_issue = false;
            $scope.show_attachment = false;

            $rootScope.$broadcast('on_module_users_json', true);
            
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    $scope.load_member = function (member_id) {
        $http({
            url: '/member/?project_id=' + $scope.project_id + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.html = data;
            $scope.showModal = !$scope.showModal;
            $scope.modal_title = "Add New Member";
            $scope.member_id = member_id;

            $scope.show_issue = false;
            $scope.show_attachment = false;
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    
    $scope.load_report_support = function (module_id, item_id, item_name, signal) {
        $http({
            url: '/report_support?_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            $scope.html = data;
            $scope.module_id = module_id;
            $scope.modal_title = "Send Email";
            if (signal == false) $scope.showModal = !$scope.showModal;



            $http({
                url: '/report_support/.json?module_id='+module_id+'&_=' + myFactory.date_time_now(),
                method: "GET",
                cache: false,
                headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
            }).success(function (data, status, headers, config) {
                console.debug(data);
                for (var i=0; i<data.dataset.length; i++) {
                    if (data.dataset[i].key_name == "to") $scope.to = data.dataset[i].key_value;
                    if (data.dataset[i].key_name == "cc") $scope.cc = data.dataset[i].key_value;
                    if (data.dataset[i].key_name == "bcc") $scope.bcc = data.dataset[i].key_value;
                }
            }).error(function (data, status, headers, config) {
            }).finally(function () {
            });

            $http({
                url: '/report_support/.json?item_id=' + item_id + '&_=' + myFactory.date_time_now(),
                method: "GET",
                cache: false,
                headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
            }).success(function (data, status, headers, config) {
                var curr = new Date();
                var today = curr.getFullYear() + "-" + n(curr.getMonth() + 1) + "-" + n(curr.getDay());
                $scope.subject = "Service Report - [ " + data.dataset[0].name + " ] - " + today;
                $scope.body = "Dear Sir/Madam," + 
                              "<br/><br/>" +
                              "As per your company requested, our staffs come over to your side to support you, to handle your any IT issue. " +
                              "So that we're wishing you to signed our attendance for this day." + 
                              "<br/><br/>" + 
                              "Thank you." +
                              "<br/><br/><br/>" + 
                              "________________________" +
                              "<br/>" + 
                              "(Name:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)";

            }).error(function (data, status, headers, config) {
            }).finally(function () {
            });
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });
    };
    
    
    $scope.send = function (form) {
        console.debug($scope.bcc);
        var data = {
            to: $scope.to,
            cc: $scope.cc,
            bcc: $scope.bcc,
            subject: $scope.subject,
            body: $scope.body
        };

        $http({
            url: '/report_support/email?_=' + myFactory.date_time_now(),
            method: "POST",
            cache: false,
            data: data,
            headers: { 'X-Requested-With' : 'XMLHttpRequest' }
        }).success(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "attribute");
        }).error(function (data, status, headers, config) {
            myFactory.response_behavior(status, "POST", "attribute", data);
        }).finally(function () {
            $scope.loading = false;
            $scope.submitted = false;
        });
    };
    
    

    // #region listen_plural_json
    $scope.$on('on_modules_json', function (event, args) {
        $scope.get();
    });

    $scope.$on('on_members_json', function (event, args) {
        $scope.get();
    });

    $scope.$on('on_items_json', function (event, args) {
        $scope.get_items(args);
    });

    $scope.$on('on_issues_json', function (event, args) {
        $scope.get();
    });
    
    $scope.$on('on_attachments_json', function (event, args) {
        $scope.get();
    });
    // #endregion
    
    $scope.onchange = function (module_id, item_id, e) {
        //console.debug(form);
        var data = null;
        var hour = 0;
        
        for (var i = 0; i < $scope.modules.length; i++) {
            if ($scope.modules[i].id == module_id) { 
                for (var j = 0; j < $scope.modules[i].Items.length; j++) {
                    if ($scope.modules[i].Items[j].id == item_id) {
                        if (e !== null) {
                            if (e.currentTarget.nodeName == "SELECT") {
                                hour = e.currentTarget[e.currentTarget.selectedIndex].text;
                                $scope.modules[i].Items[j].hours = hour;
                            }
                            else {
                                hour = $scope.modules[i].Items[j].hours;
                            }
                        }
                        else { 
                            hour = $scope.modules[i].Items[j].hours;
                        }
                        
                        data = {
                            name: $scope.modules[i].Items[j].name,
                            worked: $scope.modules[i].Items[j].worked,
                            memo: $scope.modules[i].Items[j].memo,
                            hours: hour
                        };
                        break;
                    }
                }
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
                myFactory.response_behavior(status, "PUT", "issue");
            }).error(function (data, status, headers, config) {
                myFactory.response_behavior(status, "PUT", "issue", data);
            }).finally(function () {
                $scope.loading = false;
                $scope.submitted = false;
            });
        }
    };
    
    $scope.view = function () {
        angular.forEach($scope.modules, function (module, index) {
            $http({
                url: '/items/.json?module_id=' + module.id + '&from_date=' + $scope.items_filter_from_date + '&to_date=' + $scope.items_filter_to_date + '&_=' + myFactory.date_time_now(),
                method: "GET",
                cache: false,
                headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
            }).success(function (data, status, headers, config) {
                for (var i = 0; i < $scope.modules.length; i++) {
                    if ($scope.modules[i].id == module.id) {
                        $scope.modules[i].Items = null;
                        $scope.modules[i].Items = data.dataset;
                        break;
                    }
                }
            }).error(function (data, status, headers, config) {
            }).finally(function () {
            });
        });
    };
    
    
    $scope.get_items = function (module_id) {
        
        var from = first_day_of_week;
        var to = last_day_of_week;
        for (var i = 0; i < $scope.modules.length; i++) {
            if ($scope.modules[i].id == module_id) {
                from = $scope.modules[i].from_date;
                to = $scope.modules[i].to_date;
                break;
            }
        }

        $http({
            url: '/items/.json?module_id=' + module_id + '&from_date=' + from + '&to_date=' + to + '&_=' + myFactory.date_time_now(),
            method: "GET",
            cache: false,
            headers: { 'X-Requested-With' : 'XMLHttpRequest', 'Accept' : 'text/html' }
        }).success(function (data, status, headers, config) {
            for (var i = 0; i < $scope.modules.length; i++) {
                if ($scope.modules[i].id == module_id) { 
                    $scope.modules[i].Items = null;
                    $scope.modules[i].Items = data.dataset;
                    break;
                }
            }
        }).error(function (data, status, headers, config) {
        }).finally(function () {
        });    
    };
    
    
    $scope.blur = function (key_name) {
        console.debug($scope.attributes);
        $scope.$watch('attributes', function () {
            var url = '/attribute?table_name=' + $rootScope.table_name + '&key_id=' + $scope.module_id + '&key_name=&key_value=&_=' + myFactory.date_time_now();
            for (var i = 0; i < $scope.attributes.length; i++) {
                if ($scope.attributes[i].key_name == key_name) {
                    url = '/attribute?table_name=' + $rootScope.table_name + '&key_id=' + $scope.module_id + '&key_name=' + $scope.attributes[i].key_name + '&key_value=' + $scope.attributes[i].key_value + '&_=' + myFactory.date_time_now();
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

    $scope.$watch('modules', function (newValue, oldValue) {
        if (typeof newValue !== "undefined") {
            for (var i = 0; i < newValue.length; i++) {
                for (var j = 0; j < newValue[i].Items.length; j++) {
                    newValue[i].Items[j].worked = $filter('date')(newValue[i].Items[j].worked, 'yyyy-MM-dd'); 
                }
            }
        }
    }, true);

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
                    if (element[0].name == "plan_started") scope.plan_started = dateText;
                    if (element[0].name == "plan_ended") scope.plan_ended = dateText;
                    
                    if (element[0].name == "started") scope.started = dateText;
                    if (element[0].name == "ended") scope.ended = dateText;
                    
                    if (element[0].name == "module_plan_started") scope.module_plan_started = dateText;
                    if (element[0].name == "module_plan_ended") scope.module_plan_ended = dateText;
                    
                    if (element[0].name == "module_started") scope.module_started = dateText;
                    if (element[0].name == "module_ended") scope.module_ended = dateText;
                    
                    if (element[0].name == "items_filter_from_date") scope.items_filter_from_date = dateText;
                    if (element[0].name == "items_filter_to_date") scope.items_filter_to_date = dateText;

                    if (element[0].name == "item_worked") scope.item_worked = dateText;
                    
                    if (new Date(scope.module_plan_started) > new Date(scope.module_plan_ended)) scope.valid_time = true;
                    else scope.valid_time = false;
                    
                    if (new Date(scope.module_started) > new Date(scope.module_ended)) scope.valid_time2 = true;
                    else scope.valid_time2 = false;
                    
                    if (new Date(scope.plan_started) > new Date(scope.plan_ended)) scope.valid_time = true;
                    else scope.valid_time = false;
                    
                    if (new Date(scope.started) > new Date(scope.ended)) scope.valid_time2 = true;
                    else scope.valid_time2 = false;
                    
                    scope.$apply();
                }
            });
        }
    }
});

app.directive('myDatePickerMod', function () {
    return {
        link: function (scope, element, attrs, ngModel) {
            var curr = new Date;
            var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 1));
            var lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 5));
            var first_day_of_week = firstday.getFullYear() + "-" + n(firstday.getMonth() + 1) + "-" + n(firstday.getDate());
            var last_day_of_week = lastday.getFullYear() + "-" + n(lastday.getMonth() + 1) + "-" + n(lastday.getDate());
            var from = first_day_of_week;
            var to = last_day_of_week;
            
            element.datepicker({
                changeMonth: true,
                changeYear: true,
                showWeek: true,
                dateFormat: "yy-mm-dd",
                firstDay: 1,
                showOtherMonths: true,
                onSelect: function (dateText, inst) {
                    if (element[0].name == "from_date") {
                        element[0].value = dateText;
                        from = dateText;

                        for (var i = 0; i < scope.modules.length; i++) {
                            if (scope.modules[i].id == element[0].dataset.attr) {
                                scope.modules[i].from_date = dateText;
                                break;
                            }
                        }
                    }
                    if (element[0].name == "to_date") {
                        element[0].value = dateText;
                        to = dateText;

                        for (var i = 0; i < scope.modules.length; i++) {
                            if (scope.modules[i].id == element[0].dataset.attr) {
                                scope.modules[i].to_date = dateText;
                                break;
                            }
                        }
                    }
                    
                    scope.get_items(element[0].dataset.attr);
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

                    angular.forEach(scope.modules, function (module, index) {
                        if (module.id == element[0].dataset.attr) {
                            angular.forEach(scope.modules[index].Items, function (item, index2) {
                                if (item.id == element[0].dataset.attr2) {
                                    scope.modules[index].Items[index2].worked = dateText;
                                }
                            });
                        }
                    });

                    scope.onchange(element[0].dataset.attr, element[0].dataset.attr2, null);
                    scope.$apply();
                }
            });
        }
    }
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

app.directive('ngcdProject', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdProject, function (html) {
                element.html(html);
                $compile(element.contents())(scope);
            });
        },
    };
});

app.directive('ngcdModule', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdModule, function (html) {
                element.html(html);
                $compile(element.contents())(scope);
                scope.itemid = scope.item_id;
            });
        },
    };
});

app.directive('ngcdMember', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdMember, function (html) {
                element.html(html);
                $compile(element.contents())(scope);
            });
        },
    };
});


app.directive('ngcdItem', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdItem, function (html) {
                element.html(html);
                $compile(element.contents())(scope);
            });
        },
    };
});

app.directive('ngcdIssue', function ($compile) {
    return {
        restrict: 'A', // only matches attribute name
        replace: true,
        link: function (scope, element, attrs) {
            scope.$watch(attrs.ngcdIssue, function (html) {
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
                            '<a class="pointer pull-right" data-ng-click="load_issues(item_id, item_name, module_id, mode, true)" style="position:absolute;top:20px;right:50px;z-index:99999" data-ng-show="show_issue">{{ link_text }}</h4>' + 
                            '<a class="pointer pull-right" data-ng-click="load_attachments(item_id, item_name, module_id, mode, true)" style="position:absolute;top:20px;right:50px;z-index:99999" data-ng-show="show_attachment">{{ link_text }}</h4>' + 
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

app.directive('mySelectBox', function () {
    return {
        link: function (scope, element, attrs, ngModel) {
            element.on("change", function (e) {
                scope.onchange(element[0].dataset.attr, element[0].dataset.attr2, e);
                scope.$apply();
            });
        }
    }
});

app.directive('mySelectBoxIssue', function () {
    return {
        link: function (scope, element, attrs, ngModel) {
            element.on("change", function (e) {
                scope.onchange_issue(element[0].dataset.attr, null, e);
                scope.$apply();
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
                
                if (element.hasClass('blur_issue')) {
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


app.filter("sumByKey2", function () { // register new filter
    return function (data, user_id) {
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


app.filter("filterFileName", function () { // register new filter
    return function (file_name) {
        var arrFileName = file_name.split("___");
        return arrFileName[1];
    };
});


function n(n) {
    return n > 9 ? "" + n: "0" + n;
}
