/**
 * Test the MD5 function
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testSetUpConnectionManagerFiresEventOnSuccess: function() {
			var rtm = new RTM();

			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager should be initially undefined");
			
			var onSuccess_callback;
			var serviceRequestConstructor = function(url, request) {
				onSuccess_callback = request.onSuccess;
			};
			
			rtm.setHaveNetworkConnectivity = function() {};
			
			var called_fireNextEvent = false;
			rtm.fireNextEvent = function() {
				called_fireNextEvent = true;
			};
			
			rtm.setUpConnectionManager(serviceRequestConstructor);
			onSuccess_callback("Some arbitrary object");
			
			this.wait(function() {
					Y.Assert.areEqual(true, called_fireNextEvent, "Didn't fire next event");
					Y.Assert.isInstanceOf(serviceRequestConstructor, rtm.connectionManager, "Connection manager not set up");
				},
				1000
			);

		},
		
		testOnHavingNetworkConnectivityFiresNextEvent: function() {
			var rtm = new RTM();
			
			var called_fireNextEvent;
			rtm.fireNextEvent = function() {
				called_fireNextEvent = true;
			};
			
			Y.Assert.areEqual(false, rtm.haveNetworkConnectivity, "1: haveNetworkConnectivity initialised wrong");
			
			called_fireNextEvent = false;
			rtm.setHaveNetworkConnectivity(false);
			Y.Assert.areEqual(false, called_fireNextEvent, "2: Incorrectly fired next event");
			
			called_fireNextEvent = false;
			rtm.setHaveNetworkConnectivity(true);
			Y.Assert.areEqual(true, called_fireNextEvent, "3: Didn't fire next event when gaining connection");

			called_fireNextEvent = false;
			rtm.setHaveNetworkConnectivity(true);
			Y.Assert.areEqual(false, called_fireNextEvent, "4: Fired the next event when didn't need to");

			called_fireNextEvent = false;
			rtm.setHaveNetworkConnectivity(false);
			Y.Assert.areEqual(false, called_fireNextEvent, "5: Fired the next event despite losing connectivity");
		},
		
		testSetTokenFiresNextEvent: function() {
			var rtm = new RTM();
			
			var called_fireNextEvent;
			rtm.fireNextEvent = function() {
				called_fireNextEvent = true;
			};

			rtm.setToken('12345');
			Y.Assert.areEqual(true, called_fireNextEvent, "Setting the token didn't fire the next event");
		}

	});

} );