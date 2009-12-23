/**
 * Test the RTM client library
 */

testCases.push( function(Y) {

	var WAIT_TIMEOUT = 500;
	
	var assertContains = function(string_to_test, substring_sought, failure_message) {
		Y.assert(string_to_test.indexOf(substring_sought) >= 0,
			failure_message + " (string to test is '" + string_to_test + "')");
	}
	
	return new Y.Test.Case({
		
		setUp: function() {
			(new RTM()).deleteToken();
		},
		
		testPushLocalChangeCreatesTimelineIfNeeded: function() {
			var rtm = new RTM();
			rtm.fireNextEvent = function() {};
			rtm.setToken('mydummytoken');
			
			var url_used;
			rtm.rawAjaxRequest = function(url, options) {
				url_used = url;
				options.onSuccess(SampleTestData.simple_good_response);
			};
			var called_createTimeline = false;
			var createTimeline_call_count = 0;
			rtm.createTimeline = function() {
				if (!called_createTimeline) {
					rtm.timeline = '87654';
				}
				called_createTimeline = true;
				++createTimeline_call_count;
			}

			var task = new TaskModel({
				listID: '112233',
				taskseriesID: '445566',
				taskID: '778899',
				name: "Do testing",
				localChanges: ['name']
			});
			
			Y.Assert.isNull(rtm.timeline, "Timeline is not initially null");
			rtm.pushLocalChange(task, 'name', function(){}, null);

			Y.Assert.areEqual(true, called_createTimeline, "createTimeline not called when needed");
			Y.Assert.areEqual(1, createTimeline_call_count, "createTimeline not called just once after first push");
			Y.Assert.areEqual('87654', rtm.timeline, "Timeline not set to expected value");

			rtm.pushLocalChange(task, 'name', function(){}, null);

			Y.Assert.areEqual(1, createTimeline_call_count, "createTimeline not called just once after second push");
		},
		
		testPushLocalChangeWontPushIfNotAuthorised: function() {
			var rtm = new RTM();
			var url_used;
			var called_remote = false;
			rtm.rawAjaxRequest = function(url, options) {
				called_remote = true;
			};
			rtm.timeline = '87654';

			var task = new TaskModel({
				listID: '112233',
				taskseriesID: '445566',
				taskID: '778899',
				name: "Do testing",
				localChanges: ['name']
			});
			
			rtm.pushLocalChange(task, 'name', function(){}, null);
			this.wait(
				function() {
					Y.Assert.areEqual(false, called_remote, "Remote system mistakenly called");
				},
				WAIT_TIMEOUT
			);
		},

		testPushLocalChangeCallsRightURLForName: function() {
			var rtm = new RTM();
			rtm.fireNextEvent = function() {};
			rtm.timeline = '87654';
			rtm.setToken('mydummytoken');
			
			var url_used;
			var good_response = SampleTestData.simple_good_response;
			rtm.rawAjaxRequest = function(url, options) {
				url_used = url;
				options.onSuccess(good_response);
			};

			var task = new TaskModel({
				listID: '112233',
				taskseriesID: '445566',
				taskID: '778899',
				name: "Do testing",
				localChanges: ['name']
			});
			
			var response_returned;
			rtm.pushLocalChange(task,
				'name',
				function(resp) { response_returned = resp },
				null
			);
			this.wait(
				function() {
					assertContains(url_used, 'method=rtm.tasks.setName', "setName not called");
					assertContains(url_used, 'list_id=112233', "List ID not set correctly");
					assertContains(url_used, 'taskseries_id=445566', "Taskseries ID not set correctly");
					assertContains(url_used, 'task_id=778899', "Task ID not set correctly");
					assertContains(url_used, 'timeline=87654', "Timeline not being used");
					assertContains(url_used, 'name=Do%20testing', "Task ID not set correctly");
					Y.Assert.areEqual(good_response, response_returned, "Didn't return canned good response");
				},
				WAIT_TIMEOUT
			);
		},

		testPushLocalChangeCallsRightURLForDeleted: function() {
			var rtm = new RTM();
			rtm.fireNextEvent = function() {};
			rtm.timeline = '87654';
			rtm.setToken('mydummytoken');
			
			var url_used;
			var good_response = SampleTestData.simple_good_response;
			rtm.rawAjaxRequest = function(url, options) {
				url_used = url;
				options.onSuccess(good_response);
			};

			var task = new TaskModel({
				listID: '112233',
				taskseriesID: '445566',
				taskID: '778899',
				name: "Do testing",
				deleted: true,
				localChanges: ['deleted']
			});
			
			var response_returned;
			rtm.pushLocalChange(task,
				'deleted',
				function(resp) { response_returned = resp },
				null
			);
			this.wait(
				function() {
					Y.Assert.isNotUndefined(url_used, "No URL called");
					assertContains(url_used, 'method=rtm.tasks.delete', "rtm.tasks.delete not called");
					assertContains(url_used, 'list_id=112233', "List ID not set correctly");
					assertContains(url_used, 'taskseries_id=445566', "Taskseries ID not set correctly");
					assertContains(url_used, 'task_id=778899', "Task ID not set correctly");
					assertContains(url_used, 'timeline=87654', "Timeline not being used");
					Y.Assert.areEqual(good_response, response_returned, "Didn't return canned good response");
				},
				WAIT_TIMEOUT
			);
		},
		
		testPushLocalChangeThenEnsuresMarkedNotForPush: function() {
			var rtm = new RTM();
			rtm.fireNextEvent = function() {};
			rtm.timeline = '87654';
			rtm.setToken('mydummytoken');
			
			rtm.rawAjaxRequest = function(url, options) {
				url_used = url;
				options.onSuccess(SampleTestData.simple_good_response);
			};

			var task = new TaskModel({
				listID: '112233',
				taskseriesID: '445566',
				taskID: '778899',
				name: "Do testing",
				localChanges: ['name']
			});
			var property_used_in_mark_function;
			task.markNotForPush = function(property) {
				property_used_in_mark_function = property;
			};
			rtm.pushLocalChange(task,
				'name',
				function() {},
				null
			);

			Y.Assert.areEqual('name', property_used_in_mark_function, "markNotForPush not called with property 'name'");
		},
		
		testPushLocalChangeHandlesFailure: function() {
			var rtm = new RTM();
			rtm.fireNextEvent = function() {};
			rtm.timeline = '87654';
			rtm.setToken('mydummytoken');
			
			var url_used;
			rtm.rawAjaxRequest = function(url, options) {
				url_used = url;
				options.onSuccess({
					status: 200,
					responseJSON: {
						rsp: {
							stat: 'fail',
							err: {
								code: 11,
								msg: "Funny failure message"
							}
						}
					}
				});
			};

			var task = new TaskModel({
				listID: '112233',
				taskseriesID: '445566',
				taskID: '778899',
				name: "Do testing",
				localChanges: ['name']
			});
			
			var err_msg_returned;
			rtm.pushLocalChange(task,
				'name',
				null,
				function(err_msg) { err_msg_returned = err_msg }
			);
			this.wait(
				function() {
					assertContains(url_used, 'method=rtm.tasks.setName', "setName not called");
					assertContains(url_used, 'list_id=112233', "List ID not set correctly");
					assertContains(url_used, 'taskseries_id=445566', "Taskseries ID not set correctly");
					assertContains(url_used, 'task_id=778899', "Task ID not set correctly");
					assertContains(url_used, 'timeline=87654', "Timeline not being used");
					assertContains(url_used, 'name=Do%20testing', "Task ID not set correctly");
					Y.Assert.areEqual("RTM error 11: Funny failure message", err_msg_returned, "Didn't return error message");
				},
				WAIT_TIMEOUT
			);
		},
		
		testPushLocalChangesHandlesVariousProperties: function() {
			var rtm = new RTM();
			rtm.fireNextEvent = function() {};
			rtm.timeline = '87654';
			rtm.setToken('mydummytoken');
			
			var model = new TaskListModel();
			var tasks = TaskListModel.objectToTaskList(SampleTestData.big_remote_json);
			model.setTaskList(tasks);
			
			var task_2_task_id = model.getTaskList()[2].taskID;
			var task_3_task_id = model.getTaskList()[3].taskID;

			model.getTaskList()[2].setForPush('name', 'My new task name');
			model.getTaskList()[3].setForPush('due', '2010-01-12T12:34:00Z');
			
			var errs = "";
			var task_2_change_pushed = false;
			var task_3_change_pushed = false;
			rtm.oldPushLocalChange = rtm.pushLocalChange;
			rtm.pushLocalChange = function(task, property, successCallback, failureCallback) {
				if (property == 'name' && task.name == 'My new task name') {
					task_2_change_pushed = true;
				}
				else if (property == 'due' && task.due == '2010-01-12T12:34:00Z') {
					task_3_change_pushed = true;
				}
				else {
					errs = errs + " pushLocalChange(" + property + " of " + task.name +")";
				}
				rtm.oldPushLocalChange(task, property, successCallback, failureCallback);
			}
			
			var task_2_marked_not_for_push = false;
			var task_3_marked_not_for_push = false;
			model.getTaskList()[2].markNotForPush = function(property) {
				if (property == 'name') {
					task_2_marked_not_for_push = true;
				}
			};
			model.getTaskList()[3].markNotForPush = function(property) {
				if (property == 'due') {
					task_3_marked_not_for_push = true;
				}
			};
			
			rtm.callMethod = function(method, params, successCallback, failureCallback) {
				if (params.task_id == task_2_task_id) {
					// Task 2
					Y.Assert.areEqual('rtm.tasks.setName', method, "Not calling setName for task 2");
				}
				else if (params.task_id == task_3_task_id) {
					// Task 3
					Y.Assert.areEqual('rtm.tasks.setDueDate', method, "Not calling setDueDate for task 3");
					Y.Assert.areEqual('2010-01-12T12:34:00Z', params.due, "Not setting due date for task 3");
				}
				else {
					Y.Assert.fail("Calling method '" + method + "' on task '" + params.task_id + "',"
						+ " while task 2 has id " + task_2_task_id +" and task 3 has id " + task_3_task_id);
				}
				successCallback();
			};
			
			rtm.pushLocalChanges(model);
			
			Y.Assert.areEqual(true, task_2_change_pushed, "Task 2 change not pushed");
			Y.Assert.areEqual(true, task_3_change_pushed, "Task 3 change not pushed");
			Y.Assert.areEqual(true, task_2_marked_not_for_push, "Task 2 should be marked not for push now");
			Y.Assert.areEqual(true, task_3_marked_not_for_push, "Task 3 should be marked not for push now");
			Y.Assert.areEqual("", errs, "Wrong tasks pushed: " + errs);
		}

	});
} );