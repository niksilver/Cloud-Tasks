// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the task model's saving, loading and removing capabilities.
 */

testCases.push( function(Y) {

	var WAIT_TIMEOUT = 300; // 200ms is too short for database calls to return, but this seems okay
	
	return new Y.Test.Case({
		
		setUp: function() {
			TestUtils.captureMojoLog();
		},
		
		tearDown: function() {
			TestUtils.restoreMojoLog();
		},
		
		testInitialise: function() {
			Y.Assert.areEqual(false, Store.isInitialised, "Store shouldn't be initialised at start");
			Store.initialise();
			TestUtils.waitInSeries(
				this,
				[
					function() {
						Y.Assert.areEqual(true, Store.isInitialised, "Store should be initialised after first call");
						Store.initialise();
					},
					function() {
						Y.Assert.areEqual(true, Store.isInitialised, "Store should survive second initialisation");
					},
				],
				WAIT_TIMEOUT
			);
		},
		
		testSaveTaskAndLoadTask: function() {
			var task1 = new TaskModel({ name: 'My first task' });
			var task1_localID = task1.localID;
			
			var task2 = "Default value";
			var task2_localID = "Default value";
			var recovered_task1 = "Default value";
			var recovered_task2 = "Default value";

			var test = this;
			TestUtils.runInSeries(this, 1000,
				[
					function() {
						Store.saveTask(task1, function() { test.continueRun() });
					},
					function() {
						task2 = new TaskModel({ name: 'My second task' });
						task2_localID = task2.localID;
						Store.saveTask(task2);
						Store.loadTask(task1_localID, function(task) { recovered_task1 = task; test.continueRun() });
					},
					function() {
						Y.assert(recovered_task1 instanceof TaskModel, "Recovered task 1 is not a TaskModel, variable is " + recovered_task1);
						Y.Assert.areEqual('My first task', recovered_task1.name, "Task 1 name not recovered");
						Y.Assert.areEqual(task1_localID, task1.localID, "Task 1 local ID not recovered");
						Store.loadTask(task2_localID, function(task) { recovered_task2 = task; test.continueRun() });
					},
					function() {
						Y.Assert.areEqual('My second task', recovered_task2.name, "Task 2 name not recovered");
						Y.Assert.areEqual(task2_localID, task2.localID, "Task 2 local ID not recovered");
						Y.assert(recovered_task2 instanceof TaskModel, "Recovered task 2 is not a TaskModel");
						test.continueRun();
					}
				]
			);
		},
		
		testLoadTaskWithBadLocalID: function() {
			var loaded_task = "Default value";
			Store.loadTask('blah', function(task) { loaded_task = task; })
			this.wait(
				function() {
					Y.Assert.isUndefined(loaded_task, "Rubbish local ID should have returned undefined");
				},
				WAIT_TIMEOUT
			);
		},
		
		testRemoveTask: function() {
			var task = new TaskModel({ name: 'My task' });
			var local_id = task.localID;
			var loaded_value = "Initial value";
			Store.saveTask(task);
			TestUtils.waitInSeries(
				this,
				[
					function() {
						Store.loadTask(local_id, function(task) {loaded_value = task });
					},
					function() {
						Y.Assert.areEqual('My task', loaded_value.name, "Step 1: Not saved and loaded");
						Store.removeTask(task);
					},
					function() {
						Store.loadTask(local_id, function(task) {loaded_value = task });
					},
					function() {
						Y.Assert.isUndefined(loaded_value, "Step 2: Not deleted");
						Store.saveTask(task);
					},
					function() {
						Store.loadTask(local_id, function(task) {loaded_value = task });
					},
					function() {
						Y.Assert.areEqual('My task', loaded_value.name, "Step 3: Not saved and loaded");
					}
				],
				WAIT_TIMEOUT
			);
		},
		
		testLoadAllTasks: function() {
			var task1;
			var task1_local_id;
			var task2;
			var task2_local_id;
			var task_list;
			var local_id_to_task;
			
			TestUtils.waitInSeries(
				this,
				[
					function() {
						Store.removeAllTasks();
					},
					function() {
						task1 = new TaskModel({ name: 'My first task' });
						task1_local_id = task1.localID;
						Store.saveTask(task1);
						task2 = new TaskModel({ name: 'My second task' });
						task2_local_id = task2.localID;
						Store.saveTask(task2);
					},
					function() {
						Store.loadAllTasks(function(tasks) { task_list = tasks });
					},
					function() {
						local_id_to_task = TestUtils.getLocalIDToTaskHash(task_list);
						Y.Assert.areEqual(2, task_list.length, "Wrong number of tasks loaded back");
						Y.Assert.areEqual('My first task', local_id_to_task[task1_local_id].name, "Didn't recover name of task 1");
						Y.Assert.areEqual('My second task', local_id_to_task[task2_local_id].name, "Didn't recover name of task 2");
					}
				],
				WAIT_TIMEOUT
			);
		},
		
		testRemoveAllTasks: function() {
			var task1 = new TaskModel({ name: 'My first task' });
			var task2 = new TaskModel({ name: 'My second task' });
			var task3 = new TaskModel({ name: 'My third task' });

			Store.saveTask(task1);
			Store.saveTask(task2);
			Store.saveTask(task3);
			
			var loaded_task;
			
			TestUtils.waitInSeries(
				this,
				[
					function() {
						Store.loadTask(task1.localID, function(task) { loaded_task = task });
					},
					function() {
						Y.Assert.areEqual('My first task', loaded_task.name, "Couldn't load first task");
						Store.loadTask(task2.localID, function(task) { loaded_task = task });
					},
					function() {
						Y.Assert.areEqual('My second task', loaded_task.name, "Couldn't load second task");
						Store.loadTask(task3.localID, function(task) { loaded_task = task });
					},
					function() {
						Y.Assert.areEqual('My third task', loaded_task.name, "Couldn't load third task");
						Store.removeAllTasks();
					},
					function() {
						Store.loadTask(task1.localID, function(task) { loaded_task = task });
					},
					function() {
						Y.Assert.isUndefined(loaded_task, "Didn't remove first task");
						Store.loadTask(task2.localID, function(task) { loaded_task = task });
					},
					function() {
						Y.Assert.isUndefined(loaded_task, "Didn't remove second task");
						Store.loadTask(task3.localID, function(task) { loaded_task = task });
					},
					function() {
						Y.Assert.isUndefined(loaded_task, "Didn't remove third task");
					}
				],
				WAIT_TIMEOUT
			);
		}

	});

} );