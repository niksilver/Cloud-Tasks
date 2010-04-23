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

			// NB: Remote tasks are in GMT timezone
			var tasks = TaskListModel.objectToTaskList(SampleTestData.remote_json_with_overdue_tasks);

			var task_hash = {};
			tasks.each(function(task) {
				task.today = model.today; // Force today calculation
				task.getTimezoneOffset = function(date) { return 0 }; // Force GMT for these tasks
				task.update(); // Force overdue calculations based on forced idea of today
				task_hash[task.taskID] = task;
			});
			
			Y.Assert.areEqual(false, task_hash['79648346'].isOverdueFlag, "Test 1: No due date");
			Y.Assert.areEqual(true, task_hash['75724449'].isOverdueFlag, "Test 2: A while back");
			Y.Assert.areEqual(false, task_hash['66459582'].isOverdueFlag, "Test 3: The future");
			Y.Assert.areEqual(false, task_hash['11223344'].isOverdueFlag, "Test 4: Today");
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
		}
		
	});

} );