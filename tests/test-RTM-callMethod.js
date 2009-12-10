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

		testCallMethodWithSuccess: function() {
			var rtm = new RTM();
			var successfulResponse = SampleTestData.ajax_hello_world_response;
			rtm.rawAjaxRequest = function(url, options) {
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
			rtm.rawAjaxRequest = function(url, options) {
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
			rtm.rawAjaxRequest = function(url, options) {
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
			rtm.rawAjaxRequest = function(url, options) {
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
			rtm.rawAjaxRequest = function(url, options) {
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
		}

	});
} );