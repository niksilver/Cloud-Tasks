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

		testCallMethodWithSuccess: function() {
			var rtm = new RTM();
			var successfulResponse = {
				status: 200,
				responseJSON: {
					"rsp": {
						"stat": "ok",
						"api_key": Secrets.API_KEY,
						"format": "json",
						"method": "rtm.test.echo",
						"param1": "Hello",
						"param2": "World"
					}
				}
			};
			rtm.ajaxRequest = function(url, options) {
				options.onSuccess(successfulResponse);
			}
			var response;
			rtm.callMethod("rtm.test.echo",
				{},
				function(resp){ response = resp },
				null);
			this.wait(
				function() {
					Y.Assert.areEqual('Hello', response.responseJSON.rsp.param1, "Param1 was not Hello");
					Y.Assert.areEqual('World', response.responseJSON.rsp.param2, "Param1 was not World");
				},
				WAIT_TIMEOUT
			);
		},
		
		testCallMethodWithRTMError: function() {
			var rtm = new RTM();
			var responseWithRTMError = {
				status: 200,
				responseJSON: {"rsp":{"stat":"fail","err":{"code":"97","msg":"Missing signature"}}}
			};
			rtm.ajaxRequest = function(url, options) {
				options.onSuccess(responseWithRTMError);
			}
			var message;
			rtm.callMethod("rtm.error.method",
				{},
				null,
				function(msg){ message = msg; });
			this.wait(
				function() {
					Y.Assert.areEqual("RTM error 97: Missing signature", message, "Incorrect error message");
				},
				WAIT_TIMEOUT
			);
		},

		testCallMethodWithFailure: function() {
			var rtm = new RTM();
			var failureResponse = {
				status: 500,
				statusText: "Internal error"
			};
			rtm.ajaxRequest = function(url, options) {
				options.onFailure(failureResponse);
			};
			var message;
			rtm.callMethod("my.failing.method",
				{},
				null,
				function(msg) { message = msg; });
			this.wait(
				function() {
					Y.Assert.isString(message, "Message should be a string");
					Y.assert( message.indexOf("500") >= 0, "Status code should appear in message");
					Y.assert( message.indexOf("Internal error") >= 0, "Status text should appear in message");
				},
				WAIT_TIMEOUT
			);
		},
		
		testCallMethodUsesTokenWhenSet: function() {
			var rtm = new RTM();
			rtm.setToken('12345');
			var url_used;
			rtm.ajaxRequest = function(url, options) {
				url_used = url;
			}
			var response;
			rtm.callMethod("some.method.name",
				{},
				null,
				null);
			this.wait(
				function() {
					Y.Assert.isString(url_used, 'Ajax not called with URL string');
					Y.assert(url_used.indexOf('auth_token=12345') >= 0, 'URL does not contain token parameter');
				},
				WAIT_TIMEOUT
			);
		},
		
		testCallMethodDoesNotUseTokenWhenNotSet: function() {
			var rtm = new RTM();
			rtm.deleteToken();
			var url_used;
			rtm.ajaxRequest = function(url, options) {
				url_used = url;
			}
			rtm.callMethod("some.method.name",
				{},
				null,
				null);
			this.wait(
				function() {
					Y.Assert.isString(url_used, 'Ajax not called with URL string');
					Y.assert(url_used.indexOf('auth_token=') == -1, 'URL mistkenly contains token parameter');
				},
				WAIT_TIMEOUT
			);
		},
		
		testGetMethodErrorMessageWithSuccess: function() {
			var response = {
				status: 200,
				responseJSON: {
					"rsp": {
						"stat": "ok",
						"api_key": Secrets.API_KEY,
						"format": "json",
						"method": "rtm.test.echo",
					// Echoed parameters go here
					}
				}
			};
			var msg = RTM.getMethodErrorMessage(response);
			Y.Assert.isNull(msg, "Message is not null");
		},
		
		testGetMethodErrorMessageWithError: function() {
			var response = {
				status: 200,
				responseJSON: {"rsp":{"stat":"fail","err":{"code":"97","msg":"Missing signature"}}}
			};
			var msg = RTM.getMethodErrorMessage(response);
			Y.Assert.areEqual("RTM error 97: Missing signature", msg, "Incorrect error message");
		},
		
		testGetMethodErrorMessageWithNullAndUndefinedValues: function() {
			var response_with_no_stat = {
				status: 200,
				responseJSON: { rsp: {} }
			};
			var response_with_empty_rsp = {
				status: 200,
				responseJSON: { rsp: null }
			};
			var response_with_empty_obj_json = {
				status: 200,
				responseJSON: {}
			};
			var response_with_null_json = {
				status: 200,
				responseJSON: null
			};
			var response_with_no_json = {
				status: 200
			};
			Y.Assert.areEqual("RTM error: Missing data", RTM.getMethodErrorMessage(response_with_no_stat), "Failed with no stat");
			Y.Assert.areEqual("RTM error: No data", RTM.getMethodErrorMessage(response_with_empty_rsp), "Failed with empty rsp");
			Y.Assert.areEqual("RTM error: No data", RTM.getMethodErrorMessage(response_with_empty_obj_json), "Failed with empty obj JSON");
			Y.Assert.areEqual("HTTP error: No data", RTM.getMethodErrorMessage(response_with_null_json), "Failed with null JSON");
			Y.Assert.areEqual("HTTP error: No data", RTM.getMethodErrorMessage(response_with_no_json), "Failed with no JSON");
			Y.Assert.areEqual("HTTP error: No response", RTM.getMethodErrorMessage(null), "Failed with null response");
			Y.Assert.areEqual("HTTP error: No response", RTM.getMethodErrorMessage(), "Failed with undefined response");
		},
		
		testOrderAndConcatenate: function() {
			var rtm = new RTM();
			var ordered_params = rtm.orderAndConcatenate({
				yxz: 'foo',
				feg: 'bar',
				abc: 'baz'
			});
			Y.Assert.areEqual('abcbazfegbaryxzfoo', ordered_params, "Ordering of params is wrong");
		},
		
		testGetAPISig: function() {
			var rtm = new RTM();
			rtm.sharedSecret = 'BANANAS';
			var api_sig = rtm.getAPISig({
				yxz: 'foo',
				feg: 'bar',
				abc: 'baz'
			});
			Y.Assert.areEqual('82044aae4dd676094f23f1ec152159ba',
				api_sig,
				"Ordering of params is wrong");
		},
		
		testFetchFrobSuccessfully: function() {
			var rtm = new RTM();
			rtm.ajaxRequest = function(url, options) {
				options.onSuccess({
					status: 200,
					responseJSON: {
						rsp: {
							stat: 'ok',
							frob: '12345'
						}
					}
				})
			};
			var fetched_frob;
			rtm.fetchFrob(
				function(frob) { fetched_frob = frob },
				null);
			this.wait(
				function() {
					Y.Assert.areEqual("12345", fetched_frob, "Frob is not correct");
				},
				WAIT_TIMEOUT
			);
		},
		
		testFetchFrobUnsuccessfully: function() {
			var rtm = new RTM();
			rtm.ajaxRequest = function(url, options) {
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
				})
			};
			var got_message;
			rtm.fetchFrob(
				null,
				function(msg) { got_message = msg; });
			this.wait(
				function() {
					Y.Assert.isString(got_message, "Frob error not a string");
					Y.assert( got_message.indexOf('11') >= 0, "Frob error code not found");
					Y.assert( got_message.indexOf('Funny failure message') >= 0, "Frob error text not found");
				},
				WAIT_TIMEOUT
			);
		},
		
		testFetchFrobCallsCorrectMethod: function() {
			var rtm = new RTM();
			var called_url;
			rtm.ajaxRequest = function(url, options) {
				called_url = url;
			}
			rtm.fetchFrob(function(){}, function(){});
			this.wait(
				function() {
					Y.Assert.isString(called_url, "No URL string called");
					Y.assert(called_url.indexOf('/rest/?') >= 0, "Didn't call REST service");
					Y.assert(called_url.indexOf('method=rtm.auth.getFrob') >= 0, "Didn't call getFrob method");
				},
				WAIT_TIMEOUT
			);
		},
		
		testGetAuthURL: function() {
			var rtm = new RTM();
			var frob = '12345';
			var url = rtm.getAuthURL(frob);
			Y.Assert.isString(url, "Auth URL is not a string");
			Y.assert(url.indexOf('http://www.rememberthemilk.com/services/auth/?') == 0, "Auth URL does not point to auth service");
			Y.assert(url.indexOf('frob=12345') >= 0, "Auth URL does not include frob");
			Y.assert(url.indexOf('perms=delete') >= 0, "Auth URL does not request delete permission");
			Y.assert(url.indexOf('api_key=' + Secrets.API_KEY) >= 0, "Auth URL does include API key");
			Y.assert(url.indexOf('api_sig=') >= 0, "Auth URL does not include API sig");
		},
		
		testFetchTokenSuccessfully: function() {
			var rtm = new RTM();
			var url_used;
			var frob = '12345';
			var token = '410c57262293e9d937ee5be75eb7b0128fd61b61';
			rtm.ajaxRequest = function(url, options) {
				url_used = url;
				options.onSuccess({
					status: 200,
					responseJSON: {
						rsp: {
							stat: 'ok',
							auth: {
								token: token,
								perms: 'delete',
								user: {	id: 1, username: 'bob', fullname: 'Bob T. Monkey' }
							}
						}
					}
				})
			};
			var token_returned;
			rtm.fetchToken(frob,
				function(token) {
					token_returned = token;
				},
				null
			);
			this.wait(
				function() {
					Y.Assert.isString(url_used, "URL used isn't a string");
					Y.assert(url_used.indexOf('frob=12345') >= 0, "Frob not used in URL");
					Y.Assert.areEqual(token, token_returned, "Incorrect token returned");
				},
				WAIT_TIMEOUT
			);
		},

		testFetchTokenUnsuccessfully: function() {
			var rtm = new RTM();
			var url_used;
			rtm.ajaxRequest = function(url, options) {
				url_used = url;
				options.onSuccess({
					status: 200,
					responseJSON: {
						rsp: {
							stat: 'fail',
							err: { code: 22, msg: "Couldn't fetch token" }
						}
					}
				})
			};
			var got_message;
			rtm.fetchToken(
				'12345',
				null,
				function(msg) { got_message = msg; });
			this.wait(
				function() {
					Y.Assert.isString(url_used, "URL used is not a string");
					Y.assert(url_used.indexOf('frob=12345') > 0, "Frob not used in URL to fetch token");
					Y.Assert.isString(got_message, "Token error not a string");
					Y.assert( got_message.indexOf('22') >= 0, "Token error code not found");
					Y.assert( got_message.indexOf("Couldn't fetch token") >= 0, "Token error text not found");
				},
				WAIT_TIMEOUT
			);
		},
		
		testTokenStorage: function() {
			var rtm = new RTM();
			
			Y.assert(!rtm.getToken(), 'Token is not initially false');
			rtm.setToken('12345');
			Y.Assert.areEqual('12345', rtm.getToken(), 'Token does not hold value after being set');
			Y.assert(rtm.getToken(), 'Token is not true after being set');
			Y.Assert.areEqual('12345', rtm.getToken(), 'Token is not as set');
			rtm.deleteToken();
			Y.assert(!rtm.getToken(), 'Token is not false after being deleted');
		},
		
		testCreateTimeline: function() {
			var rtm = new RTM();
			Y.Assert.isNull(rtm.timeline, "Should have no initial timeline");
			
			rtm.ajaxRequest = function(url, options) {
				url_used = url;
				options.onSuccess({
					status: 200,
					responseJSON: {
						rsp: {
							stat: 'ok',
							timeline: '56712'
						}
					}
				})
			};
			
			rtm.createTimeline();
			this.wait(function() {
					Y.Assert.areEqual('56712', rtm.timeline, "Did not set timeline successfully");
				},
				WAIT_TIMEOUT
			);

		},
		
		testPushLocalChangeCreatesTimelineIfNeeded: function() {
			var rtm = new RTM();
			rtm.setToken('mydummytoken');
			
			var url_used;
			var good_response = {
				status: 200,
				responseJSON: {
					"rsp": {
						"stat": "ok",
						// Other data omitted
					}
				}
			};
			rtm.ajaxRequest = function(url, options) {
				url_used = url;
				options.onSuccess(good_response);
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
			rtm.ajaxRequest = function(url, options) {
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
			rtm.timeline = '87654';
			rtm.setToken('mydummytoken');
			
			var url_used;
			var good_response = {
				status: 200,
				responseJSON: {
					"rsp": {
						"stat": "ok",
						// Other data omitted
					}
				}
			};
			rtm.ajaxRequest = function(url, options) {
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
		
		testPushLocalChangeThenEnsuresMarkedNotForPush: function() {
			var rtm = new RTM();
			rtm.timeline = '87654';
			rtm.setToken('mydummytoken');
			
			var good_response = {
				status: 200,
				responseJSON: {
					"rsp": {
						"stat": "ok",
						// Other data omitted
					}
				}
			};
			rtm.ajaxRequest = function(url, options) {
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
			rtm.setToken('mydummytoken');
			
			var url_used;
			rtm.ajaxRequest = function(url, options) {
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
			rtm.timeline = '87654';
			rtm.setToken('mydummytoken');
			
			var model = new TaskListModel();
			model.setRemoteJSON(SampleTestData.big_remote_json);
			var tasks = model.getRemoteTasks();
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