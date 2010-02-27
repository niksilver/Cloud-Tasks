// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the RecurrenceTranslator class.
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testCodeStringToObject: function() {
			var obj = RecurrenceTranslator.codeStringToObject("FREQ=WEEKLY;INTERVAL=1;BYDAY=WE");
			Y.Assert.areEqual("WEEKLY", obj.FREQ);
			Y.Assert.areEqual("1", obj.INTERVAL);
			Y.Assert.areEqual("WE", obj.BYDAY);
		}

	});

} );