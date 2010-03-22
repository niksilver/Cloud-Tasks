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
			var today = Date.parse('2009-12-01T00:00:00Z');
			
			// A task from yesterday is due
			task = new TaskModel({ due: '2009-11-30T00:00:00Z' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.isDueFlag, 'A task from yesterday should be due');
			
			// A task for today is due
			task = new TaskModel({ due: '2009-12-01T00:00:00Z' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.isDueFlag, 'A task for today should be due');
			
			// A task for tomorrow is not due
			task = new TaskModel({ due: '2009-12-02T00:00:00Z' });
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
			var today = Date.parse('2009-12-01T00:00:00Z');
			
			// A task from yesterday is overdue
			task = new TaskModel({ due: '2009-11-30T00:00:00Z' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.isOverdueFlag, 'A task from yesterday should be overdue');
			
			// A task for today is not overdue
			task = new TaskModel({ due: '2009-12-01T00:00:00Z' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.isOverdueFlag, 'A task for today should not be due');
			
			// A task for tomorrow is not overdue
			task = new TaskModel({ due: '2009-12-02T00:00:00Z' });
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
		
		testDueAsUTCString: function() {
			var task = new TaskModel({ due: '2010-03-31T23:00:00Z'});
			Y.Assert.areEqual('2010-03-31T23:00:00Z', task.dueAsUTCString(), "Didn't get UTC date string");
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
			task1.setDueAsLocalDate(Date.parse('2010-04-01T00:01:02Z'));
			Y.Assert.areEqual('2010-03-31T16:01:02Z', task1.dueAsUTCString(), "Couldn't set due from string");

			var task2 = new TaskModel();
			task2.setDueAsLocalDate(new Date(2010, 03, 01, 00, 01, 02)); // 1 April 2010 at 00:01:02
			Y.Assert.areEqual('2010-03-31T16:01:02Z', task2.dueAsUTCString(), "Couldn't set due from Date object");
		},
		
		testGetAndSetLocalDateInPerth: function() {
			// Perth is +0800 (hours) or -480 (timezone offset)

			var original_utc_string = '2010-03-31T16:00:00Z'; // 1 April 2010 in Perth
			var task_for_perth = new TaskModel({ due: original_utc_string});
			var local_date = task_for_perth.dueAsLocalDate();
			task_for_perth.setDueAsLocalDate(local_date);
			Y.Assert.areEqual(task_for_perth.dueAsUTCString(), original_utc_string, "Date didn't survive round-trip");
		},
		
		testDueAsLocalDateInLondonBST: function() {
			// London during BST is +0800
			// 1 April 2010 in London during BST
			var task_for_london_bst = new TaskModel({ due: '2010-03-31T23:00:00Z'});
			var local_date = task_for_london_bst.dueAsLocalDate();
			Y.Assert.areEqual(1, local_date.getDate(), "Should be 1st day of month");
			Y.Assert.areEqual(3, local_date.getMonth(), "Should be April (month index = 3)");
			Y.Assert.areEqual(2010, local_date.getFullYear(), "Should be 2010");
			Y.Assert.areEqual(0, local_date.getHours(), "Should be 0 hours (midnight)");
			Y.Assert.areEqual(0, local_date.getMinutes(), "Should be 0 minutes (midnight exactly)");
		}
		
		/* testDueDateDuringSummerTime: function() {
			
			 [20100321-10:44:46.121000] info: Store.loadAllTasks: Loaded {"localID": 3444, "listID": "11122940", "taskseriesID": "674
47625", "taskID": "97529399", "name": "Toe tee", "due": "2010-03-31T23:00:00Z", "modified": "2010-03-21T10:17:25Z", "del
eted": false, "localChanges": [], "completed": false}
			
			// During summer time RTM can set a due date as 2010-03-31T23:00:00Z
			// (Sun 31 March 2010 at 2300hrs) which actually means Mon 1 April 2010
			// at midnight because of summer time.
			
			var task = TaskModel.createFromObject({
				"listID": "11122940", "taskseriesID": "67447625", "taskID": "97529399",
				"name": "Toe tee", "due": "2010-03-31T23:00:00Z",
				"deleted": false, "localChanges": [], "completed": false
			});
		}, */
		
		/* Test set from Perth:
		 * 
		 * [20100322-02:19:21.643094] info: Store.executeInTransaction: Executing SQL insert or replace into tasks (id, json) value
s (?, ?) and args [3452,{"localID": 3452, "listID": "11122940", "taskseriesID": "67474211", "taskID": "97570964", "name"
: "Testing from perth", "due": "2010-03-31T16:00:00Z", "modified": "2010-03-21T18:17:22Z", "deleted": false, "localChang
es": [], "completed": false}]
		 */

	});

} );