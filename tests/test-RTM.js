/**
 * Test the RTM client library
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testCallMethodWithSuccess: function() {
			var rtm = new RTM();
			this.stubCallMethod(rtm);
			var response;
			rtm.callMethod("rtm.test.echo", {
					param1: "Hello",
					param2: "World"
				},
				function(resp){ response = resp });
			this.wait(
				function() {
					Y.Assert.areEqual('Hello', response.responseJSON.rsp.param1, "Param1 was not Hello");
					Y.Assert.areEqual('World', response.responseJSON.rsp.param2, "Param1 was not World");
				},
				1000
			);
		},

		testCallMethodWithFailure: function() {
			var rtm = new RTM();
			this.stubCallMethod(rtm);
			var message;
			rtm.callMethod("my.failing.method",
				null,
				null,
				function(msg) { message = msg; });
			this.wait(
				function() {
					Y.Assert.isString(message, "Message should be a string");
					Y.assert( message.length > 0, "Message should be non-empty");
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
		
		stubCallMethod: function(rtm){
			rtm.callMethod = function(method_name, param_object, successCallback, failureCallback){
				var fake_methods = [];
				fake_methods['rtm.test.echo'] = function(param_object) {
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
					for (param_name in param_object) {
						response.responseJSON.rsp[param_name] = param_object[param_name];
					}
					return successCallback(response);
				};
				
				fake_methods['my.failing.method'] = function(param_object){
					failureCallback("My failure message");
				};
				
				if (fake_methods[method_name]) {
					fake_methods[method_name](param_object);
				}
				else {
					throw "No such method named '" + method_name + "'";
				}
				
			}
		}

	});

} );