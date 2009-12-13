/**
 * Test the RTM client library
 */

testCases.push( function(Y) {

	var WAIT_TIMEOUT = 500;
	
	return new Y.Test.Case({
		
		testSetUpConnectionManager: function() {
			var rtm = new RTM();
			
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager should be initially undefined");
			
			var called_serviceRequestConstructor = false;
			var constructor_url_called = undefined;
			var constructor_request_used = undefined;
			var serviceRequestConstructor = function ServiceRequestMock(url, request) {
				called_serviceRequestConstructor = true;
				Y.Assert.areEqual("palm://com.palm.connectionmanager", url, "Wrong URL");
				Y.Assert.areEqual('getstatus', request.method, "Wrong method called");
				Y.Assert.isNotUndefined(request.parameters, "No parameters given");
				Y.Assert.areEqual(true, request.parameters.subscribe, "Didn't subscribe");
				Y.Assert.isFunction(request.onSuccess, "Didn't link to a success handler");
			};
			
			rtm.setUpConnectionManager(serviceRequestConstructor);
			Y.Assert.areEqual(true, called_serviceRequestConstructor, "Didn't call service request after setting");
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager set up prematurely");
		},
		
		testSetUpConnectionManagerHandlesSuccess: function() {
			var rtm = new RTM();
			
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager should be initially undefined");
			
			var onSuccess_callback;
			var serviceRequestConstructor = function(url, request) {
				onSuccess_callback = request.onSuccess;
			};
			
			var called_setHaveNetworkConnectivity = false;
			rtm.setHaveNetworkConnectivity = function() {
				called_setHaveNetworkConnectivity = true;
			}
			
			rtm.setUpConnectionManager(serviceRequestConstructor);
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager set up prematurely");
			onSuccess_callback(true);
			
			this.wait(function() {
					Y.Assert.isInstanceOf(serviceRequestConstructor, rtm.connectionManager, "Connection manager not set up properly");
					Y.Assert.areEqual(true, called_setHaveNetworkConnectivity, "Didn't handle status change");
				},
				1000
			);
		},
		
		testSetUpConnectionManagerHandlesSuccessDuringConstructor: function() {
			var rtm = new RTM();
			
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager should be initially undefined");
			
			var onSuccess_callback;
			var serviceRequestConstructor = function(url, request) {
				// Note we make a successful callback before the constructor is complete
				request.onSuccess(true);
			};
			
			var called_setHaveNetworkConnectivity = false;
			rtm.setHaveNetworkConnectivity = function() {
				called_setHaveNetworkConnectivity = true;
			}
			
			rtm.setUpConnectionManager(serviceRequestConstructor);
			this.wait(function() {
					Y.Assert.isInstanceOf(serviceRequestConstructor, rtm.connectionManager, "Connection manager not set up properly");
					Y.Assert.areEqual(true, called_setHaveNetworkConnectivity, "Didn't handle status change");
				},
				1000
			);
		},
		
		testSetUpConnectionManagerHandlesFailure: function() {
			var rtm = new RTM();
			
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager should be initially undefined");
			
			var onFailure_callback;
			var serviceRequestConstructor = function(url, request) {
				onFailure_callback = request.onFailure;
			};
			
			rtm.setUpConnectionManager(serviceRequestConstructor);
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager defined after setup call");
			rtm.connectionManager = "Some pretend value";
			onFailure_callback();
			
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager has not been removed");
		},
		
		testSetUpConnectionManagerHandlesFailureDuringConstructor: function() {
			var rtm = new RTM();

			// We'll set up the connection manager just to check it gets removed.
			rtm.connectionManager = "Some pretend value";			

			var onFailure_callback;
			var serviceRequestConstructor = function(url, request) {
				// Note the failure happens before the constructor exits
				request.onFailure();
			};
			
			rtm.setUpConnectionManager(serviceRequestConstructor);
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager has not been removed");
		},
		
		testSetUpConnectionManagerHandlesError: function() {
			var rtm = new RTM();
			
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager should be initially undefined");
			
			var onError_callback;
			var serviceRequestConstructor = function(url, request) {
				onError_callback = request.onError;
			};
			
			rtm.setUpConnectionManager(serviceRequestConstructor);
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager defined after setup call");
			rtm.connectionManager = "Some pretend value";
			onError_callback();
			
			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager has not been removed");
		}

	});
} );