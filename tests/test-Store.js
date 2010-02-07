// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the task model's saving, loading and removing capabilities.
 */

testCases.push( function(Y) {

	var WAIT_TIMEOUT = 200; // 100ms is too short for database calls to return, but this seems okay
	
	return new Y.Test.Case({
		
		setUp: function() {
			Mojo.Model.Cookie.deleteCookieStore();
			Store.clearCache();
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
					}.bind(this),
					function() {
						Y.Assert.areEqual(true, Store.isInitialised, "Store should survive second initialisation");
					}.bind(this),
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

			Store.saveTask(task1);
			TestUtils.waitInSeries(
				this,
				[
					function() {
						task2 = new TaskModel({ name: 'My second task' });
						task2_localID = task2.localID;
						Store.saveTask(task2);
						Store.loadTask(task1_localID, function(task) { recovered_task1 = task });
					}.bind(this),
					function() {
						Y.assert(recovered_task1 instanceof TaskModel, "Recovered task 1 is not a TaskModel, variable is " + recovered_task1);
						Y.Assert.areEqual('My first task', recovered_task1.name, "Task 1 name not recovered");
						Y.Assert.areEqual(task1_localID, task1.localID, "Task 1 local ID not recovered");
						Store.loadTask(task2_localID, function(task) { recovered_task2 = task });
					}.bind(this),
					function() {
						Y.Assert.areEqual('My second task', recovered_task2.name, "Task 2 name not recovered");
						Y.Assert.areEqual(task2_localID, task2.localID, "Task 2 local ID not recovered");
						Y.assert(recovered_task2 instanceof TaskModel, "Recovered task 2 is not a TaskModel");
					}.bind(this)
				],
				WAIT_TIMEOUT
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
			var localID = task.localID;
			Store.saveTask(task);
			Y.Assert.areEqual('My task', Store.loadTask(localID).name, "Step 1: Not saved and loaded");
			Store.removeTask(task);
			Y.Assert.isUndefined(Store.loadTask(localID), "Step 2: Not deleted");
			Store.saveTask(task);
			Y.Assert.areEqual('My task', Store.loadTask(localID).name, "Step 3: Not saved and loaded");
		},
		
		testLoadAllTasks: function() {
			var task1 = new TaskModel({ name: 'My first task' });
			var task1_localID = task1.localID;
			Store.saveTask(task1);
			
			var task2 = new TaskModel({ name: 'My second task' });
			var task2_localID = task2.localID;
			Store.saveTask(task2);
			
			var task_list = Store.loadAllTasks();
			var local_id_to_task = {};
			for (var i = 0; i < task_list.length; i++) {
				var local_id = task_list[i].localID;
				local_id_to_task[local_id] = task_list[i];
			}
			
			Y.Assert.areEqual(2, task_list.length, "Wrong number of tasks loaded back");
			Y.Assert.areEqual('My first task', local_id_to_task[task1_localID].name, "Didn't recover name of task 1");
			Y.Assert.areEqual('My second task', local_id_to_task[task2_localID].name, "Didn't recover name of task 2");
		},
		
		testRemoveAllTasks: function() {
			var task1 = new TaskModel({ name: 'My first task' });
			var task2 = new TaskModel({ name: 'My second task' });
			var task3 = new TaskModel({ name: 'My third task' });
			
			Store.saveTask(task1);
			Store.saveTask(task2);
			Store.saveTask(task3);
			
			Y.Assert.areEqual('My first task', Store.loadTask(task1.localID).name, "Couldn't load first task");
			Y.Assert.areEqual('My second task', Store.loadTask(task2.localID).name, "Couldn't load second task");
			Y.Assert.areEqual('My third task', Store.loadTask(task3.localID).name, "Couldn't load third task");
			
			Store.removeAllTasks();

			Y.Assert.isUndefined(Store.loadTask(task1.localID), "Didn't remove first task");
			Y.Assert.isUndefined(Store.loadTask(task2.localID), "Didn't remove second task");
			Y.Assert.isUndefined(Store.loadTask(task3.localID), "Didn't remove third task");
		}

	});

} );