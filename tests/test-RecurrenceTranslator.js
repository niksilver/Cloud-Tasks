// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the RecurrenceTranslator class.
 */

testCases.push( function(Y) {

	var assertToText = function(expected, every, code_str) {
		Y.Assert.areEqual(expected,
			RecurrenceTranslator.toText({ "every": every, "$t": code_str }),
			'Could not translate {"every": ' + every + ', "$t": "' + code_str + '"}');
	}
		
	return new Y.Test.Case({

		testCodeStringToObject: function() {
			var obj = RecurrenceTranslator.codeStringToObject("FREQ=WEEKLY;INTERVAL=1;BYDAY=WE");
			Y.Assert.areEqual("WEEKLY", obj.FREQ);
			Y.Assert.areEqual("1", obj.INTERVAL);
			Y.Assert.areEqual("WE", obj.BYDAY[0]);

			obj = RecurrenceTranslator.codeStringToObject("FREQ=WEEKLY;INTERVAL=1;BYDAY=WE,TH");
			Y.Assert.areEqual("WEEKLY", obj.FREQ);
			Y.Assert.areEqual("1", obj.INTERVAL);
			Y.Assert.areEqual("WE", obj.BYDAY[0]);
			Y.Assert.areEqual("TH", obj.BYDAY[1]);
		},
		
		testToOrdinal: function() {
			Y.Assert.areEqual("1st", RecurrenceTranslator.toOrdinal(1));
			Y.Assert.areEqual("2nd", RecurrenceTranslator.toOrdinal(2));
			Y.Assert.areEqual("3rd", RecurrenceTranslator.toOrdinal(3));
			Y.Assert.areEqual("4th", RecurrenceTranslator.toOrdinal(4));
			Y.Assert.areEqual("5th", RecurrenceTranslator.toOrdinal(5));
			Y.Assert.areEqual("6th", RecurrenceTranslator.toOrdinal(6));
			Y.Assert.areEqual("7th", RecurrenceTranslator.toOrdinal(7));
			Y.Assert.areEqual("8th", RecurrenceTranslator.toOrdinal(8));
			Y.Assert.areEqual("9th", RecurrenceTranslator.toOrdinal(9));
			Y.Assert.areEqual("10th", RecurrenceTranslator.toOrdinal(10));
		},
		
		testToText: function() {
			assertToText("Every Monday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO");
			assertToText("Every Tuesday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=TU");
			assertToText("Every Wednesday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=WE");
			assertToText("Every Thursday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=TH");
			assertToText("Every Friday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=FR");
			assertToText("Every Saturday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=SA");
			assertToText("Every Sunday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=SU");

			assertToText("Every Monday and Tuesday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU");
			assertToText("Every Monday, Tuesday and Wednesday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE");
		}

	});

} );