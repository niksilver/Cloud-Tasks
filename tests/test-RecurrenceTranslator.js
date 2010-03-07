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
			
			Y.Assert.areEqual("11th", RecurrenceTranslator.toOrdinal(11));
			Y.Assert.areEqual("12th", RecurrenceTranslator.toOrdinal(12));
			Y.Assert.areEqual("13th", RecurrenceTranslator.toOrdinal(13));
			Y.Assert.areEqual("14th", RecurrenceTranslator.toOrdinal(14));
			Y.Assert.areEqual("15th", RecurrenceTranslator.toOrdinal(15));
			Y.Assert.areEqual("16th", RecurrenceTranslator.toOrdinal(16));
			Y.Assert.areEqual("17th", RecurrenceTranslator.toOrdinal(17));
			Y.Assert.areEqual("18th", RecurrenceTranslator.toOrdinal(18));
			Y.Assert.areEqual("19th", RecurrenceTranslator.toOrdinal(19));

			Y.Assert.areEqual("20th", RecurrenceTranslator.toOrdinal(20));

			Y.Assert.areEqual("21st", RecurrenceTranslator.toOrdinal(21));
			Y.Assert.areEqual("22nd", RecurrenceTranslator.toOrdinal(22));
			Y.Assert.areEqual("23rd", RecurrenceTranslator.toOrdinal(23));
			Y.Assert.areEqual("24th", RecurrenceTranslator.toOrdinal(24));
			Y.Assert.areEqual("25th", RecurrenceTranslator.toOrdinal(25));
			Y.Assert.areEqual("26th", RecurrenceTranslator.toOrdinal(26));
			Y.Assert.areEqual("27th", RecurrenceTranslator.toOrdinal(27));
			Y.Assert.areEqual("28th", RecurrenceTranslator.toOrdinal(28));
			Y.Assert.areEqual("29th", RecurrenceTranslator.toOrdinal(29));

			Y.Assert.areEqual("100th", RecurrenceTranslator.toOrdinal(100));

			Y.Assert.areEqual("101st", RecurrenceTranslator.toOrdinal(101));
			Y.Assert.areEqual("102nd", RecurrenceTranslator.toOrdinal(102));
			Y.Assert.areEqual("103rd", RecurrenceTranslator.toOrdinal(103));
			Y.Assert.areEqual("104th", RecurrenceTranslator.toOrdinal(104));
			Y.Assert.areEqual("105th", RecurrenceTranslator.toOrdinal(105));
			Y.Assert.areEqual("106th", RecurrenceTranslator.toOrdinal(106));
			Y.Assert.areEqual("107th", RecurrenceTranslator.toOrdinal(107));
			Y.Assert.areEqual("108th", RecurrenceTranslator.toOrdinal(108));
			Y.Assert.areEqual("109th", RecurrenceTranslator.toOrdinal(109));
			
			Y.Assert.areEqual("110th", RecurrenceTranslator.toOrdinal(110));
			
			Y.Assert.areEqual("111th", RecurrenceTranslator.toOrdinal(111));
			Y.Assert.areEqual("112th", RecurrenceTranslator.toOrdinal(112));
			Y.Assert.areEqual("113th", RecurrenceTranslator.toOrdinal(113));
			Y.Assert.areEqual("114th", RecurrenceTranslator.toOrdinal(114));
			Y.Assert.areEqual("115th", RecurrenceTranslator.toOrdinal(115));
			Y.Assert.areEqual("116th", RecurrenceTranslator.toOrdinal(116));
			Y.Assert.areEqual("117th", RecurrenceTranslator.toOrdinal(117));
			Y.Assert.areEqual("118th", RecurrenceTranslator.toOrdinal(118));
			Y.Assert.areEqual("119th", RecurrenceTranslator.toOrdinal(119));
		},
		testNegativeNumbersToOrdinal: function() {
			Y.Assert.areEqual("last", RecurrenceTranslator.toOrdinal(-1));
			Y.Assert.areEqual("2nd last", RecurrenceTranslator.toOrdinal(-2));
			Y.Assert.areEqual("3rd last", RecurrenceTranslator.toOrdinal(-3));
			Y.Assert.areEqual("4th last", RecurrenceTranslator.toOrdinal(-4));

			Y.Assert.areEqual("10th last", RecurrenceTranslator.toOrdinal(-10));
			
			Y.Assert.areEqual("11th last", RecurrenceTranslator.toOrdinal(-11));
			Y.Assert.areEqual("12th last", RecurrenceTranslator.toOrdinal(-12));
			Y.Assert.areEqual("13th last", RecurrenceTranslator.toOrdinal(-13));

			Y.Assert.areEqual("20th last", RecurrenceTranslator.toOrdinal(-20));

			Y.Assert.areEqual("21st last", RecurrenceTranslator.toOrdinal(-21));
			Y.Assert.areEqual("22nd last", RecurrenceTranslator.toOrdinal(-22));
			Y.Assert.areEqual("23rd last", RecurrenceTranslator.toOrdinal(-23));
			Y.Assert.areEqual("24th last", RecurrenceTranslator.toOrdinal(-24));
		},
				
		testDayCodeToText: function() {
			Y.Assert.areEqual("Monday", RecurrenceTranslator.dayCodeToText("MO"));
			Y.Assert.areEqual("Tuesday", RecurrenceTranslator.dayCodeToText("TU"));
			Y.Assert.areEqual("Wednesday", RecurrenceTranslator.dayCodeToText("WE"));
			Y.Assert.areEqual("Thursday", RecurrenceTranslator.dayCodeToText("TH"));
			Y.Assert.areEqual("Friday", RecurrenceTranslator.dayCodeToText("FR"));
			Y.Assert.areEqual("Saturday", RecurrenceTranslator.dayCodeToText("SA"));
			Y.Assert.areEqual("Sunday", RecurrenceTranslator.dayCodeToText("SU"));

			Y.Assert.areEqual("2nd Monday", RecurrenceTranslator.dayCodeToText("2MO"));
			Y.Assert.areEqual("3rd Friday", RecurrenceTranslator.dayCodeToText("3FR"));
		},
		
		testDayCodeToTextWithNegatives: function() {
			Y.Assert.areEqual("last Sunday", RecurrenceTranslator.dayCodeToText("-1SU"));
			Y.Assert.areEqual("2nd last Monday", RecurrenceTranslator.dayCodeToText("-2MO"));
			Y.Assert.areEqual("3rd last Tuesday", RecurrenceTranslator.dayCodeToText("-3TU"));
			Y.Assert.areEqual("4th last Wednesday", RecurrenceTranslator.dayCodeToText("-4WE"));
		},
		
		testToTextEveryNthBlahday: function() {
			assertToText("Every Monday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO");
			assertToText("Every Tuesday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=TU");
			assertToText("Every Wednesday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=WE");
			assertToText("Every Thursday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=TH");
			assertToText("Every Friday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=FR");
			assertToText("Every Saturday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=SA");
			assertToText("Every Sunday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=SU");

			assertToText("Every Monday and Tuesday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU");
			assertToText("Every Monday, Tuesday and Wednesday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE");

			assertToText("Every 2nd Friday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=2FR");

			assertToText("Every 2nd Friday", "1", "FREQ=WEEKLY;INTERVAL=2;BYDAY=FR");
			assertToText("Every 3rd Tuesday and Wednesday", "1", "FREQ=WEEKLY;INTERVAL=3;BYDAY=TU,WE");
			assertToText("Every 4th Tuesday, Friday and Sunday", "1", "FREQ=WEEKLY;INTERVAL=4;BYDAY=TU,FR,SU");

			assertToText("Every 2nd Monday, Tuesday, Wednesday, Thursday and Friday", "1", "FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,TU,WE,TH,FR");
		},
		
		testToTextEveryWeekday: function(){
			assertToText("Every weekday", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,TU,WE,TH,FR");
		},
		
		testToTextEveryDay: function(){
			assertToText("Every day", "1", "FREQ=DAILY;INTERVAL=1");
		},
		
		testToTextEveryNWeeks: function(){
			assertToText("Every week", "1", "FREQ=WEEKLY;INTERVAL=1");
			assertToText("Every 2 weeks", "1", "FREQ=WEEKLY;INTERVAL=2");
			assertToText("Every 3 weeks", "1", "FREQ=WEEKLY;INTERVAL=3");
		},
		
		testToTextEveryNMonths: function(){
			assertToText("Every month", "1", "FREQ=MONTHLY;INTERVAL=1");
			assertToText("Every 2 months", "1", "FREQ=MONTHLY;INTERVAL=2");
			assertToText("Every 3 months", "1", "FREQ=MONTHLY;INTERVAL=3");
		},
		
		testToTextEveryNYears: function(){
			assertToText("Every year", "1", "FREQ=YEARLY;INTERVAL=1");
			assertToText("Every 2 years", "1", "FREQ=YEARLY;INTERVAL=2");
			assertToText("Every 3 years", "1", "FREQ=YEARLY;INTERVAL=3");
		},
		
		testToTextEveryMonthOnTheNth: function(){
			assertToText("Every month on the 4th", "1", "FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=4");
			assertToText("Every month on the 1st and 7th", "1", "FREQ=MONTHLY;INTERVAL=1;BYMONTHDAY=1,7");
		},
		
		testToTextEveryMonthOnTheNthBlahday: function(){
			assertToText("Every month on the 3rd Tuesday", "1", "FREQ=MONTHLY;INTERVAL=1;BYDAY=3TU");
			assertToText("Every month on the 3rd Tuesday and 3rd Friday", "1", "FREQ=MONTHLY;INTERVAL=1;BYDAY=3TU,3FR");
			assertToText("Every month on the 3rd Tuesday, 3rd Friday and 3rd Saturday", "1", "FREQ=MONTHLY;INTERVAL=1;BYDAY=3TU,3FR,3SA");
		},
		
		testToTextEveryMonthOnTheNthLastBlahday: function(){
			assertToText("Every month on the last Monday", "1", "FREQ=MONTHLY;INTERVAL=1;BYDAY=-1MO");
			assertToText("Every month on the 2nd last Friday", "1", "FREQ=MONTHLY;INTERVAL=1;BYDAY=-2FR");
			assertToText("Every month on the 2nd last Friday and 2nd last Tuesday", "1", "FREQ=MONTHLY;INTERVAL=1;BYDAY=-2FR,-2TU");
		},
		
		testUntilParameterToText: function() {
			Y.Assert.areEqual("Tue 2 Mar 2010", RecurrenceTranslator.untilParameterToText('20100302T000000'));
		},
		
		testToTextEverySomethingUntilSometime: function(){
			assertToText("Every Monday until Tue 2 Mar 2010", "1", "FREQ=WEEKLY;INTERVAL=1;BYDAY=MO;UNTIL=20100302T000000");
		},
		
		testToTextEverySomethingForXTimes: function(){
			assertToText("Every week for 20 times", "1", "FREQ=WEEKLY;INTERVAL=1;COUNT=20");
			assertToText("Every week for 1 time", "1", "FREQ=WEEKLY;INTERVAL=1;COUNT=1");
		},
		
		testToTextAfterXDays: function() {
			assertToText("After 5 days", "0", "FREQ=DAILY;INTERVAL=5");
			assertToText("After 1 day", "0", "FREQ=DAILY;INTERVAL=1");
		},
		
		testToTextAfterXWeeks: function() {
			assertToText("After 1 week", "0", "FREQ=WEEKLY;INTERVAL=1");
			assertToText("After 5 weeks", "0", "FREQ=WEEKLY;INTERVAL=5");
		}
	});

} );