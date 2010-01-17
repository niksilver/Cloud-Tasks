/**
 * Test the Retrier mechanism
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testRetrierCreatesTimeline: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			rtm.fireNextEvent = function() {};
			
			rtm.connectionManager = "Some pretend connection manager";
			rtm.haveNetworkConnectivity = true;
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
			rtm.setToken('87654');
			rtm.networkRequests = function() { return 1; };
			rtm.networkRequestsForPushingChanges = function() { return 1; };
			rtm.networkRequestsForPullingTasks = function() { return 0; };
			
			var called_callMethod;
			// Calling a remote method is the next action in the sequence for pulling tasks
			rtm.callMethod = function(method_name, params, on_success, on_failure) {
				called_callMethod = true;
				Y.Assert.areEqual('rtm.tasks.getList', method_name, "Didn't call method to get name");
			}
			
			called_callMethod = false;
			retrier.fire();
			Y.Assert.areEqual(true, called_callMethod, "Didn't try to call the method");
			
			rtm.networkRequests = function() { return 1; };
			rtm.networkRequestsForPushingChanges = function() { return 0; };
			rtm.networkRequestsForPullingTasks = function() { return 1; };
			
			called_callMethod = false;
			retrier.fire();
			Y.Assert.areEqual(false, called_callMethod, "Tried to call method despite other activity for pulling tasks");
		},
		
		testRetrierPullTasksSequenceSetsUpTasks: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			var task_list_model = new TaskListModel();
			
			retrier.taskListModel = task_list_model;
			retrier.firePushChangesSequence = function() {};

			rtm.connectionManager = "Some dummy connection manager";
			rtm.haveNetworkConnectivity = true;
			rtm.setToken('87654');
			rtm.networkRequests = function() { return 1; };
			rtm.networkRequestsForPushingChanges = function() { return 1; };
			rtm.networkRequestsForPullingTasks = function() { return 0; };
			
			// Calling a remote method is the next action in the sequence for pushing changes
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
			retrier.fire();
			Y.Assert.areEqual(-1, url_used.indexOf('last_sync'), "last_sync parameter was mistakenly set, URL is " + url_used);
			Y.Assert.areEqual(true, called_onTaskListModelChange, "Didn't try to flag task list model change");
			Y.Assert.areEqual(18, retrier.taskListModel.getTaskList().length, "Task list model not updated correctly");
			
			var latest_modified = task_list_model.getLatestModified();
			Y.Assert.areEqual(latest_modified, rtm.getLatestModified(), "Didn't record latest modified time");
		},
		
		testRetrierPullTasksSequenceSortsTasks: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			var task_list_model = new TaskListModel();
			
			retrier.taskListModel = task_list_model;
			retrier.firePushChangesSequence = function() {};

			rtm.connectionManager = "Some dummy connection manager";
			rtm.haveNetworkConnectivity = true;
			rtm.setToken('87654');
			rtm.networkRequests = function() { return 1; };
			rtm.networkRequestsForPushingChanges = function() { return 1; };
			rtm.networkRequestsForPullingTasks = function() { return 0; };
			
			// Calling a remote method is the next action in the sequence for pushing changes
			var sample_json = SampleTestData.big_remote_json;
			rtm.ajaxRequest = function(url, options) {
				options.onSuccess({ responseJSON: sample_json });
			}
			
			retrier.fire();
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
		},
		
		testRetrierPullTasksSequencePullsOnlyTheDelta: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			var task_list_model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			
			retrier.taskListModel = task_list_model;
			retrier.firePushChangesSequence = function() {};

			rtm.connectionManager = "Some dummy connection manager";
			rtm.haveNetworkConnectivity = true;
			rtm.setToken('87654');
			rtm.networkRequests = function() { return 1; };
			rtm.networkRequestsForPushingChanges = function() { return 1; };
			rtm.networkRequestsForPullingTasks = function() { return 0; };
			
			var latest_modified = task_list_model.getLatestModified();
			rtm.setLatestModified(latest_modified);
			
			// Calling a remote method is the next action in the sequence for pushing changes
			var sample_json = SampleTestData.big_remote_json;
			var last_sync_param;
			rtm.callMethod = function(method_name, params, on_success, on_failure) {
				last_sync_param = params.last_sync;
				on_success({ responseJSON: sample_json });
			}
			
			var called_onTaskListModelChange;
			retrier.onTaskListModelChange = function() {
				called_onTaskListModelChange = true;
			}
			
			called_onTaskListModelChange = false;
			retrier.fire();
			Y.Assert.areEqual(true, called_onTaskListModelChange, "Didn't try to flag task list model change");
			Y.Assert.areEqual(18, retrier.taskListModel.getTaskList().length, "Task list model not updated correctly");
			Y.Assert.areEqual(latest_modified, last_sync_param, "last_sync not set for incremental pulling of tasks");
		},
		
		testRetrierPullTasksSequenceMergesDeltaOfOne: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			var task_list_model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			
			retrier.taskListModel = task_list_model;
			retrier.firePushChangesSequence = function() {};

			rtm.connectionManager = "Some dummy connection manager";
			rtm.haveNetworkConnectivity = true;
			rtm.setToken('87654');
			rtm.networkRequests = function() { return 1; };
			rtm.networkRequestsForPushingChanges = function() { return 1; };
			rtm.networkRequestsForPullingTasks = function() { return 0; };
			
			var latest_modified = task_list_model.getLatestModified();
			rtm.setLatestModified(latest_modified);
			
			// Calling a remote method is the next action in the sequence for pushing changes
			var sample_json = SampleTestData.last_sync_response_deleting_task_5;
			rtm.callMethod = function(method_name, params, on_success, on_failure) {
				on_success({ responseJSON: sample_json });
			}
			
			var orig_num_tasks = task_list_model.getTaskList().length;
			var task_5_spec = {
				listID: '2637966',
				taskseriesID: '54961818',
				taskID: '78667188'
			};
			
			Y.Assert.isNotUndefined(task_list_model.getTask(task_5_spec), "Couldn't find task 5 in original list");
			
			retrier.fire();
			Y.Assert.areEqual(orig_num_tasks-1, task_list_model.getTaskList().length, "Task list model not updated correctly");
			Y.Assert.isUndefined(task_list_model.getTask(task_5_spec), "Can still find task 5 in updated list");
		},

		testRetrierSpacesPullTasksSequence: function() {
			var rtm = new RTM();
			var retrier = new Retrier(rtm);
			var task_list_model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));

			retrier.taskListModel = task_list_model;
			retrier.pullEventSpacer = new EventSpacer(100);
			retrier.firePushChangesSequence = function() {};

			rtm.connectionManager = "Some dummy connection manager";
			rtm.haveNetworkConnectivity = true;
			rtm.setToken('87654');
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
			
			called_callMethod = false;
			retrier.fire();
			Y.Assert.areEqual(true, called_callMethod, "Didn't try to call the method");
			
			called_callMethod = false;
			retrier.fire();
			Y.Assert.areEqual(false, called_callMethod, "Shouldn't be pulling tasks again right after firing");
			
			this.wait(function() {
					retrier.fire();
					Y.Assert.areEqual(true, called_callMethod, "Should be pulling tasks again right after firing and a pause");
				},
				120);
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
		},
		
		testRetriersOnNetworkRequestsChangePurgesAndSavesTaskListAfterPushing: function() {
			var rtm = new RTM();
			
			var called_purgeTaskList;
			var called_saveTaskList;
			rtm.retrier.taskListModel = {
				purgeTaskList: function() {
					called_purgeTaskList = true;
					return true; // Pretend we purged some tasks
				},
				saveTaskList: function() {
					called_saveTaskList = true;
				}
			};
			
			called_purgeTaskList = false;
			called_saveTaskList = false;
			rtm.onNetworkRequestsChange(
				{ forPushingChanges: 1 },
				{ forPushingChanges: 0 }
			);
			Y.Assert.areEqual(true, called_purgeTaskList, "Should have purged when all pushes done");
			Y.Assert.areEqual(true, called_saveTaskList, "Should have saved when all pushes done");
			
			called_purgeTaskList = false;
			called_saveTaskList = false;
			rtm.onNetworkRequestsChange(
				{ forPushingChanges: 1 },
				{ forPushingChanges: 1 }
			);
			Y.Assert.areEqual(false, called_purgeTaskList, "Should not have purged while pushed ongoing");
			Y.Assert.areEqual(false, called_saveTaskList, "Should have saved while pushed ongoing");
			
			called_purgeTaskList = false;
			called_saveTaskList = false;
			rtm.onNetworkRequestsChange(
				{ forPushingChanges: 0 },
				{ forPushingChanges: 0 }
			);
			Y.Assert.areEqual(false, called_purgeTaskList, "Should not have purged when no change in pushing");
			Y.Assert.areEqual(false, called_saveTaskList, "Should have saved when no change in pushing");
			
			called_purgeTaskList = false;
			called_saveTaskList = false;
			rtm.onNetworkRequestsChange(
				{ forPushingChanges: 0 },
				{ forPushingChanges: 1 }
			);
			Y.Assert.areEqual(false, called_purgeTaskList, "Should not have purged when just starting to push");
			Y.Assert.areEqual(false, called_saveTaskList, "Should have saved when when just starting to push");
		}

	});

} );