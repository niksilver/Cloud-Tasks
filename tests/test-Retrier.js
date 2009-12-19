/**
 * Test the MD5 function
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
			rtm.callMethod = function(method_name, params, on_success, on_failure) {
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
			
			var latest_modified = task_list_model.getLatestModified();
			Y.Assert.areEqual(latest_modified, rtm.getLatestModified(), "Didn't record latest modified time");
		}

	});

} );