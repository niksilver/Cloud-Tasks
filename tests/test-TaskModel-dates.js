// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the task model
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		setUp: function() {
			TestUtils.captureMojoLog();
		},
		
		tearDown: function() {
			TestUtils.restoreMojoLog();
		},
		
		testConstructorSetsDeletedDefault: function() {
			var task = new TaskModel({
				listID: '123456',
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z',
				modified: '2008-06-20T21:11:26Z'
			});
			
			Y.Assert.areEqual('123456', task.listID, "List ID doesn't get set");
			Y.Assert.areEqual('223344', task.taskseriesID, "Task series ID doesn't get set");
			Y.Assert.areEqual('667788', task.taskID, "Task ID doesn't get set");
			Y.Assert.areEqual(false, task.deleted, "Task deleted flag not set to default");
		},
		
		testConstructorSetsCompletedDefault: function() {
			var task = new TaskModel({
				listID: '123456',
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z',
				modified: '2008-06-20T21:11:26Z'
			});
			
			Y.Assert.areEqual('123456', task.listID, "List ID doesn't get set");
			Y.Assert.areEqual('223344', task.taskseriesID, "Task series ID doesn't get set");
			Y.Assert.areEqual('667788', task.taskID, "Task ID doesn't get set");
			Y.Assert.areEqual(false, task.completed, "Task completed flag not set to default");
		},
		
		testIsDue: function() {
			var task;
			var today = Date.parse("1 Dec 2009");
			
			// A task from yesterday is due
			var yesterday_utc_string = Date.parse("30 Nov 2009").toISOString();
			task = new TaskModel({ due: yesterday_utc_string });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.isDueFlag, 'A task from yesterday should be due');
			
			// A task for today is due
			var today_utc_string = today.toISOString();
			task = new TaskModel({ due: today_utc_string });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.isDueFlag, 'A task for today should be due');
			
			// A task for today (but not midnight) is due
			var later_today_utc_string = today.clone().add({ hours: 1 }).toISOString();
			task = new TaskModel({ due: later_today_utc_string });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.isDueFlag, 'A task for later on today should be due');
			
			// A task for tomorrow is not due
			var tomorrow_utc_string = Date.parse("2 Dec 2009").toISOString();
			task = new TaskModel({ due: tomorrow_utc_string });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.isDueFlag, 'A task for tomorrow should not be due');
			
			// A task with no due date set is due
			task = new TaskModel();
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.isDueFlag, 'A task with no due date should be due');
			
			// A task with empty due date set is due
			task = new TaskModel({ due: '' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.isDueFlag, 'A task with empty due date should be due');
			
			// A task with empty object due date set is due
			task = new TaskModel({ due: {} });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.isDueFlag, 'A task with empty object due date should be due');
		},

		testIsOverdue: function() {
			var task;
			var today = Date.parse("1 Dec 2009"); //Date.parse('2009-12-01T00:00:00Z');
			
			// A task from yesterday is overdue
			task = new TaskModel({ due: Date.parse("30 Nov 2009").toISOString() });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.isOverdueFlag, 'A task from yesterday should be overdue');
			
			// A task for today is not overdue
			task = new TaskModel({ due: today.toISOString() });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.isOverdueFlag, 'A task for today should not be due');
			
			// A task for tomorrow is not overdue
			task = new TaskModel({ due: Date.parse("2 Dec 2009").toISOString() });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.isOverdueFlag, 'A task for tomorrow should not be overdue');
			
			// A task with no due date set is not overdue
			task = new TaskModel();
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.isOverdueFlag, 'A task with no due date should not be overdue');

			// A task with empty due date set is not overdue
			task = new TaskModel({ due: '' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.isOverdueFlag, 'A task with empty due date should not be overdue');
			
			// A task with empty object due date set is not overdue
			task = new TaskModel({ due: {} });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.isOverdueFlag, 'A task with empty object due date should not be overdue');

		},
		
		testDueLocalWithoutTime: function() {
			var task;
			var today = Date.parse("15 May 2011");
			
			// A task set for 15 May 2011 midnight is 14 May at 2300hrs in UTC
			// time, but should still be 15 May locally
			task = new TaskModel({ due: "2011-05-14T23:00:00Z" });
			task.getTimezoneOffset = function() { return -60 };
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual("2011-05-15", task.dueLocalWithoutTime, 'Midnight BST time in London has wrong date');
			
			// A task with empty string due date should have the empty string as
			// its due local date string
			task = new TaskModel({ due: '' });
			task.update();
			Y.Assert.areEqual('', task.dueLocalWithoutTime, 'Empty-string due date not handled');
			
			// A task with no due date should have the empty string as
			// its due local date string
			task = new TaskModel( {} );
			task.update();
			Y.Assert.areEqual('', task.dueLocalWithoutTime, 'Empty-string due date not handled');
		},
		
		testDueFormatted: function() {
			var task;
			var today = Date.parse("1 Dec 2009");
			var today_fn = function() { return today };
			var timezone_fn = function(utc_string) { return 0 };
			
			// A task from yesterday
			var yesterday_utc_string = Date.parse("30 Nov 2009").toISOString();
			task = new TaskModel({ due: yesterday_utc_string });
			task.today = today_fn;
			task.getTimezoneOffset = timezone_fn;
			task.update();
			Y.Assert.areEqual('Mon 30 Nov', task.dueFormatted, 'Task from yesterday should appear as date');
			
			// A task for today
			var today_utc_string = today.toISOString();
			task = new TaskModel({ due: today_utc_string });
			task.today = today_fn;
			task.getTimezoneOffset = timezone_fn;
			task.update();
			Y.Assert.areEqual('Today', task.dueFormatted, 'A task for today should appear as Today');
			
			// A task for tomorrow
			var tomorrow_utc_string = Date.parse("2 Dec 2009").toISOString();
			task = new TaskModel({ due: tomorrow_utc_string });
			task.today = today_fn;
			task.getTimezoneOffset = timezone_fn;
			task.update();
			Y.Assert.areEqual('Tomorrow', task.dueFormatted, 'A task for tomorrow should appear as Tomorrow');
			
			// A task for later this week
			var yesterday_utc_string = Date.parse("4 Dec 2009").toISOString();
			task = new TaskModel({ due: yesterday_utc_string });
			task.today = today_fn;
			task.getTimezoneOffset = timezone_fn;
			task.update();
			Y.Assert.areEqual('Fri', task.dueFormatted, 'Task for later this week should appear as its day');
			
			// A task with no due date
			task = new TaskModel();
			task.today = today_fn;
			task.getTimezoneOffset = timezone_fn;
			task.update();
			Y.Assert.areEqual('', task.dueFormatted, 'A task with no due date should appear blank');
			
			// A task with empty due date
			task = new TaskModel({ due: '' });
			task.today = today_fn;
			task.getTimezoneOffset = timezone_fn;
			task.update();
			Y.Assert.areEqual('', task.dueFormatted, 'A task with an empty due date should appear blank');
			
			// A task with empty object
			task = new TaskModel({ due: {} });
			task.today = today_fn;
			task.getTimezoneOffset = timezone_fn;
			task.update();
			Y.Assert.areEqual('', task.dueFormatted, 'A task with due as an empty object should appear blank');
		},
		
		testSortByDueThenName: function(){
			var nov30 = new TaskModel({ due: '2009-11-30T00:00:00Z', name: 'B' });
			var nov30_2 = new TaskModel({ due: '2009-11-30T00:00:00Z', name: 'A' });
			var nov30_3 = new TaskModel({ due: '2009-11-30T00:00:00Z', name: 'C' });
			var nov30_3_again = new TaskModel({ due: '2009-11-30T00:00:00Z', name: 'C' });
			var dec1 = new TaskModel({ due: '2009-12-01T00:00:00Z' });
			
			Y.Assert.areEqual(-1, TaskModel.sortByDueThenName(nov30, dec1), 'Nov 30 should be before Dec 1');
			Y.Assert.areEqual(1, TaskModel.sortByDueThenName(dec1, nov30), 'Dec 1 should be before Nov 30');
			Y.Assert.areEqual(-1, TaskModel.sortByDueThenName(nov30_2, nov30), 'Nov 30 A should be before Nov 30 B');
			Y.Assert.areEqual(-1, TaskModel.sortByDueThenName(nov30_2, nov30_3), 'Nov 30 A should be before Nov 30 C');
			Y.Assert.areEqual(1, TaskModel.sortByDueThenName(nov30_3, nov30_2), 'Nov 30 C should be after Nov 30 A');
			Y.Assert.areEqual(0, TaskModel.sortByDueThenName(nov30_3, nov30_3_again), 'Nov 30 C should be same as Nov 30 C');
		},
		
		testSortByDueThenNameHandlesEmptyAndUndefined: function(){
			var undef_a = new TaskModel({ due: undefined, name: 'A' });
			var date_a = new TaskModel({ due: '2009-12-01T00:00:00Z', name: 'A' });
			
			Y.Assert.areEqual(-1, TaskModel.sortByDueThenName(undef_a, date_a), 'Undefined should be before defined');
			Y.Assert.areEqual(1, TaskModel.sortByDueThenName(date_a, undef_a), 'Defined should be after undefined');
		},
		
		testSortByDueThenNameHandlesVariableTimes: function(){
			var may30 = new TaskModel({ due: '2009-05-29T23:00:00Z', name: 'B' });
			var may30_2 = new TaskModel({ due: '2009-05-30T00:00:00Z', name: 'A' });
			var may30_3 = new TaskModel({ due: '2009-05-30T01:00:00Z', name: 'C' });
			var may30_3_again = new TaskModel({ due: '2009-05-30T02:00:00Z', name: 'C' });
			
			may30.getTimezoneOffset = function() { return -60; }
			may30_2.getTimezoneOffset = function() { return -60; }
			may30_3.getTimezoneOffset = function() { return -60; }
			may30_3_again.getTimezoneOffset = function() { return -60; }
			
			may30.update();
			may30_2.update();
			may30_3.update();
			may30_3_again.update();
			
			Y.Assert.areEqual(-1, TaskModel.sortByDueThenName(may30_2, may30), 'May 30 A should be before May 30 B');
			Y.Assert.areEqual(-1, TaskModel.sortByDueThenName(may30_2, may30_3), 'May 30 A should be before May 30 C');
			Y.Assert.areEqual(1, TaskModel.sortByDueThenName(may30_3, may30_2), 'May 30 C should be after May 30 A');
			Y.Assert.areEqual(0, TaskModel.sortByDueThenName(may30_3, may30_3_again), 'The two May 30 Cs should be the same');
		},
		
		testDue: function() {
			var task = new TaskModel({ due: '2010-03-31T23:00:00Z'});
			Y.Assert.areEqual('2010-03-31T23:00:00Z', task.due, "Didn't get UTC date string");
		},

		/**
		 * When in Perth, which is +0800, this is what we get...
		 * Mojo.Log.info(Date.today().getTimezoneOffset()); // -480
		 * Mojo.Log.info(Date.today().getUTCOffset()); // +0800
		 * Mojo.Log.info(Date.parse('2010-03-31T16:00:00Z').getUTCOffset()); // +0800
		 * Mojo.Log.info(Date.parse('2010-03-31T17:00:00Z').getUTCOffset()); // +0800
		 * Mojo.Log.info(Date.parse('2010-03-31T16:00-0100').getUTCOffset()); // +0800
		 * Mojo.Log.info(Date.parse('2010-03-31T10:00-0100').getHours()); // 19
		 * Mojo.Log.info(Date.parse('2010-03-31T10:00+0100').getHours()); // 17
		 */
		
		testDueAsLocalDateInPerth: function() {
			// Perth is +0800 (hours) or -480 (timezone offset)
			var task_for_perth = new TaskModel({ due: '2010-03-31T16:00:00Z'}); // 1 April 2010 in Perth
			task_for_perth.getTimezoneOffset = function(date) { return -480; };
			
			var local_date = task_for_perth.dueAsLocalDate();
			Y.Assert.areEqual(1, local_date.getDate(), "Should be 1st day of month");
			Y.Assert.areEqual(3, local_date.getMonth(), "Should be April (month index = 3)");
			Y.Assert.areEqual(2010, local_date.getFullYear(), "Should be 2010");
			Y.Assert.areEqual(0, local_date.getHours(), "Should be 0 hours (midnight)");
			Y.Assert.areEqual(0, local_date.getMinutes(), "Should be 0 minutes (midnight exactly)");
		},
		
		testSetDueAsLocalDateInPerth: function() {
			// Perth is +0800 (hours) or -480 (timezone offset)

			var task1 = new TaskModel();
			task1.getTimezoneOffset = function(date) { return -480; };
			
			task1.setDueAsLocalDate(Date.parse('2010-04-01T00:01:02Z'));
			Y.Assert.areEqual('2010-03-31T16:01:02Z', task1.due, "Couldn't set due from string");

			var task2 = new TaskModel();
			task2.getTimezoneOffset = function(date) { return -480; };
			task2.setDueAsLocalDate(new Date(2010, 03, 01, 00, 01, 02)); // 1 April 2010 at 00:01:02
			Y.Assert.areEqual('2010-03-31T16:01:02Z', task2.due, "Couldn't set due from Date object");
		},
		
		testGetAndSetLocalDateInPerth: function() {
			// Perth is +0800 (hours) or -480 (timezone offset)

			var original_utc_string = '2010-03-31T16:00:00Z'; // 1 April 2010 in Perth
			var task_for_perth = new TaskModel({ due: original_utc_string});
			task_for_perth.getTimezoneOffset = function(date) { return -480; };

			var local_date = task_for_perth.dueAsLocalDate();
			task_for_perth.setDueAsLocalDate(local_date);
			Y.Assert.areEqual(task_for_perth.due, original_utc_string, "Date didn't survive round-trip");
		},
		
		testDueAsLocalDateInLondonBST: function() {
			// London during BST is +0100
			// 1 April 2010 in London during BST
			var task_for_london_bst = new TaskModel({ due: '2010-03-31T23:00:00Z'});
			task_for_london_bst.getTimezoneOffset = function(date) { return -60; };

			var local_date = task_for_london_bst.dueAsLocalDate();
			Y.Assert.areEqual(1, local_date.getDate(), "Should be 1st day of month");
			Y.Assert.areEqual(3, local_date.getMonth(), "Should be April (month index = 3)");
			Y.Assert.areEqual(2010, local_date.getFullYear(), "Should be 2010");
			Y.Assert.areEqual(0, local_date.getHours(), "Should be 0 hours (midnight)");
			Y.Assert.areEqual(0, local_date.getMinutes(), "Should be 0 minutes (midnight exactly)");
		},
		
		testSetDueAsLocalDateLondonBST: function() {
			// London during BST is +0100
			// 1 April 2010 in London during BST

			var task1 = new TaskModel();
			task1.getTimezoneOffset = function(date) { return -60; };

			task1.setDueAsLocalDate(Date.parse('2010-04-01T00:01:02Z'));
			Y.Assert.areEqual('2010-03-31T23:01:02Z', task1.due, "Couldn't set due from string");

			var task2 = new TaskModel();
			task2.getTimezoneOffset = function(date) { return -60; };

			task2.setDueAsLocalDate(new Date(2010, 03, 01, 00, 01, 02)); // 1 April 2010 at 00:01:02
			Y.Assert.areEqual('2010-03-31T23:01:02Z', task2.due, "Couldn't set due from Date object");
		},
		
		testGetAndSetLocalDateInLondonBST: function() {
			// London is +0100 (hours) or -60 (timezone offset)

			var original_utc_string = '2010-03-31T23:00:00Z'; // 1 April 2010 in London BST
			var task_for_london_bst = new TaskModel({ due: original_utc_string});
			task_for_london_bst.getTimezoneOffset = function(date) { return -60; };

			var local_date = task_for_london_bst.dueAsLocalDate();
			task_for_london_bst.setDueAsLocalDate(local_date);
			Y.Assert.areEqual(task_for_london_bst.due, original_utc_string, "Date didn't survive round-trip");
		},
		
		testDueAsLocalDateInLondonGMT: function() {
			// London during winter (GMT) is +0000
			// 23 February 2010 in London is winter
			var task_for_london_gmt = new TaskModel({ due: '2010-02-23T00:00:00Z'});
			task_for_london_gmt.getTimezoneOffset = function(date) { return 0; };

			var local_date = task_for_london_gmt.dueAsLocalDate();
			Y.Assert.areEqual(23, local_date.getDate(), "Should be 23rd day of month");
			Y.Assert.areEqual(1, local_date.getMonth(), "Should be February (month index = 1)");
			Y.Assert.areEqual(2010, local_date.getFullYear(), "Should be 2010");
			Y.Assert.areEqual(0, local_date.getHours(), "Should be 0 hours (midnight)");
			Y.Assert.areEqual(0, local_date.getMinutes(), "Should be 0 minutes (midnight exactly)");
		},
		
		testDueAsLocalIsoStringInLondonBST: function() {
			// London is +0100 (hours) or -60 (timezone offset)

			var original_utc_string = '2011-05-11T23:00:00Z'; // 11 May 2011 midnight in London BST
			var task_for_london_bst = new TaskModel({ due: original_utc_string});
			task_for_london_bst.getTimezoneOffset = function(date) { return -60; };

			var local_iso_string = task_for_london_bst.dueAsLocalIsoString();
			Y.Assert.areEqual(local_iso_string, '2011-05-12T00:00:00', "Local date not extracted correctly");
		},
		
		testDueAsLocalIsoStringReturnsNullIfNoDueDate: function() {
			var task = new TaskModel( {} );
			Y.Assert.areEqual(task.dueAsLocalIsoString(), null, "Due date should be null");
		},
		
		testSetDueAsLocalDateLondonGMT: function() {
			// London during winter (GMT) is +0000
			// 23 February 2010 in London is during winter

			var task1 = new TaskModel();
			task1.getTimezoneOffset = function(date) { return 0; };

			task1.setDueAsLocalDate(Date.parse('2010-02-23T00:01:02Z'));
			Y.Assert.areEqual('2010-02-23T00:01:02Z', task1.due, "Couldn't set due from string");

			var task2 = new TaskModel();
			task2.getTimezoneOffset = function(date) { return 0; };

			task2.setDueAsLocalDate(new Date(2010, 01, 23, 00, 01, 02)); // 23 February 2010 at 00:01:02
			Y.Assert.areEqual('2010-02-23T00:01:02Z', task2.due, "Couldn't set due from Date object");
		},
		
		testGetAndSetLocalDateInLondonGMT: function() {
			// London in winter (GMT) is +0000 (hours) or +0 (timezone offset)

			var original_utc_string = '2010-02-23T00:00:00Z'; // 23 February 2010 in London is GMT
			var task_for_london_gmt = new TaskModel({ due: original_utc_string});
			task_for_london_gmt.getTimezoneOffset = function(date) { return 0; };

			var local_date = task_for_london_gmt.dueAsLocalDate();
			task_for_london_gmt.setDueAsLocalDate(local_date);
			Y.Assert.areEqual(task_for_london_gmt.due, original_utc_string, "Date didn't survive round-trip");
		},

		testIsoStringDateFormatter: function() {
			var task = new TaskModel();
			task.today = function() {
				return Date.parse('1 Dec 2009'); // 1st Dec 2009 is a Tuesday
			};
			task.getTimezoneOffset = function(all_these_dates) { return 0 };
			
			// Various forms of today (Tue)
			Y.Assert.areEqual('Today', task.isoStringDateFormatter('2009-12-01T00:00:00Z'), 'Test today 1');
			Y.Assert.areEqual('Today', task.isoStringDateFormatter('2009-12-01T13:27:08Z'), 'Test today 2');
			
			// Various forms of tomorrow (Wed)
			Y.Assert.areEqual('Tomorrow', task.isoStringDateFormatter('2009-12-02T00:00:00Z'), 'Test tomorrow 1');
			Y.Assert.areEqual('Tomorrow', task.isoStringDateFormatter('2009-12-02T14:54:22Z'), 'Test tomorrow 2');
			
			// Dates within the next week (Thu to Mon)
			Y.Assert.areEqual('Thu', task.isoStringDateFormatter('2009-12-03T14:54:22Z'), 'Test Thu');
			Y.Assert.areEqual('Fri', task.isoStringDateFormatter('2009-12-04T14:54:22Z'), 'Test Fri');
			Y.Assert.areEqual('Sat', task.isoStringDateFormatter('2009-12-05T14:54:22Z'), 'Test Sat');
			Y.Assert.areEqual('Sun', task.isoStringDateFormatter('2009-12-06T14:54:22Z'), 'Test Sun');
			Y.Assert.areEqual('Mon', task.isoStringDateFormatter('2009-12-07T14:54:22Z'), 'Test Mon');
			
			// Dates with the next 12 months
			Y.Assert.areEqual('Fri 8 Jan', task.isoStringDateFormatter('2010-01-08T14:54:22Z'), 'Test year 1');
			Y.Assert.areEqual('Mon 12 Jul', task.isoStringDateFormatter('2010-07-12T14:54:22Z'), 'Test year 2');
			Y.Assert.areEqual('Tue 30 Nov', task.isoStringDateFormatter('2010-11-30T14:54:22Z'), 'Test year 3');
			
			// Dates beyond next 12 months
			Y.Assert.areEqual('Wed 1 Dec 2010', task.isoStringDateFormatter('2010-12-01T14:54:22Z'), 'Test over year 1');
			Y.Assert.areEqual('Thu 2 Dec 2010', task.isoStringDateFormatter('2010-12-02T14:54:22Z'), 'Test over year 2');
			Y.Assert.areEqual('Fri 25 Feb 2011', task.isoStringDateFormatter('2011-02-25T14:54:22Z'), 'Test over year 3');
			
			// Non-times should give empty string
			Y.Assert.areEqual('', task.isoStringDateFormatter(''), 'Test none-time 1');
			Y.Assert.areEqual('', task.isoStringDateFormatter('xxx'), 'Test none-time 2');
			Y.Assert.areEqual('', task.isoStringDateFormatter({}), 'Test none-time 3');
			Y.Assert.areEqual('', task.isoStringDateFormatter(), 'Test none-time 4');
			
			// Overdue dates
			Y.Assert.areEqual('Sun 22 Nov', task.isoStringDateFormatter('2009-11-22T14:54:22Z'), 'Test overdue 1');
			task.getTimezoneOffset = function(this_next_date) { return -60 };
			Y.Assert.areEqual('Mon 2 Jun', task.isoStringDateFormatter('2008-06-02T14:54:22Z'), 'Test overdue 2');
		},
		
		testIsoStringFormatterWithDayLightSaving: function() {
			var task = new TaskModel();
			task.today = function() {
				return Date.parse('20 Mar 2010');
			};
			task.getTimezoneOffset = function(fourth_may) { return -60 };

			// Actual due date returned by RTM which the website interprets as Mon 5 April 2010
			Y.Assert.areEqual('Mon 5 Apr', task.isoStringDateFormatter('2010-04-04T23:00:00Z'), 'Daylight saving date');
		},
		
		// Testing for bug described at
		// http://forums.precentral.net/homebrew-apps/236177-cloud-tasks-2.html#post2397300
		//
		testFormattedDueDate8pmBug: function() {
			var task_for_mexico_city = new TaskModel({
				"listID": "13008814",
				"taskseriesID": "71074058",
				"taskID": "103163757",
				"name": "Test 2",
				"due": "2010-04-24T01:00:00Z", // 8pm today, 23 April 2010
				"modified": "2010-04-23T16:29:58Z",
				"deleted": false, 
				"completed": false});
			task_for_mexico_city.today = function() {
				return Date.parse('23 Apr 2010');
			};
			task_for_mexico_city.getTimezoneOffset = function(date) { return +6*60; };

			Y.Assert.areEqual('Today', task_for_mexico_city.formattedDueDate(), '8pm today in Mexico City should be today');
		}

	});

} );