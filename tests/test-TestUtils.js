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
			
			var output = "";
			TestUtils.runInSeries(this, 1000,
			[
				function() {
					output += "A";
					Y.Assert.areEqual("A", output, "Got wrong output");
					doSomethingLengthy(function() {
						output += "B";
						Y.Assert.areEqual("AB", output, "Got wrong output");
						TestUtils.continueRun();
					});
				},
				function() {
					output += "C";
					Y.Assert.areEqual("ABC", output, "Got wrong output");
					TestUtils.continueRun();
				},
				function() {
					output += "D";
					Y.Assert.areEqual("ABCD", output, "Got wrong output");
					doSomethingLengthy(function() {
						output += "E";
						Y.Assert.areEqual("ABCDE", output, "Got wrong output");
						TestUtils.continueRun();
					});
				},
				function() {
					Y.Assert.areEqual("ABCDE", output, "Got wrong output");
					TestUtils.continueRun();
				}
			]);
		}

	});

} );