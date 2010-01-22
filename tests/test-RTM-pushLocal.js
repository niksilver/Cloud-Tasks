// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the RTM client library
 */

testCases.push( function(Y) {

	var WAIT_TIMEOUT = 100;
	
	return new Y.Test.Case({
		
		setUp: function() {
			(new RTM()).deleteToken();
			TestUtils.captureMojoLog();
		},
		
		tearDown: function() {
			TestUtils.restoreMojoLog();
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
					TestUtils.assertContains(url_used, 'method=rtm.tasks.setName', "setName not called");
					TestUtils.assertContains(url_used, 'list_id=112233', "List ID not set correctly");
					TestUtils.assertContains(url_used, 'taskseries_id=445566', "Taskseries ID not set correctly");
					TestUtils.assertContains(url_used, 'task_id=778899', "Task ID not set correctly");
					TestUtils.assertContains(url_used, 'timeline=87654', "Timeline not being used");
					TestUtils.assertContains(url_used, 'name=Do%20testing', "Task ID not set correctly");
					Y.Assert.areEqual(good_response, response_returned, "Didn't return canned good response");
				},
				WAIT_TIMEOUT
			);
		},
		
		testPushLocalChangeAllowsDueDateToBeSet: function() {
			var rtm = new RTM();
			var parameters_used;
			rtm.callMethod = function(url, parameters, onSuccess, onFailure) {
				parameters_used = parameters;
			};
			var task = new TaskModel({ due: '2010-01-14T00:00:00Z' });
			Y.assert(Object.keys(task).indexOf('due') >= 0, "Due property not found in task");
			rtm.pushLocalChange(task, 'due', null, null);
			Y.assert(Object.keys(parameters_used).indexOf('due') >= 0, "Due property not found in parameters");
		},
		
		testPushLocalChangeAllowsDueDateToBeUnset: function() {
			var rtm = new RTM();
			var parameters_used;
			rtm.callMethod = function(url, parameters, onSuccess, onFailure) {
				parameters_used = parameters;
			};
			var task = new TaskModel({ due: undefined });
			Y.assert(Object.keys(task).indexOf('due') >= 0, "Due property not found in task");
			rtm.pushLocalChange(task, 'due', null, null);
			Y.assert(Object.keys(parameters_used).indexOf('due') == -1, "Due property incorrectly found in parameters");
		},

		testPushLocalChangeCallsRightURLForDeleted: function() {
			var rtm = new RTM();
			rtm.timeline = '87654';
			
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
					TestUtils.assertContains(url_used, 'method=rtm.tasks.delete', "rtm.tasks.delete not called");
					TestUtils.assertContains(url_used, 'list_id=112233', "List ID not set correctly");
					TestUtils.assertContains(url_used, 'taskseries_id=445566', "Taskseries ID not set correctly");
					TestUtils.assertContains(url_used, 'task_id=778899', "Task ID not set correctly");
					TestUtils.assertContains(url_used, 'timeline=87654', "Timeline not being used");
					Y.Assert.areEqual(good_response, response_returned, "Didn't return canned good response");
				},
				WAIT_TIMEOUT
			);
		},

		testPushLocalChangeCallsRightURLForCompleted: function() {
			var rtm = new RTM();
			rtm.timeline = '87654';
			
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
				completed: true,
				localChanges: ['completed']
			});
			
			var response_returned;
			rtm.pushLocalChange(task,
				'completed',
				function(resp) { response_returned = resp },
				null
			);
			this.wait(
				function() {
					Y.Assert.isNotUndefined(url_used, "No URL called");
					TestUtils.assertContains(url_used, 'method=rtm.tasks.complete', "rtm.tasks.complete not called");
					TestUtils.assertContains(url_used, 'list_id=112233', "List ID not set correctly");
					TestUtils.assertContains(url_used, 'taskseries_id=445566', "Taskseries ID not set correctly");
					TestUtils.assertContains(url_used, 'task_id=778899', "Task ID not set correctly");
					TestUtils.assertContains(url_used, 'timeline=87654', "Timeline not being used");
					Y.Assert.areEqual(good_response, response_returned, "Didn't return canned good response");
				},
				WAIT_TIMEOUT
			);
		},

		testPushLocalChangeCallsRightURLForRRule: function() {
			var rtm = new RTM();
			rtm.timeline = '87654';
			
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
				name: "Do testing"
			});
			task.setRecurrenceUserTextForPush('Every Friday');
			
			var response_returned;
			rtm.pushLocalChange(task,
				'rrule',
				function(resp) { response_returned = resp },
				null
			);
			this.wait(
				function() {
					Y.Assert.isNotUndefined(url_used, "No URL called");
					TestUtils.assertContains(url_used, 'method=rtm.tasks.setRecurrence', "rtm.tasks.setRecurrence not called");
					TestUtils.assertContains(url_used, 'list_id=112233', "List ID not set correctly");
					TestUtils.assertContains(url_used, 'taskseries_id=445566', "Taskseries ID not set correctly");
					TestUtils.assertContains(url_used, 'task_id=778899', "Task ID not set correctly");
					TestUtils.assertContains(url_used, 'timeline=87654', "Timeline not being used");
					TestUtils.assertContains(url_used, 'repeat=Every%20Friday&', "Repeat text not sent correctly");
					Y.Assert.areEqual(good_response, response_returned, "Didn't return canned good response");
				},
				WAIT_TIMEOUT
			);
		},
		
		testPushLocalChangeThenEnsuresMarkedNotForPush: function() {
			var rtm = new RTM();
			
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
			rtm.timeline = '87654';
			
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
					TestUtils.assertContains(url_used, 'method=rtm.tasks.setName', "setName not called");
					TestUtils.assertContains(url_used, 'list_id=112233', "List ID not set correctly");
					TestUtils.assertContains(url_used, 'taskseries_id=445566', "Taskseries ID not set correctly");
					TestUtils.assertContains(url_used, 'task_id=778899', "Task ID not set correctly");
					TestUtils.assertContains(url_used, 'timeline=87654', "Timeline not being used");
					TestUtils.assertContains(url_used, 'name=Do%20testing', "Task ID not set correctly");
					Y.Assert.areEqual("RTM error 11: Funny failure message", err_msg_returned, "Didn't return error message");
				},
				WAIT_TIMEOUT
			);
		},
		
		testPushLocalChangesHandlesVariousProperties: function() {
			var rtm = new RTM();
			
			var model = new TaskListModel();
			var tasks = TaskListModel.objectToTaskList(SampleTestData.big_remote_json);
			model.setTaskList(tasks);
			
			var task_2_task_id = model.getTaskList()[2].taskID;
			var task_3_task_id = model.getTaskList()[3].taskID;

			model.getTaskList()[2].setForPush('name', 'My new task name');
			model.getTaskList()[3].setForPush('due', '2010-01-12T12:34:00Z');
			
			// Monitor calls to RTM.pushLocalChange()
			
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
			
			// Monitor calls to markNotForPush()
			
			var task_2_marked_not_for_push = false;
			var task_3_marked_not_for_push = false;
			model.getTaskList()[2].oldMarkNotForPush = model.getTaskList()[2].markNotForPush;
			model.getTaskList()[2].markNotForPush = function(property) {
				if (property == 'name') {
					task_2_marked_not_for_push = true;
				}
				this.oldMarkNotForPush(property);
			};
			model.getTaskList()[3].oldMarkNotForPush = model.getTaskList()[3].markNotForPush;
			model.getTaskList()[3].markNotForPush = function(property) {
				if (property == 'due') {
					task_3_marked_not_for_push = true;
				}
				this.oldMarkNotForPush(property);
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
				successCallback(SampleTestData.simple_good_response);
			};
			
			rtm.pushLocalChanges(model);
			
			Y.Assert.areEqual(true, task_2_change_pushed, "Task 2 change not pushed");
			Y.Assert.areEqual(true, task_3_change_pushed, "Task 3 change not pushed");
			Y.Assert.areEqual(true, task_2_marked_not_for_push, "Task 2 should be marked not for push now");
			Y.Assert.areEqual(true, task_3_marked_not_for_push, "Task 3 should be marked not for push now");
			Y.Assert.areEqual("", errs, "Wrong tasks pushed: " + errs);
		},
		
		testPushLocalDeletionCausesTaskListPurge: function() {
			var rtm = new RTM();
			
			var called_rawAjaxRequest;
			rtm.rawAjaxRequest = function(url, options) {
				called_rawAjaxRequest = true;
				options.onSuccess(SampleTestData.simple_good_response);
			};

			var task = new TaskModel({
				listID: '112233',
				taskseriesID: '445566',
				taskID: '778899',
				name: "Do testing",
				deleted: true,
				localChanges: ['deleted']
			});

			var task_list_model = new TaskListModel();
			task_list_model.setTaskList([task]);
			var called_purgeTaskList;
			var orig_purgeTaskList = task_list_model.purgeTaskList.bind(task_list_model);
			task_list_model.purgeTaskList = function() {
				called_purgeTaskList = true;
				orig_purgeTaskList();
			}
			rtm.retrier.taskListModel = task_list_model;
			
			var called_pushLocalChange_onSuccess;
			var pushLocalChange_onSuccess = function() {
				called_pushLocalChange_onSuccess = true;
			}
			
			Y.Assert.areEqual(1, task_list_model.getTaskList().length, "Should be just one task in the list");
			
			called_rawAjaxRequest = false;
			called_pushLocalChange_onSuccess = false;
			called_purgeTaskList = false;
			rtm.pushLocalChange(task, 'deleted', pushLocalChange_onSuccess, function(){});
			
			Y.Assert.areEqual(true, called_rawAjaxRequest, "Should have made Ajax call");
			Y.Assert.areEqual(true, called_pushLocalChange_onSuccess, "Should have called the onSuccess callback of pushLocalChange()");
			Y.Assert.areEqual(true, called_purgeTaskList, "Should have tried to purge the task list");
			Y.Assert.areEqual(0, task_list_model.getTaskList().length, "Should be no tasks in the list");
		},
		
		testPushLocalChangesForTaskCreatesNewRemotelyFirstIfNeeded: function() {
			var rtm = new RTM();
			var task_created_locally = new TaskModel({
				name: 'My local task'
			});
			var task_created_remotely = new TaskModel({
				listID: '12345',
				taskseriesID: '67890',
				taskID: '87654',
				name: 'My remote task',
				localChanges: ['name']
			});
			
			var tasks_created = [];
			rtm.addTask = function(task) {
				tasks_created.push(task);
			}
			rtm.pushLocalChangesForTask(task_created_locally);
			rtm.pushLocalChangesForTask(task_created_remotely);
			
			Y.Assert.areEqual(1, tasks_created.length, "Should only have tried to create one task");
			Y.Assert.areSame(task_created_locally, tasks_created[0], "Didn't try to push out locally created task");
		},
		
		testPushLocalCompletionCausesTaskListPurge: function() {
			var rtm = new RTM();
			
			var called_rawAjaxRequest;
			rtm.rawAjaxRequest = function(url, options) {
				called_rawAjaxRequest = true;
				options.onSuccess(SampleTestData.simple_good_response);
			};

			var task = new TaskModel({
				listID: '112233',
				taskseriesID: '445566',
				taskID: '778899',
				name: "Do testing",
				completed: true,
				localChanges: ['completed']
			});

			var task_list_model = new TaskListModel();
			task_list_model.setTaskList([task]);
			var called_purgeTaskList;
			var orig_purgeTaskList = task_list_model.purgeTaskList.bind(task_list_model);
			task_list_model.purgeTaskList = function() {
				called_purgeTaskList = true;
				orig_purgeTaskList();
			}
			rtm.retrier.taskListModel = task_list_model;
			
			var called_pushLocalChange_onSuccess;
			var pushLocalChange_onSuccess = function() {
				called_pushLocalChange_onSuccess = true;
			}
			
			Y.Assert.areEqual(1, task_list_model.getTaskList().length, "Should be just one task in the list");
			
			called_rawAjaxRequest = false;
			called_pushLocalChange_onSuccess = false;
			called_purgeTaskList = false;
			rtm.pushLocalChange(task, 'completed', pushLocalChange_onSuccess, function(){});
			
			Y.Assert.areEqual(true, called_rawAjaxRequest, "Should have made Ajax call");
			Y.Assert.areEqual(true, called_pushLocalChange_onSuccess, "Should have called the onSuccess callback of pushLocalChange()");
			Y.Assert.areEqual(true, called_purgeTaskList, "Should have tried to purge the task list");
			Y.Assert.areEqual(0, task_list_model.getTaskList().length, "Should be no tasks in the list");
		},
		
		testMarkAsDeletedAllTasksInSeriesThenPushWaitsForRecursionToReturnBeforeDeleting: function() {
			// Set up our RTM client and task list
			
			var rtm = new RTM();
			var task_list = TaskListModel.objectToTaskList(SampleTestData.response_with_basic_and_recurring_completion);
			var model = new TaskListModel(task_list);	
			
			// Create a server:
			//   - setRecurrence does not return immediately;
			//   - delete asserts that setRecurrence has been called first
			
			var haveCalledSetRecurrence;
			var haveCalledDelete;
			rtm.rawAjaxRequest = function(url, options) {
				Mojo.Log.info("rtm.rawAjaxRequest: Entering");
				if (url.indexOf('rtm.tasks.delete') >= 0) {
					Mojo.Log.info("rtm.rawAjaxRequest: Delete branch");
					Y.Assert.areEqual(true, haveCalledSetRecurrence, "Delete called before setRecurrence");
					haveCalledDelete = true;
					options.onSuccess(SampleTestData.simple_good_response);
				}
				else if (url.indexOf('rtm.tasks.setRecurrence') >= 0) {
					Mojo.Log.info("rtm.rawAjaxRequest: setRecurrence branch");
					setTimeout( function() {
							haveCalledSetRecurrence = true;
							Mojo.Log.info("rtm.rawAjaxRequest: setRecurrence branch: calling onSuccess");
							options.onSuccess(SampleTestData.simple_good_response);
						},
					100);
				}
				else {
					Y.fail("rtm.rawAjaxRequest: Unknown call, URL " + url);
				}
			}
			
			// Set up deletion of a series
			
			var task_hash = TestUtils.getTaskIDToTaskHash(model.getTaskList());
			Y.Assert.areEqual(true, task_hash['85269921'].isRecurring(), "Task 85269921 not recurring");
			Y.Assert.areEqual(true, task_hash['85270009'].isRecurring(), "Task 85270009 not recurring");

			model.markAsDeletedAllTasksInSeries({ listID: '11122940', taskseriesID: '59269686' });			
			
			// Push the changes
			
			haveCalledDelete = false;
			haveCalledSetRecurrence = false;
			rtm.pushLocalChanges(model);
			
			// Check the changes were pushed out
			
			this.wait( function() {
					Y.Assert.areEqual(true, haveCalledDelete, "Didn't delete the task");
					Y.Assert.areEqual(true, haveCalledSetRecurrence, "Didn't cancel the recurrence");
				},
				200
			);
			
		},

		testMarkAsDeletedAllTasksInSeriesThenPushHandlesFailureOfSetRecursion: function() {
			// Set up our RTM client and task list
			
			var rtm = new RTM();
			var task_list = TaskListModel.objectToTaskList(SampleTestData.response_with_basic_and_recurring_completion);
			var model = new TaskListModel(task_list);	
			
			// Create a server:
			//   - setRecurrence does not return immediately;
			//   - delete asserts that setRecurrence has been called first
			
			var haveCalledAjaxRequest;
			var haveCalledSetRecurrence;
			rtm.rawAjaxRequest = function(url, options) {
				haveCalledAjaxRequest = true;
				if (url.indexOf('rtm.tasks.setRecurrence') >= 0) {
					haveCalledSetRecurrence = true;
				}
				options.onFailure("setRecurrence failed; I hope we don't attempt to delete now");
			}
			
			// Set up deletion of a series
			
			var task_hash = TestUtils.getTaskIDToTaskHash(model.getTaskList());
			Y.Assert.areEqual(true, task_hash['85269921'].isRecurring(), "Task 85269921 not recurring");
			Y.Assert.areEqual(true, task_hash['85270009'].isRecurring(), "Task 85270009 not recurring");

			model.markAsDeletedAllTasksInSeries({ listID: '11122940', taskseriesID: '59269686' });			
			
			// Push the changes
			
			haveCalledAjaxRequest = false;
			haveCalledSetRecurrence = false;
			rtm.pushLocalChanges(model);
			
			// Check the failures happened and were handled

			Y.Assert.areEqual(true, haveCalledAjaxRequest, "Didn't make any Ajax calls");
			Y.Assert.areEqual(true, haveCalledSetRecurrence, "Didn't try to set the recurrence");
			Y.Assert.areEqual('rrule', task_hash['85269921'].localChanges[0], "Task 85269921 should still need to push rrule");
			Y.Assert.areEqual('deleted', task_hash['85269921'].localChanges[1], "Task 85269921 should still need to push deleted");
			Y.Assert.areEqual('rrule', task_hash['85270009'].localChanges[0], "Task 85270009 should still need to push rrule");
			Y.Assert.areEqual('deleted', task_hash['85270009'].localChanges[1], "Task 85270009 should still need to push deleted");
		},
		
		testAddingATaskAndChangingPropertiesPushesAllInOneSync: function() {
			// Set up our RTM client and task list
			
			var rtm = new RTM();
			
			// Create a server:
			//   - rtm.tasks.add does not return immediately;
			//   - setDueDate asserts that add has been called first
			
			var haveCalledAdd;
			var haveCalledSetDueDate;
			rtm.rawAjaxRequest = function(url, options) {
				if (url.indexOf('rtm.tasks.setDueDate') >= 0) {
					Y.Assert.areEqual(true, haveCalledAdd, "Due date set before add returned");
					haveCalledSetDueDate = true;
					options.onSuccess(SampleTestData.simple_good_response);
				}
				else if (url.indexOf('rtm.tasks.add') >= 0) {
					setTimeout( function() {
							haveCalledAdd = true;
							var response = SampleTestData.simple_good_response;
							response.responseJSON.rsp.list = {
								id: '112233',
								taskseries: {
									id: '445566',
									task: { id: '778899' }
								}
							};
							options.onSuccess(response);
						},
					100);
				}
				else {
					Y.fail("rtm.rawAjaxRequest: Unknown call, URL " + url);
				}
			}
			
			// Set up new task and set its due date
			
			var task = new TaskModel({ name: 'My new task' });
			task.setForPush('due', '2008-03-26T00:00:00Z');
			
			// Push the changes
			
			haveCalledAdd = false;
			haveCalledSetDueDate = false;
			rtm.pushLocalChangesForTask(task);
			
			// Check the changes were pushed out
			
			this.wait( function() {
					Y.Assert.areEqual(true, haveCalledAdd, "Didn't add the task");
					Y.Assert.areEqual(true, haveCalledSetDueDate, "Didn't set the due date");
				},
				200
			);
		},
		
		testPushLocalChangeForRRuleCallsRRuleResponseHandler: function() {
			var rtm = new RTM();
			var task = new TaskModel({
				rrule: { userText: 'Every 2nd Wednesday' }
			});
			var rrule_response = {"every":"1","$t":"FREQ=WEEKLY;INTERVAL=2;BYDAY=WE"};
			var good_rsp =  {
				"rsp":{
					"stat":"ok",
					"transaction":{"id":"1500756094","undoable":"1"},
					"list":{"id":"2637966",
						"taskseries":{
							"id":"61220716","created":"2010-01-20T22:02:36Z","modified":"2010-01-20T22:03:06Z","name":"My test task","source":"api","url":"","location_id":"",
							"rrule":rrule_response,
							"tags": [],"participants":[],"notes":[],
							"task":{"id":"88077888","due":"2010-01-20T00:00:00Z","has_due_time":"0","added":"2010-01-20T22:02:36Z","completed":"","deleted":"","priority":"N","postponed":"0","estimate":""
							}}}}};
			var good_response = SampleTestData.simple_good_response;
			good_response.responseJSON = good_rsp;
			var response_used;
			task.handleRRuleResponse = function(rsp) {
				response_used = rsp;
			};
			var called_update = false;
			task.update = function() { called_update = true; };
			rtm.callMethod = function(method, parameters, onSuccess, onFailure) {
				onSuccess(good_response);
			}
			var called_recurrence_changed = false;
			rtm.recurrenceChanged = function() { called_recurrence_changed = true; };
			var called_main_callback = false;
			rtm.pushLocalChange(task, 'rrule', function(response){ called_main_callback = true }, null);
			Y.Assert.areEqual(true, called_main_callback, "Didn't call main success callback");
			Y.Assert.areEqual(rrule_response, response_used, "Didn't send rrule object to rrule handler");
			Y.Assert.areEqual(true, called_update, "Didn't call task update function");
			Y.Assert.areEqual(true, called_recurrence_changed, "Didn't call the recurrence changed function");
		}
		
	});
} );