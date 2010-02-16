// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the TestUtils
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testContinueRun: function() {
			doSomethingLengthy = function(onSuccess) {
				window.setTimeout(onSuccess, 200);
			}
			
			var test = this;
			var output = "";
			TestUtils.runInSeries(test, 1000,
			[
				function() {
					TestUtils.quickLog("At stage A,B");
					output += "A";
					Y.Assert.areEqual("A", output, "Got wrong output");
					doSomethingLengthy(function() {
						output += "B";
						Y.Assert.areEqual("AB", output, "Got wrong output");
						TestUtils.quickLog("Continuing run at stage A,B");
						TestUtils.continueRun();
					});
					TestUtils.waitToContinueRun();
				},
				function() {
					TestUtils.quickLog("At stage C");
					output += "C";
					Y.Assert.areEqual("ABC", output, "Got wrong output");
					TestUtils.quickLog("Continuing run at stage C");
					//TestUtils.continueRun();
				},
				function() {
					TestUtils.quickLog("At stage D,E");
					output += "D";
					Y.Assert.areEqual("ABCD", output, "Got wrong output");
					doSomethingLengthy(function() {
						output += "E";
						Y.Assert.areEqual("ABCDE", output, "Got wrong output");
						TestUtils.quickLog("Continuing run at stage D,E");
						TestUtils.continueRun();
					});
					TestUtils.waitToContinueRun();
				},
				function() {
					TestUtils.quickLog("At stage last");
					Y.Assert.areEqual("ABCDE", output, "Got wrong output");
					TestUtils.quickLog("Continuing run at stage last");
					//TestUtils.continueRun();
				}
			]);
		}

	});

} );