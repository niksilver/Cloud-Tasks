/**
 * Test the RTM client library
 */

testCases.push( function(Y) {

	var WAIT_TIMEOUT = 500;
	
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

		testCallMethodCountsMethodPurposes: function() {
			var rtm = new RTM();
			var successfulResponse = SampleTestData.ajax_hello_world_response;
			rtm.rawAjaxRequest = function(url, options) {
				setTimeout(function() {
						options.onSuccess(successfulResponse);
					},
					250
				);
			};
			
			Y.Assert.areEqual(0, rtm.networkRequestsTotal(), "Some network requests before anything's happened");

			// Methods for pushing changes
			rtm.callMethod("rtm.auth.getFrob", {}, function(resp){ response = resp }, null);
			rtm.callMethod("rtm.auth.getToken", {}, function(resp){ response = resp }, null);
			rtm.callMethod("rtm.timelines.create", {}, function(resp){ response = resp }, null);
			rtm.callMethod("rtm.tasks.setName", {}, function(resp){ response = resp }, null);
			rtm.callMethod("rtm.tasks.setDueDate", {}, function(resp){ response = resp }, null);
			rtm.callMethod("rtm.tasks.setDueDate", {}, function(resp){ response = resp }, null);
			rtm.callMethod("rtm.tasks.delete", {}, function(resp){ response = resp }, null);
			
			// Method for pulling tasks
			rtm.callMethod("rtm.tasks.getList", {}, function(resp){ response = resp }, null);
			
			// Method that's not specified for either
			rtm.callMethod("dont.fail.on.this", {}, function(resp){ response = resp }, null);
			
			Y.Assert.areEqual(9, rtm.networkRequestsTotal(), "Wrong number of network requests");
			Y.Assert.areEqual(7, rtm.networkRequestsForPushingChanges(), "Wrong number of network requests for pushing changes");
			Y.Assert.areEqual(1, rtm.networkRequestsForPullingTasks(), "Wrong number of network requests for pulling tasks");
			
			this.wait(
				function() {
					Y.Assert.areEqual(0, rtm.networkRequestsTotal(), "Wrong number of network requests at end");
					Y.Assert.areEqual(0, rtm.networkRequestsForPushingChanges(), "Wrong number of network requests for pushing changes at end");
					Y.Assert.areEqual(0, rtm.networkRequestsForPullingTasks(), "Wrong number of network requests at end for pulling tasks");
				},
				500
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
			rtm.fireNextEvent = function() {};

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