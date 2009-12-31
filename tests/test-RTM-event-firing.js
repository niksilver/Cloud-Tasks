/**
 * Test the MD5 function
 */

testCases.push( function(Y) {

	var WAIT_TIMEOUT = 500;

	return new Y.Test.Case({

		testSetUpConnectionManagerFiresEventOnSuccess: function() {
			var rtm = new RTM();

			Y.Assert.isUndefined(rtm.connectionManager, "Connection manager should be initially undefined");
			Y.Assert.areEqual(false, rtm.haveNetworkConnectivity, "Internet connectivity incorrect flagged initially");
			
			var onSuccess_callback;
			var serviceRequestConstructor = function(url, request) {
				onSuccess_callback = request.onSuccess;
			};
			
			var called_fireNextEvent = false;
			rtm.fireNextEvent = function() {
				// Likely to be called twice: Once when we set the connection manager
				// and once when we set having internet connectivity
				called_fireNextEvent = true;
				Y.Assert.isNotUndefined(rtm.connectionManager, "Next event fired but connection manager not defined");
			};
			
			rtm.setUpConnectionManager(serviceRequestConstructor);
			onSuccess_callback({isInternetConnectionAvailable: true});
			
			this.wait(function() {
					Y.Assert.areEqual(true, called_fireNextEvent, "Didn't fire next event");
					Y.Assert.isInstanceOf(serviceRequestConstructor, rtm.connectionManager, "Connection manager not set up");
					Y.Assert.areEqual(true, rtm.haveNetworkConnectivity, "Network connectivity not flagged");
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
		},
		
		testCreateTimelineFiresEventOnSuccess: function() {
			var rtm = new RTM();
			
			var called_fireNextEvent = false;
			rtm.fireNextEvent = function() {
				called_fireNextEvent = true;
			};
			
			rtm.rawAjaxRequest = function(url, options) {
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
					Y.Assert.areEqual(true, called_fireNextEvent, "Did not fire next event");
				},
				WAIT_TIMEOUT
			);

		},
		
		testAjaxRequestCallsOnNetworkRequestChange: function() {
			var rtm = new RTM();
			
			rtm.rawAjaxRequest = function(url, options) {
				options.onSuccess( {/* Some successful response */} );
			}
			
			var called_first_on_change_fn = false;
			var called_second_on_change_fn = false;
			
			var second_on_change_fn = function(old_values, new_values) {
				called_second_on_change_fn = true;
				Y.Assert.isNotUndefined(old_values, "Second call: Old values should be defined");
				Y.Assert.isNotUndefined(new_values, "Second call: New values should be defined");
				Y.Assert.areEqual(1, old_values.total, "Second call: Should be starting from 1 connection in total");
				Y.Assert.areEqual(1, old_values.forPushingChanges, "Second call: Should be starting from 1 connection for pushing changes");
				Y.Assert.areEqual(0, new_values.total, "Second call: Should have moved to 0 connections in total");
				Y.Assert.areEqual(0, new_values.forPushingChanges, "Second call: Should have moved to 0 connections for pushing changes");
			}
			
			var first_on_change_fn = function(old_values, new_values) {
				called_first_on_change_fn = true;
				Y.Assert.isNotUndefined(old_values, "First call: Old values should be defined");
				Y.Assert.isNotUndefined(new_values, "First call: New values should be defined");
				Y.Assert.areEqual(0, old_values.total, "First call: Should be starting from 0 connections in total");
				Y.Assert.areEqual(0, old_values.forPushingChanges, "First call: Should be starting from 0 connections for pushing changes");
				Y.Assert.areEqual(1, new_values.total, "First call: Should have moved to 1 connection in total");
				Y.Assert.areEqual(1, new_values.forPushingChanges, "First call: Should have moved to 1 connection for pushing changes");
				rtm.onNetworkRequestsChange = second_on_change_fn;
			}
			
			rtm.onNetworkRequestsChange = first_on_change_fn;
			
			rtm.ajaxRequest("http://some.url.here", {
				onSuccess: function(){},
				rtmMethodPurpose: 'forPushingChanges'
			});
		}

	});

} );