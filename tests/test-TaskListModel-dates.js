// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the task list model
 */

testCases.push( function(Y) {

	var INITIALISE_STORE = function() {
		Store.initialise();
	};

	return new Y.Test.Case({
		
		setUp: function() {
			TestUtils.captureMojoLog();
		},
		
		tearDown: function() {
			TestUtils.restoreMojoLog();
		},
		
		testDueTasksFlagged: function() {
			var tasks = TaskListModel.objectToTaskList(SampleTestData.remote_json_with_overdue_tasks);

			var task_hash = {};			
			tasks.each(function(task) {
				task_hash[task.taskID] = task;
				task.today = function() {
					return Date.parse('1 Dec 2009'); // 1st Dec 2009 is a Tuesday
				};
				task.update();
			});
			
			Y.Assert.areEqual(true, task_hash['79648346'].isDueFlag, "Test 1: No due date");
			Y.Assert.areEqual(true, task_hash['75724449'].isDueFlag, "Test 2: A while back");
			Y.Assert.areEqual(false, task_hash['66459582'].isDueFlag, "Test 3: The future");
			Y.Assert.areEqual(true, task_hash['11223344'].isDueFlag, "Test 4: Today");
		},

		testOverdueTasksFlagged: function() {

			var model = new TaskListModel();
			model.today = function() {
				return Date.parse('1 Dec 2009'); // 1st Dec 2009 is a Tuesday
			};

			var tasks = TaskListModel.objectToTaskList(SampleTestData.remote_json_with_overdue_tasks);

			var task_hash = {};
			tasks.each(function(task) {
				task.today = model.today; // Force today calculation
				task.update(); // Force overdue calculations based on forced idea of today
				task_hash[task.taskID] = task;
			});
			
			Y.Assert.areEqual(false, task_hash['79648346'].isOverdueFlag, "Test 1: No due date");
			Y.Assert.areEqual(true, task_hash['75724449'].isOverdueFlag, "Test 2: A while back");
			Y.Assert.areEqual(false, task_hash['66459582'].isOverdueFlag, "Test 3: The future");
			Y.Assert.areEqual(false, task_hash['11223344'].isOverdueFlag, "Test 4: Today");
		},

		testDueDateFormatter: function() {
			var model = new TaskListModel();
			model.today = function() {
				return Date.parse('1 Dec 2009'); // 1st Dec 2009 is a Tuesday
			};
			
			// Various forms of today (Tue)
			Y.Assert.areEqual('Today', model.dueDateFormatter('2009-12-01T00:00:00Z'), 'Test today 1');
			Y.Assert.areEqual('Today', model.dueDateFormatter('2009-12-01T13:27:08Z'), 'Test today 2');
			
			// Various forms of tomorrow (Wed)
			Y.Assert.areEqual('Tomorrow', model.dueDateFormatter('2009-12-02T00:00:00Z'), 'Test tomorrow 1');
			Y.Assert.areEqual('Tomorrow', model.dueDateFormatter('2009-12-02T14:54:22Z'), 'Test tomorrow 2');
			
			// Dates within the next week (Thu to Mon)
			Y.Assert.areEqual('Thu', model.dueDateFormatter('2009-12-03T14:54:22Z'), 'Test Thu');
			Y.Assert.areEqual('Fri', model.dueDateFormatter('2009-12-04T14:54:22Z'), 'Test Fri');
			Y.Assert.areEqual('Sat', model.dueDateFormatter('2009-12-05T14:54:22Z'), 'Test Sat');
			Y.Assert.areEqual('Sun', model.dueDateFormatter('2009-12-06T14:54:22Z'), 'Test Sun');
			Y.Assert.areEqual('Mon', model.dueDateFormatter('2009-12-07T14:54:22Z'), 'Test Mon');
			
			// Dates with the next 12 months
			Y.Assert.areEqual('Fri 8 Jan', model.dueDateFormatter('2010-01-08T14:54:22Z'), 'Test year 1');
			Y.Assert.areEqual('Mon 12 Jul', model.dueDateFormatter('2010-07-12T14:54:22Z'), 'Test year 2');
			Y.Assert.areEqual('Tue 30 Nov', model.dueDateFormatter('2010-11-30T14:54:22Z'), 'Test year 3');
			
			// Dates beyond next 12 months
			Y.Assert.areEqual('Wed 1 Dec 2010', model.dueDateFormatter('2010-12-01T14:54:22Z'), 'Test over year 1');
			Y.Assert.areEqual('Thu 2 Dec 2010', model.dueDateFormatter('2010-12-02T14:54:22Z'), 'Test over year 2');
			Y.Assert.areEqual('Fri 25 Feb 2011', model.dueDateFormatter('2011-02-25T14:54:22Z'), 'Test over year 3');
			
			// Non-times should give empty string
			Y.Assert.areEqual('', model.dueDateFormatter(''), 'Test none-time 1');
			Y.Assert.areEqual('', model.dueDateFormatter('xxx'), 'Test none-time 2');
			Y.Assert.areEqual('', model.dueDateFormatter({}), 'Test none-time 3');
			Y.Assert.areEqual('', model.dueDateFormatter(), 'Test none-time 4');
			
			// Overdue dates
			Y.Assert.areEqual('Sun 22 Nov', model.dueDateFormatter('2009-11-22T14:54:22Z'), 'Test overdue 1');
			Y.Assert.areEqual('Mon 2 Jun', model.dueDateFormatter('2008-06-02T14:54:22Z'), 'Test overdue 2');
		},
		
		testDueDateFormatterWithDayLightSaving: function() {
			TestUtils.showMojoLog();
			var model = new TaskListModel();
			model.today = function() {
				return Date.parse('20 Mar 2010');
			};

			// Actual due date returned by RTM which the website interprets as Mon 5 April 2010
			Y.Assert.areEqual('Mon 5 Apr', model.dueDateFormatter('2010-04-04T23:00:00Z'), 'Daylight saving date');
		},
		
		testGetLatestModified: function() {
			var model;
			
			TestUtils.runInSeries(this, 200,
				[
					INITIALISE_STORE,
					function() {
						model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
						Y.Assert.areEqual('2009-11-18T16:58:19Z', model.getLatestModified(), "Latest modified time not found");
					}
				]
			);
		},
		
		testGetLatestModifiedIfAllUndefined: function() {
			var model;
			
			TestUtils.runInSeries(this, 200,
				[
					INITIALISE_STORE,
					function() {
						model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
						model.getTaskList().each(function(task_model) {
							delete task_model.modified;
						});
						Y.Assert.isUndefined(model.getLatestModified(), "Lastest modified should be undefined if no modified times");
					}
				]
			);
		},

		testGetLatestModifiedIfNoTasks: function() {
			var model = new TaskListModel();
			Y.Assert.isUndefined(model.getLatestModified(), "Lastest modified should be undefined if no tasks");
		},

		testGetLatestModifiedWithSomeUndefinedValues: function() {
			var model;
			
			TestUtils.runInSeries(this, 200,
				[
					INITIALISE_STORE,
					function() {
						model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
						model.getTaskList()[2].modified = undefined;
						model.getTaskList()[5].modified = undefined;
						Y.Assert.areEqual('2009-11-18T16:58:19Z', model.getLatestModified(), "Latest modified time not found");
					}
				]
			);
		},
		
		testGetLatestModifiedWithTimezones: function() {
			var model;
			
			TestUtils.runInSeries(this, 200,
				[
					INITIALISE_STORE,
					function() {
						model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
						model.getTaskList()[2].modified = '2009-11-19T16:58:19+06:00'; // = 10:58Z
						model.getTaskList()[5].modified = '2009-11-19T16:58:19-04:00'; // = 20:58Z
						model.getTaskList()[8].modified = '2009-11-19T16:58:19Z';      // = 16:58Z
						Y.Assert.areEqual('2009-11-19T16:58:19-04:00', model.getLatestModified(), "Timezoned modification not calculated correctly");
					}
				]
			);
		}
		
	});

} );