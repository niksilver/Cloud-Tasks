/**
 * Test the Date-en-GB.js library from
 * http://www.datejs.com
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testISO8601ToDue: function() {
			var utc_2009_12_01 = "2009-12-01T00:00:00Z";
			Y.Assert.areEqual('Tue', Date.parse(utc_2009_12_01).toString('ddd'), "1st Dec 2009 should be a Tuesday");
		},
		
		testBeforeAndAfter: function() {
			var dec_1st = Date.parse('1 Dec 2009');
			var nov_30th = Date.parse('30 Nov 2009');
			Y.assert(dec_1st.isAfter(nov_30th), "isAfter doesn't work as expected. " + dec_1st + " is not after " + nov_30th);
			Y.assert(nov_30th.isBefore(dec_1st), "isBefore doesn't work as expected. " + nov_30th + " is not before " + dec_1st);
		}

	});

} );