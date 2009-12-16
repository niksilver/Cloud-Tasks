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
		}

	});

} );