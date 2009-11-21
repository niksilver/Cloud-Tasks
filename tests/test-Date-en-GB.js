/**
 * Test the Date-en-GB.js library from
 * http://www.datejs.com
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testISO8601ToDue: function() {
			var utc_2009_12_01 = "2009-12-01T00:00:00Z";
			Y.Assert.areEqual('Tue', Date.parse(utc_2009_12_01).toString('ddd'), "1st Dec 2009 should be a Tuesday");
		}

	});

} );