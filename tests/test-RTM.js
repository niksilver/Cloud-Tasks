/**
 * Test the RTM client library
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testCallMethodWithSuccess: function() {
			var rtm = new RTM();
			var successfulResponse = {
				status: 200,
				responseJSON: {
					"rsp": {
						"stat": "ok",
						"api_key": API_KEY,
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
				1000
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
				1000
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
				1000
			);
		},
		
		testGetMethodErrorMessageWithSuccess: function() {
			var rtm = new RTM();
			var response = {
				status: 200,
				responseJSON: {
					"rsp": {
						"stat": "ok",
						"api_key": API_KEY,
						"format": "json",
						"method": "rtm.test.echo",
					// Echoed parameters go here
					}
				}
			};
			var msg = rtm.getMethodErrorMessage(response);
			Y.Assert.isNull(msg, "Message is not null");
		},
		
		testGetMethodErrorMessageWithError: function() {
			var rtm = new RTM();
			var response = {
				status: 200,
				responseJSON: {"rsp":{"stat":"fail","err":{"code":"97","msg":"Missing signature"}}}
			};
			var msg = rtm.getMethodErrorMessage(response);
			Y.Assert.areEqual("RTM error 97: Missing signature", msg, "Incorrect error message");
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
		
		testGetFrobSuccessfully: function() {
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
			var got_frob;
			rtm.getFrob(
				function(frob) { got_frob = frob },
				null);
			this.wait(
				function() {
					Y.Assert.areEqual("12345", got_frob, "Frob is not correct");
				},
				1000);
		},
		
		testGetFrobUnsuccessfully: function() {
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
			rtm.getFrob(
				null,
				function(msg) { got_message = msg; });
			this.wait(
				function() {
					Y.Assert.isString(got_message, "Frob error not a string");
					Y.assert( got_message.indexOf('11') >= 0, "Frob error code not found");
					Y.assert( got_message.indexOf('Funny failure message') >= 0, "Frob error text not found");
				},
				1000);
		},
		
		testGetFrobCallsCorrectMethod: function() {
			var rtm = new RTM();
			var called_url;
			rtm.ajaxRequest = function(url, options) {
				called_url = url;
			}
			rtm.getFrob(function(){}, function(){});
			this.wait(
				function() {
					Y.Assert.isString(called_url, "No URL string called");
					Y.assert(called_url.indexOf('/rest/?') >= 0, "Didn't call REST service");
					Y.assert(called_url.indexOf('method=rtm.auth.getFrob') >= 0, "Didn't call getFrob method");
				},
				1000);
		}
		
	});
} );