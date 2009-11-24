/**
 * Test the RTM client library
 */

testCases.push( function(Y) {

	var WAIT_TIMEOUT = 500;
	
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
			Y.assert(url.indexOf('api_key=' + API_KEY) >= 0, "Auth URL does include API key");
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
		}

	});
} );