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
		
		testGetMethodErrorMessageWithSuccess: function() {
			var response = SampleTestData.ajax_hello_world_response;
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
		
		testCreateTimeline: function() {
			var rtm = new RTM();
			Y.Assert.isNull(rtm.timeline, "Should have no initial timeline");
			
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
				},
				WAIT_TIMEOUT
			);

		},
		
		testAjaxRequestTracksNetworkActivity: function() {
			var rtm = new RTM();
			rtm.rawAjaxRequest = function(url_but_really_an_int, options) {
				// Fail or succeed after options.duration milliseconds
				if (url_but_really_an_int % 2 == 0) {
					setTimeout(options.onSuccess, options.duration);
				} else {
					setTimeout(options.onFailure, options.duration);
				}
			};
			var fireOffAjaxRequests = function(num_requests, duration_ms) {
				for (var i = 0; i < num_requests; i++) {
					rtm.ajaxRequest(i, {
						onSuccess: function(){},
						onFailure: function(){},
						duration: duration_ms
					});
				}
			};
			
			Y.Assert.areEqual(0, rtm.networkRequests(), "Testing 1: Should be no network requests in progress at start");
			fireOffAjaxRequests(1, 1000);
			Y.Assert.areEqual(1, rtm.networkRequests(), "Testing 1: Should be one network request after initial kick-off");
			this.wait(
				function() {
					Y.Assert.areEqual(0, rtm.networkRequests(), "Testing 1: Should be no network requests after 1 second");
				},
				1500)

			Y.Assert.areEqual(0, rtm.networkRequests(), "Testing 20: Should be no network requests in progress at start");
			fireOffAjaxRequests(20, 500);
			Y.Assert.areEqual(20, rtm.networkRequests(), "Testing 20: Should be 20 network requests after initial kick-off");
			this.wait(
				function() {
					Y.Assert.areEqual(0, rtm.networkRequests(), "Testing 20: Should be no network requests after more than 500ms");
				},
				1000
			);

		},
		
		testIsRemoteUseSetUp: function() {
			var rtm = new RTM();
			rtm.fireNextEvent = function() {};
			
			rtm.deleteToken();
			rtm.timeline = undefined;
			Y.Assert.areEqual(false, rtm.isRemoteUseSetUp(), "Remote use should not be ready with no token or timeline");
			
			rtm.setToken('1234');
			rtm.timeline = undefined;
			Y.Assert.areEqual(false, rtm.isRemoteUseSetUp(), "Remote use should not be ready with just a token");
			
			rtm.deleteToken();
			rtm.timeline = '8765';
			Y.Assert.areEqual(false, rtm.isRemoteUseSetUp(), "Remote use should not be ready with just a timeline");
			
			rtm.setToken('1234');
			rtm.timeline = '8765';
			Y.Assert.areEqual(true, rtm.isRemoteUseSetUp(), "Remote use should be ready with both a token and a timeline");
		},
		
		testSetHaveNetworkConnectivity: function() {
			var rtm = new RTM();
			rtm.fireNextEvent = function() {};
			
			Y.Assert.areEqual(false, rtm.haveNetworkConnectivity, "RTM mistakenly initialised with network connectivity");
			
			var called_onHaveNetworkConnectivityChange;
			rtm.onHaveNetworkConnectivityChange = function(new_val) {
				called_onHaveNetworkConnectivityChange = true;
			}
			
			called_onHaveNetworkConnectivityChange = false;
			rtm.setHaveNetworkConnectivity(false);
			Y.Assert.areEqual(false, rtm.haveNetworkConnectivity, "1: Connectivity flag incorrectly set");
			Y.Assert.areEqual(false, called_onHaveNetworkConnectivityChange, "1: Change function called incorrectly");
			
			called_onHaveNetworkConnectivityChange = false;
			rtm.setHaveNetworkConnectivity(true);
			Y.Assert.areEqual(true, rtm.haveNetworkConnectivity, "2: Connectivity flag incorrectly set");
			Y.Assert.areEqual(true, called_onHaveNetworkConnectivityChange, "2: Change function not called");

			called_onHaveNetworkConnectivityChange = false;
			rtm.setHaveNetworkConnectivity(true);
			Y.Assert.areEqual(true, rtm.haveNetworkConnectivity, "3: Connectivity flag incorrectly set");
			Y.Assert.areEqual(false, called_onHaveNetworkConnectivityChange, "3: Change function not called");
			
		},

		testOnHaveNetworkConnectivityChange: function() {
			var rtm = new RTM();
			var called_fireNextEvent = false;
			rtm.fireNextEvent = function() {
				called_fireNextEvent = true;
			}
			
			rtm.haveNetworkConnectivity = false;
			rtm.onHaveNetworkConnectivityChange();
			Y.Assert.areEqual(false, rtm.haveNetworkConnectivity, "Property incorrect when status is false");
			Y.Assert.areEqual(false, called_fireNextEvent, "Mistakenly called fireNextEvent when no connection");
			
			rtm.haveNetworkConnectivity = true;
			rtm.onHaveNetworkConnectivityChange();
			Y.Assert.areEqual(true, rtm.haveNetworkConnectivity, "Property incorrect when status is true");
			Y.Assert.areEqual(true, called_fireNextEvent, "Didn't call fireNextEvent despite getting a connection");
		}

	});
} );