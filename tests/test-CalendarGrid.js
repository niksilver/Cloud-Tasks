/**
 * Test the CalendarGrid class.
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testGetDayOfMonth: function() {
			var month1 = Date.parse('2010-01-05T00:00:00Z');
			var jan_2010_with_monday = new CalendarGrid({
				month: month1,
				firstDay: 1,
			});
			
			// Cell 0,0 Should be Mon 28 Dec
			Y.Assert.areEqual(28, jan_2010_with_monday.get(0, 0).dayOfMonth, "1: Didn't get Mon Dec 28");
			Y.Assert.areEqual(29, jan_2010_with_monday.get(0, 1).dayOfMonth, "1: Didn't get Tue Dec 29");
			Y.Assert.areEqual(1, jan_2010_with_monday.get(0, 4).dayOfMonth, "1: Didn't get Fri 1 Jan");
			Y.Assert.areEqual(31, jan_2010_with_monday.get(4, 6).dayOfMonth, "1: Didn't get Sun 31 Jan");
			Y.Assert.areEqual(1, jan_2010_with_monday.get(5, 0).dayOfMonth, "1: Didn't get Mon 1 Feb");
			Y.Assert.areEqual(7, jan_2010_with_monday.get(5, 6).dayOfMonth, "1: Didn't get Sun 7 Jan");

			var jan_2010_with_thu = new CalendarGrid({
				month: month1,
				firstDay: 4
			});
			
			// Cell 0,0 should be Thu 31 Dec
			Y.Assert.areEqual(31, jan_2010_with_thu.get(0, 0).dayOfMonth, "2: Didn't get Thu 31 Dec");
			Y.Assert.areEqual(1, jan_2010_with_thu.get(0, 1).dayOfMonth, "2: Didn't get Fri 1 Jan");

			var jan_2010_with_fri = new CalendarGrid({
				month: month1,
				firstDay: 5
			});
			
			// Cell 0,0 should be Fri 25 Dec
			Y.Assert.areEqual(25, jan_2010_with_fri.get(0, 0).dayOfMonth, "3: Didn't get Fri 25 Dec");
			Y.Assert.areEqual(26, jan_2010_with_fri.get(0, 1).dayOfMonth, "3: Didn't get Sat 26 Dec");

			var jan_2010_with_sat = new CalendarGrid({
				month: month1,
				firstDay: 6
			});
			
			// Cell 0,0 should be Sat 26 Dec
			Y.Assert.areEqual(26, jan_2010_with_sat.get(0, 0).dayOfMonth, "4: Didn't get Sat 26 Dec");
			Y.Assert.areEqual(27, jan_2010_with_sat.get(0, 1).dayOfMonth, "4: Didn't get Sun 27 Dec");
		},

		testGetDate: function() {
			var month1 = Date.parse('2010-01-05T00:00:00Z');
			var jan_2010_with_monday = new CalendarGrid({
				month: month1,
				firstDay: 1,
			});
			
			// Cell 0,0 Should be Mon 28 Dec
			Y.Assert.areEqual(28, jan_2010_with_monday.get(0, 0).date.getUTCDate(), "1: Didn't get Mon Dec 28");
			Y.Assert.areEqual(29, jan_2010_with_monday.get(0, 1).date.getUTCDate(), "1: Didn't get Tue Dec 29");
			Y.Assert.areEqual(1, jan_2010_with_monday.get(0, 4).date.getUTCDate(), "1: Didn't get Fri 1 Jan");
			Y.Assert.areEqual(31, jan_2010_with_monday.get(4, 6).date.getUTCDate(), "1: Didn't get Sun 31 Jan");
			Y.Assert.areEqual(1, jan_2010_with_monday.get(5, 0).date.getUTCDate(), "1: Didn't get Mon 1 Feb");
			Y.Assert.areEqual(7, jan_2010_with_monday.get(5, 6).date.getUTCDate(), "1: Didn't get Sun 7 Jan");

			Y.Assert.areEqual('Dec', jan_2010_with_monday.get(0, 0).date.toString('MMM'), "2: Didn't get Mon Dec 28");
			Y.Assert.areEqual('Dec', jan_2010_with_monday.get(0, 1).date.toString('MMM'), "2: Didn't get Tue Dec 29");
			Y.Assert.areEqual('Jan', jan_2010_with_monday.get(0, 4).date.toString('MMM'), "2: Didn't get Fri 1 Jan");
			Y.Assert.areEqual('Jan', jan_2010_with_monday.get(4, 6).date.toString('MMM'), "2: Didn't get Sun 31 Jan");
			Y.Assert.areEqual('Feb', jan_2010_with_monday.get(5, 0).date.toString('MMM'), "2: Didn't get Mon 1 Feb");
			Y.Assert.areEqual('Feb', jan_2010_with_monday.get(5, 6).date.toString('MMM'), "2: Didn't get Sun 7 Jan");
		},

		testGetDayOfWeekLetter: function() {
			var month1 = Date.parse('2010-01-05T00:00:00Z');
			var jan_2010_with_monday = new CalendarGrid({
				month: month1,
				firstDay: 1
			});
			
			Y.Assert.areEqual('M', jan_2010_with_monday.getDayOfWeekLetter(0), "Didn't get Monday (28 Dec)");
			Y.Assert.areEqual('T', jan_2010_with_monday.getDayOfWeekLetter(1), "Didn't get Tuesday (29 Dec)");
			Y.Assert.areEqual('W', jan_2010_with_monday.getDayOfWeekLetter(2), "Didn't get Wednesday (30 Dec)");
			Y.Assert.areEqual('T', jan_2010_with_monday.getDayOfWeekLetter(3), "Didn't get Thursday (31 Dec)");
			Y.Assert.areEqual('F', jan_2010_with_monday.getDayOfWeekLetter(4), "Didn't get Friday (1 Jan)");
			Y.Assert.areEqual('S', jan_2010_with_monday.getDayOfWeekLetter(5), "Didn't get Saturday (2 Jan)");
			Y.Assert.areEqual('S', jan_2010_with_monday.getDayOfWeekLetter(6), "Didn't get Sunday (3 Jan)");

			var month4 = Date.parse('2010-04-05T00:00:00Z');
			var apr_2010_with_sunday = new CalendarGrid({
				month: month4,
				firstDay: 0
			});

			Y.Assert.areEqual('S', apr_2010_with_sunday.getDayOfWeekLetter(0), "Didn't get Sunday for April");
			Y.Assert.areEqual('M', apr_2010_with_sunday.getDayOfWeekLetter(1), "Didn't get Monday for April");
			Y.Assert.areEqual('T', apr_2010_with_sunday.getDayOfWeekLetter(2), "Didn't get Tuesday for April");
			Y.Assert.areEqual('W', apr_2010_with_sunday.getDayOfWeekLetter(3), "Didn't get Wednesday for April");
			Y.Assert.areEqual('T', apr_2010_with_sunday.getDayOfWeekLetter(4), "Didn't get Thursday for April");
			Y.Assert.areEqual('F', apr_2010_with_sunday.getDayOfWeekLetter(5), "Didn't get Friday for April");
			Y.Assert.areEqual('S', apr_2010_with_sunday.getDayOfWeekLetter(6), "Didn't get Saturday for April");
		},
		
		testGetMonthAndYear: function() {
			var month1 = Date.parse('2010-01-05T00:00:00Z');
			var jan_2010_with_monday = new CalendarGrid({
				month: month1,
				firstDay: 1
			});
			
			Y.Assert.areEqual('January 2010', jan_2010_with_monday.getMonthAndYear(), "Didn't get Jan 2010");

			var month7 = Date.parse('2009-07-05T00:00:00Z');
			var jul_2009_with_monday = new CalendarGrid({
				month: month7,
				firstDay: 1
			});

			Y.Assert.areEqual('July 2009', jul_2009_with_monday.getMonthAndYear(), "Didn't get July 2009");
		},
		
		testGetPrevious: function() {
			var month = Date.parse('2010-03-31T00:00:00Z');
			var march = new CalendarGrid({
				month: month,
				firstDay: 3
			});
			
			var february = march.getPrevious();
			Y.Assert.areNotSame(march, february, "Calendar got reused");
			Y.Assert.areEqual('February 2010', february.getMonthAndYear(), "Month and year not correct");
			Y.Assert.areEqual(3, february.firstDay, "First day of week not preserved");
		},
		
		testGetNext: function() {
			var month = Date.parse('2010-01-31T00:00:00Z');
			var january = new CalendarGrid({
				month: month,
				firstDay: 3
			});
			
			var february = january.getNext();
			Y.Assert.areNotSame(january, february, "Calendar got reused");
			Y.Assert.areEqual('February 2010', february.getMonthAndYear(), "Month and year not correct");
			Y.Assert.areEqual(3, february.firstDay, "First day of week not preserved");
		},

		testIsInMonth: function() {
			var month1 = Date.parse('2010-01-05T00:00:00Z');
			var jan_2010_with_monday = new CalendarGrid({
				month: month1,
				firstDay: 1,
			});
			
			// Cell 0,0 Should be Mon 28 Dec
			Y.Assert.areEqual(false, jan_2010_with_monday.get(0, 0).isInMonth, "Didn't get Mon Dec 28");
			Y.Assert.areEqual(false, jan_2010_with_monday.get(0, 1).isInMonth, "Didn't get Tue Dec 29");
			Y.Assert.areEqual(true, jan_2010_with_monday.get(0, 4).isInMonth, "Didn't get Fri 1 Jan");
			Y.Assert.areEqual(true, jan_2010_with_monday.get(4, 6).isInMonth, "Didn't get Sun 31 Jan");
			Y.Assert.areEqual(false, jan_2010_with_monday.get(5, 0).isInMonth, "Didn't get Mon 1 Feb");
			Y.Assert.areEqual(false, jan_2010_with_monday.get(5, 6).isInMonth, "Didn't get Sun 7 Jan");
		},
		
		testGetIsSelected: function() {
			var jan_2010 = new CalendarGrid({
				month: Date.parse('2010-01-05T01:23:45Z'), // Not midnight
				firstDay: 1,
				selected: Date.parse('2010-01-12T14:15:16Z') // Also not midnight
			});
			
			// Cell 0,0 Should be Mon 28 Dec
			Y.Assert.areEqual(false, jan_2010.get(0, 0).isSelected, "1: Didn't get Mon Dec 28");
			Y.Assert.areEqual(false, jan_2010.get(0, 1).isSelected, "1: Didn't get Tue Dec 29");
			Y.Assert.areEqual(false, jan_2010.get(0, 4).isSelected, "1: Didn't get Fri 1 Jan");
			Y.Assert.areEqual(12, jan_2010.get(2, 1).dayOfMonth, "1: Didn't get date of Tue 12 Jan");
			Y.Assert.areEqual(true, jan_2010.get(2, 1).isSelected, "1: Didn't get selectedness Tue 12 Jan");
			Y.Assert.areEqual(false, jan_2010.get(5, 0).isSelected, "1: Didn't get Mon 1 Feb");
			Y.Assert.areEqual(false, jan_2010.get(5, 6).isSelected, "1: Didn't get Sun 7 Jan");
			
			// With no date selected
			var jan_2010_none_selected = new CalendarGrid({
				month: Date.parse('2010-01-05T00:00:00Z'),
				firstDay: 1
			});
			
			// Cell 0,0 Should be Mon 28 Dec
			Y.Assert.areEqual(false, jan_2010_none_selected.get(0, 0).isSelected, "2: Didn't get Mon Dec 28");
			Y.Assert.areEqual(false, jan_2010_none_selected.get(0, 1).isSelected, "2: Didn't get Tue Dec 29");
			Y.Assert.areEqual(false, jan_2010_none_selected.get(0, 4).isSelected, "2: Didn't get Fri 1 Jan");
			Y.Assert.areEqual(false, jan_2010_none_selected.get(2, 1).isSelected, "2: Didn't get Tue 12 Jan");
			Y.Assert.areEqual(false, jan_2010_none_selected.get(5, 0).isSelected, "2: Didn't get Mon 1 Feb");
			Y.Assert.areEqual(false, jan_2010_none_selected.get(5, 6).isSelected, "2: Didn't get Sun 7 Jan");
			
			// Date selected, but in another month
			var jan_2010_other_selected = new CalendarGrid({
				month: Date.parse('2010-01-05T02:34:56Z'), // Not midnight
				firstDay: 1,
				selected: Date.parse('2010-02-12T:11:22:33Z') // Not midnight
			});
			
			// Cell 0,0 Should be Mon 28 Dec
			Y.Assert.areEqual(false, jan_2010_other_selected.get(0, 0).isSelected, "3: Didn't get Mon Dec 28");
			Y.Assert.areEqual(false, jan_2010_other_selected.get(0, 1).isSelected, "3: Didn't get Tue Dec 29");
			Y.Assert.areEqual(false, jan_2010_other_selected.get(0, 4).isSelected, "3: Didn't get Fri 1 Jan");
			Y.Assert.areEqual(false, jan_2010_other_selected.get(2, 1).isSelected, "3: Didn't get Tue 12 Jan");
			Y.Assert.areEqual(false, jan_2010_other_selected.get(5, 0).isSelected, "3: Didn't get Mon 1 Feb");
			Y.Assert.areEqual(false, jan_2010_other_selected.get(5, 6).isSelected, "3: Didn't get Sun 7 Jan");
		},
		
		testGetIsSelectedSurvivesPreviousAndNext: function() {
			var jan_2010 = new CalendarGrid({
				month: Date.parse('2010-01-05T01:23:45Z'), // Not midnight
				firstDay: 1,
				selected: Date.parse('2010-01-12T14:15:16Z') // Also not midnight
			});
			
			var other_jan_2010 = jan_2010.getPrevious().getNext();
			// Cell 0,0 Should be Mon 28 Dec
			Y.Assert.areEqual(false, other_jan_2010.get(0, 0).isSelected, "1: Didn't get Mon Dec 28");
			Y.Assert.areEqual(false, other_jan_2010.get(0, 1).isSelected, "1: Didn't get Tue Dec 29");
			Y.Assert.areEqual(false, other_jan_2010.get(0, 4).isSelected, "1: Didn't get Fri 1 Jan");
			Y.Assert.areEqual(12, other_jan_2010.get(2, 1).dayOfMonth, "1: Didn't get date of Tue 12 Jan");
			Y.Assert.areEqual(true, other_jan_2010.get(2, 1).isSelected, "1: Didn't get selectedness Tue 12 Jan");
			Y.Assert.areEqual(false, other_jan_2010.get(5, 0).isSelected, "1: Didn't get Mon 1 Feb");
			Y.Assert.areEqual(false, other_jan_2010.get(5, 6).isSelected, "1: Didn't get Sun 7 Jan");
			
			// With no date selected
			var jan_2010_none_selected = new CalendarGrid({
				month: Date.parse('2010-01-05T00:00:00Z'),
				firstDay: 1
			});
			var other_jan_2010_none_selected = jan_2010_none_selected.getPrevious().getNext();
			
			// Cell 0,0 Should be Mon 28 Dec
			Y.Assert.areEqual(false, other_jan_2010_none_selected.get(0, 0).isSelected, "2: Didn't get Mon Dec 28");
			Y.Assert.areEqual(false, other_jan_2010_none_selected.get(0, 1).isSelected, "2: Didn't get Tue Dec 29");
			Y.Assert.areEqual(false, other_jan_2010_none_selected.get(0, 4).isSelected, "2: Didn't get Fri 1 Jan");
			Y.Assert.areEqual(false, other_jan_2010_none_selected.get(2, 1).isSelected, "2: Didn't get Tue 12 Jan");
			Y.Assert.areEqual(false, other_jan_2010_none_selected.get(5, 0).isSelected, "2: Didn't get Mon 1 Feb");
			Y.Assert.areEqual(false, other_jan_2010_none_selected.get(5, 6).isSelected, "2: Didn't get Sun 7 Jan");
		},
		
		testGetIsWeekend: function() {
			var month = Date.parse('2010-01-05T00:00:00Z');
			var jan_2010 = new CalendarGrid({
				month: month,
				firstDay: 1
			});
			
			Y.Assert.areEqual(false, jan_2010.get(0, 0).isWeekend, "1: Didn't get Mon Dec 28");
			Y.Assert.areEqual(false, jan_2010.get(0, 1).isWeekend, "1: Didn't get Tue Dec 29");
			Y.Assert.areEqual(false, jan_2010.get(0, 4).isWeekend, "1: Didn't get Fri 1 Jan");
			Y.Assert.areEqual(true, jan_2010.get(5, 5).isWeekend, "1: Didn't get Sat 6 Jan");
			Y.Assert.areEqual(true, jan_2010.get(5, 6).isWeekend, "1: Didn't get Sun 7 Jan");
		}

	});

} );