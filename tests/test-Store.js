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
			var test = this;
			TestUtils.runInSeries(this, 1000,
				[
					function() {
						Store.initialise(function() { TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						Store.removeAllTasks(function() { TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					}
				]
			);
		},
		
		tearDown: function() {
			TestUtils.restoreMojoLog();
		},
		
		testInitialise: function() {
			Y.Assert.areEqual(false, Store.isInitialised, "Store shouldn't be initialised at start");
			var test = this;
			TestUtils.runInSeries(this, 1000,
				[
					function() {
						Store.initialise(function() { TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						Y.Assert.areEqual(true, Store.isInitialised, "Store should be initialised after first call");
						Store.initialise(function() { TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						Y.Assert.areEqual(true, Store.isInitialised, "Store should survive second initialisation");
						//TestUtils.continueRun();
					},
				]
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
						Store.saveTask(task1, function() { TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						task2 = new TaskModel({ name: 'My second task' });
						task2_localID = task2.localID;
						Store.saveTask(task2);
						Store.loadTask(task1_localID, function(task) { recovered_task1 = task; TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						Y.assert(recovered_task1 instanceof TaskModel, "Recovered task 1 is not a TaskModel, variable is " + recovered_task1);
						Y.Assert.areEqual('My first task', recovered_task1.name, "Task 1 name not recovered");
						Y.Assert.areEqual(task1_localID, task1.localID, "Task 1 local ID not recovered");
						Store.loadTask(task2_localID, function(task) { recovered_task2 = task; TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						Y.Assert.areEqual('My second task', recovered_task2.name, "Task 2 name not recovered");
						Y.Assert.areEqual(task2_localID, task2.localID, "Task 2 local ID not recovered");
						Y.assert(recovered_task2 instanceof TaskModel, "Recovered task 2 is not a TaskModel");
						//TestUtils.continueRun();
					}
				]
			);
		},
		
		testLoadTaskWithBadLocalID: function() {
			alert("Hello");
			var loaded_task = "Default value";
			var test = this;
			TestUtils.runInSeries(this, 1000,
				[
					function() {
						TestUtils.dumpMojoLog();
						Store.loadTask('blah', function(task) { loaded_task = task; TestUtils.continueRun() })
						TestUtils.waitToContinueRun();
					},
					function() {
						Y.Assert.isUndefined(loaded_task, "Rubbish local ID should have returned undefined");
						//TestUtils.continueRun();
					}
				]
			);
		},
		
		testRemoveTask: function() {
			var task = new TaskModel({ name: 'My task' });
			var local_id = task.localID;
			var loaded_value = "Initial value";
			var test = this;
			TestUtils.runInSeries(this, 1000,
				[
					function() {
						Store.saveTask(task, function() { TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						Store.loadTask(local_id, function(task) {loaded_value = task; TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						Y.Assert.areEqual('My task', loaded_value.name, "Step 1: Not saved and loaded");
						Store.removeTask(task, function() { TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						Store.loadTask(local_id, function(task) {loaded_value = task; TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						Y.Assert.isUndefined(loaded_value, "Step 2: Not deleted");
						Store.saveTask(task, function() { TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						Store.loadTask(local_id, function(task) {loaded_value = task; TestUtils.continueRun() });
						TestUtils.waitToContinueRun();
					},
					function() {
						Y.Assert.areEqual('My task', loaded_value.name, "Step 3: Not saved and loaded");
						//TestUtils.continueRun();
					}
				]
			);
		} /*,
		
		testLoadAllTasks: function() {
			var task1;
			var task1_local_id;
			var task2;
			var task2_local_id;
			var task_list;
			var local_id_to_task;
			
			var test = this;
			TestUtils.runInSeries(this, 1000,
				[
					function() {
						Store.removeAllTasks(function() { test.continueRun() });
					},
					function() {
						task1 = new TaskModel({ name: 'My first task' });
						task1_local_id = task1.localID;
						Store.saveTask(task1, function() { test.continueRun() });
					},
					function() {
						task2 = new TaskModel({ name: 'My second task' });
						task2_local_id = task2.localID;
						Store.saveTask(task2, function() { test.continueRun() });
					},
					function() {
						Store.loadAllTasks(function(tasks) { task_list = tasks; test.continueRun() });
					},
					function() {
						local_id_to_task = TestUtils.getLocalIDToTaskHash(task_list);
						Y.Assert.areEqual(2, task_list.length, "Wrong number of tasks loaded back");
						Y.Assert.areEqual('My first task', local_id_to_task[task1_local_id].name, "Didn't recover name of task 1");
						Y.Assert.areEqual('My second task', local_id_to_task[task2_local_id].name, "Didn't recover name of task 2");
						test.continueRun();
					}
				]
			);
		},
		
		testRemoveAllTasks: function() {
			var task1 = new TaskModel({ name: 'My first task' });
			var task2 = new TaskModel({ name: 'My second task' });
			var task3 = new TaskModel({ name: 'My third task' });
			
			var loaded_task;
			
			var test = this;
			TestUtils.runInSeries(this, 1000,
				[
					function() {
						Store.saveTask(task1, function() { test.continueRun() });
					},
					function() {
						Store.saveTask(task2, function() { test.continueRun() });
					},
					function() {
						Store.saveTask(task3, function() { test.continueRun() });
					},
					function() {
						Store.loadTask(task1.localID, function(task) { loaded_task = task; test.continueRun() });
					},
					function() {
						Y.Assert.areEqual('My first task', loaded_task.name, "Couldn't load first task");
						Store.loadTask(task2.localID, function(task) { loaded_task = task; test.continueRun() });
					},
					function() {
						Y.Assert.areEqual('My second task', loaded_task.name, "Couldn't load second task");
						Store.loadTask(task3.localID, function(task) { loaded_task = task; test.continueRun() });
					},
					function() {
						Y.Assert.areEqual('My third task', loaded_task.name, "Couldn't load third task");
						Store.removeAllTasks(function() { test.continueRun() });
					},
					function() {
						Store.loadTask(task1.localID, function(task) { loaded_task = task; test.continueRun() });
					},
					function() {
						Y.Assert.isUndefined(loaded_task, "Didn't remove first task");
						Store.loadTask(task2.localID, function(task) { loaded_task = task; test.continueRun() });
					},
					function() {
						Y.Assert.isUndefined(loaded_task, "Didn't remove second task");
						Store.loadTask(task3.localID, function(task) { loaded_task = task; test.continueRun() });
					},
					function() {
						Y.Assert.isUndefined(loaded_task, "Didn't remove third task");
						test.continueRun();
					}
				]
			);
		} */

	});

} );