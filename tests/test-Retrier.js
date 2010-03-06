// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the Retrier mechanism
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		setUp: function() {
			TestUtils.captureMojoLog();
		},
		
		tearDown: function() {
			TestUtils.restoreMojoLog();
		},

		testRetrierCreatesTimeline: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			rtm.fireNextEvent = function() {};
			
			rtm.connectionManager = "Some pretend connection manager";
			rtm.haveNetworkConnectivity = true;
			rtm.rawAjaxRequest = function(){};
			rtm.setToken('12345');
			
			var called_createTimeline = false;
			rtm.createTimeline = function() {
				called_createTimeline = true;
				rtm.timeline = '87654';
			}
			
			retrier.fire();
			Y.Assert.areEqual(true, called_createTimeline, "Timeline creation not attempted");
			
			called_createTimeline = false;
			retrier.fire();
			Y.Assert.areEqual(false, called_createTimeline, "Timeline creation mistakenly attempted again");
		},
		
		testRetrierUsesGivenTaskListModel: function() {
			var rtm = new RTM();
			rtm.fireNextEvent = function() {};
			var retrier = new Retrier(rtm);
			var tlm = new TaskListModel();
			retrier.taskListModel = tlm;
			
			rtm.connectionManager = "Some pretend connection manager";
			rtm.haveNetworkConnectivity = true;
			rtm.rawAjaxRequest = function(){};
			rtm.setToken('12345');
			rtm.timeline = '87654';
			
			var called_pushLocalChanges = false;
			var tlm_used;
			rtm.pushLocalChanges = function(task_list_model) {
				called_pushLocalChanges = true;
				tlm_used = task_list_model;
			};
			
			retrier.fire();
			Y.Assert.areEqual(true, called_pushLocalChanges, "Did not attempt to push local changes");
			Y.Assert.areEqual(tlm, tlm_used, "Did not use the TaskListModel specified");
		},
		
		testRetrierRunsSetUpConnectionManagerIndependently: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);

			rtm.rawAjaxRequest = function(){};
			retrier.serviceRequestConstructor = "Some service request constructor";
			
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager has been mistakenly initialised");
			
			var called_setUpConnectionManager = false;
			rtm.setUpConnectionManager = function() {
				called_setUpConnectionManager = true;
			}
			
			var called_firePushChangesSequence = false;
			retrier.firePushChangesSequence = function() {
				called_firePushChangesSequence = true;
			}
			
			retrier.fire();
			Y.Assert.areEqual(true, called_setUpConnectionManager, "Didn't try to set up connection manager");
			Y.Assert.areEqual(true, called_firePushChangesSequence, "Didn't try to fire push changes sequence");
		},
		
		testRetrierRunsPushChangesSequenceWhenNoActivityForPulling: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			rtm.connectionManager = "Some dummy connection manager";
			rtm.haveNetworkConnectivity = true;
			rtm.rawAjaxRequest = function(){};
			rtm.setToken('87654');
			rtm.networkRequests = function() { return 1; };
			rtm.networkRequestsForPushingChanges = function() { return 0; };
			rtm.networkRequestsForPullingTasks = function() { return 1; };
			
			var called_createTimeline;
			// Create timeline is the next action in the sequence for pushing changes
			rtm.createTimeline = function() {
				called_createTimeline = true;
			}
			
			called_createTimeline = false;
			retrier.fire();
			Y.Assert.areEqual(true, called_createTimeline, "Didn't try to create a timeline");
			
			rtm.networkRequests = function() { return 1; };
			rtm.networkRequestsForPushingChanges = function() { return 1; };
			rtm.networkRequestsForPullingTasks = function() { return 0; };
			
			called_createTimeline = false;
			retrier.fire();
			Y.Assert.areEqual(false, called_createTimeline, "Tried to create timeline despite other activity for pushing changes");
		},

		testRetrierRunsPullTasksSequenceWhenNoActivityForPulling: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			retrier.firePushChangesSequence = function() {};

			rtm.connectionManager = "Some dummy connection manager";
			rtm.haveNetworkConnectivity = true;
			rtm.rawAjaxRequest = function(){};
			rtm.setToken('87654');
			rtm.networkRequests = function() { return 1; };
			rtm.networkRequestsForPushingChanges = function() { return 1; };
			rtm.networkRequestsForPullingTasks = function() { return 0; };
			
			var called_pullTasks;
			// Calling the pullTasks() method is the next action in the sequence for pulling tasks
			retrier.pullTasks = function() {
				called_pullTasks = true;
			}
			
			called_pullTasks = false;
			retrier.fire();
			Y.Assert.areEqual(true, called_pullTasks, "Didn't try to pull the tasks");
			
			rtm.networkRequests = function() { return 1; };
			rtm.networkRequestsForPushingChanges = function() { return 0; };
			rtm.networkRequestsForPullingTasks = function() { return 1; };
			
			called_pullTasks = false;
			retrier.fire();
			Y.Assert.areEqual(false, called_pullTasks, "Tried to pull tasks despite other activity for pulling tasks");
		},

		testRetrierPullTasksCallsRightGetMethod: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			
			var called_callMethod;
			rtm.callMethod = function(method_name, params, on_success, on_failure) {
				called_callMethod = true;
				Y.Assert.areEqual('rtm.tasks.getList', method_name, "Didn't call method to get name");
			}
			
			called_callMethod = false;
			retrier.pullTasks();
			Y.Assert.areEqual(true, called_callMethod, "Didn't try to call the method");
		},
		
		testRetrierPullTasksSequenceSetsUpTasks: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			var task_list_model = new TaskListModel();
			
			retrier.taskListModel = task_list_model;
			
			var sample_json = SampleTestData.big_remote_json;
			var url_used;
			rtm.ajaxRequest = function(url, options) {
				url_used = url;
				options.onSuccess({ responseJSON: sample_json });
			}
			
			var called_onTaskListModelChange;
			retrier.onTaskListModelChange = function() {
				called_onTaskListModelChange = true;
			}
			
			called_onTaskListModelChange = false;
			retrier.pullTasks();
			
			// The processing of the pulled tasks is split up and deferred to
			// avoid the webOS 10 second timeout, so we need to defer our
			// assertions until we know the processing is done
			
			this.wait(function() {
				Y.Assert.areEqual(-1, url_used.indexOf('last_sync'), "last_sync parameter was mistakenly set, URL is " + url_used);
				Y.Assert.areEqual(true, called_onTaskListModelChange, "Didn't try to flag task list model change");
				Y.Assert.areEqual(18, retrier.taskListModel.getTaskList().length, "Task list model not updated correctly");
				
				var latest_modified = task_list_model.getLatestModified();
				Y.Assert.areEqual(latest_modified, rtm.getLatestModified(), "Didn't record latest modified time");
			}, 300);
		},
		
		testRetrierGetListOnSuccessCallbackSortsTasks: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			var task_list_model = new TaskListModel();
			
			retrier.taskListModel = task_list_model;
			
			retrier.getListOnSuccessCallback({ responseJSON: SampleTestData.big_remote_json });
			
			// This processes the tasks in deferred functions, so we'll have to
			// wait before checking that they were sorted correctly.

			this.wait(function() {
				Y.Assert.areEqual(18, task_list_model.getTaskList().length, "Task list model not updated correctly");
				
				for (var i = 1; i < task_list_model.getTaskList().length; i++) {
					var prev_task  = task_list_model.getTaskList()[i-1];
					var prev_name = prev_task.name;
					var prev_due = prev_task.due;
					var curr_task  = task_list_model.getTaskList()[i];
					var curr_name = curr_task.name;
					var curr_due = curr_task.due;
					var prev_date = Date.parse(prev_due);
					var curr_date = Date.parse(curr_due);
					if (prev_date.isBefore(curr_date)) {
						// Ordered by date, good
						continue;
					}
					else if (prev_date.isAfter(curr_date)) {
						// Out of date order -- bad
						Y.fail("Out of date order: task[" + (i-1) + "] is '" + prev_name + " due " + prev_due
							+ ", task[" + i + "] is '" + curr_name + "' due " + curr_due);
					}
					else {
						// Dates are the same
						if (prev_name > curr_name) {
							Y.fail("Same dates, out of alpha-order: task[" + (i-1) + "] is '" + prev_name + " due " + prev_due
								+ ", task[" + i + "] is '" + curr_name + "' due " + curr_due);
						}
					}
				}
			}, 200);
			
		},
		
		testRetrierPullTasksRequestsOnlyTheDelta: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			var task_list_model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			
			retrier.taskListModel = task_list_model;
			
			var latest_modified = task_list_model.getLatestModified();
			rtm.setLatestModified(latest_modified);
			
			var last_sync_param;
			rtm.callMethod = function(method_name, params, on_success, on_failure) {
				last_sync_param = params.last_sync;
				on_success({ /* some response param */ });
			}
			
			var called_getListOnSuccessCallback;
			retrier.getListOnSuccessCallback = function() {
				called_getListOnSuccessCallback = true;
			}
			
			called_getListOnSuccessCallback = false;
			retrier.pullTasks();
			Y.Assert.areEqual(true, called_getListOnSuccessCallback, "Didn't execute the getList success callback");
			Y.Assert.areEqual(latest_modified, last_sync_param, "last_sync not set for incremental pulling of tasks");
		},
		
		testRetrierPullTasksSequenceMergesDeltaOfOne: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			var task_list_model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			
			retrier.taskListModel = task_list_model;
			
			var latest_modified = task_list_model.getLatestModified();
			rtm.setLatestModified(latest_modified);
			
			// The Retrier should call the method to get the tasks
			var json_which_deletes_task = SampleTestData.last_sync_response_deleting_task_5;
			rtm.callMethod = function(method_name, params, on_success, on_failure) {
				on_success({ responseJSON: json_which_deletes_task });
			}
			
			var orig_num_tasks = task_list_model.getTaskList().length;
			var task_5_spec = {
				listID: '2637966',
				taskseriesID: '54961818',
				taskID: '78667188'
			};
			
			Y.Assert.isNotUndefined(task_list_model.getTask(task_5_spec), "Couldn't find task 5 in original list");
			
			retrier.pullTasks();
			// The success callback from this splits its work into deferred functions, so
			// we need to wait a bit before making our assertions.
			
			this.wait(function() {
				Y.Assert.areEqual(orig_num_tasks-1, task_list_model.getTaskList().length, "Task list model not updated correctly");
				Y.Assert.isUndefined(task_list_model.getTask(task_5_spec), "Can still find task 5 in updated list");
			}, 200);
		},

		testRetrierSpacesPullTasksSequence: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			var task_list_model = new TaskListModel();

			retrier.taskListModel = task_list_model;
			retrier.pullEventSpacer = new EventSpacer(100);

			rtm.haveNetworkConnectivity = true;
			rtm.networkRequests = function() { return 1; };
			rtm.networkRequestsForPushingChanges = function() { return 1; };
			rtm.networkRequestsForPullingTasks = function() { return 0; };
			
			var called_callMethod;
			// Calling a remote method is the next action in the sequence for pulling tasks
			rtm.callMethod = function(method_name, params, on_success, on_failure) {
				called_callMethod = true;
				Y.Assert.areEqual('rtm.tasks.getList', method_name, "Didn't call method to get name");
				on_success({ responseJSON: SampleTestData.last_sync_response_deleting_task_5 });
			}

			// It will take a moment to run the success callback each time, as they are deferred
			// functions, so we need to space things out a bit.
			
			TestUtils.runInSeries(this, 50, [
				function() {
					called_callMethod = false;
					retrier.firePullTasksSequence();
				},
				function() {
					Y.Assert.areEqual(true, called_callMethod, "Didn't try to call the method");
					
					called_callMethod = false;
					retrier.firePullTasksSequence();
				},
				function() {
					Y.Assert.areEqual(false, called_callMethod, "Shouldn't be pulling tasks again right after firing");
					retrier.firePullTasksSequence();
				},
				function() {
					Y.Assert.areEqual(true, called_callMethod, "Should be pulling tasks again right after firing and a pause");
				}
			]);
		},
		
		testRetrierHandlesOnNetworkRequestsChange: function() {
			var rtm = new RTM();
			
			var called_onNetworkRequestsChange = false;
			var onNetworkRequestsChange = function(old_values, new_values) {
				called_onNetworkRequestsChange = true;
				Y.Assert.areEqual('some old values', old_values, "Old values not passed in");
				Y.Assert.areEqual('some new values', new_values, "New values not passed in");
			};
			var RetrierExtended = TestUtils.extend(Retrier, {
				onNetworkRequestsChange: onNetworkRequestsChange
			});
			
			var retrier = new RetrierExtended(rtm);
			rtm.onNetworkRequestsChange('some old values', 'some new values');
			Y.Assert.areEqual(true, called_onNetworkRequestsChange, "onNetworkRequestsChange not called");
		}

	});

} );