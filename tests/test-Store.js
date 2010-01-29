// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the task model's saving, loading and removing capabilities.
 */

testCases.push( function(Y) {

	return new Y.Test.Case({
		
		setUp: function() {
			Mojo.Model.Cookie.deleteCookieStore();
		},
		
		testSaveTaskAndLoadTask: function() {
			var task1 = new TaskModel({ name: 'My first task' });
			var task1_localID = task1.localID;
			Store.saveTask(task1);
			
			var task2 = new TaskModel({ name: 'My second task' });
			var task2_localID = task2.localID;
			Store.saveTask(task2);
			
			var recovered_task1 = Store.loadTask(task1_localID);
			Y.Assert.areEqual('My first task', recovered_task1.name, "Task 1 name not recovered");
			Y.Assert.areEqual(task1_localID, task1.localID, "Task 1 local ID not recovered");
			Y.assert(recovered_task1 instanceof TaskModel, "Recovered task 1 is not a TaskModel");

			var recovered_task2 = Store.loadTask(task2_localID);
			Y.Assert.areEqual('My second task', recovered_task2.name, "Task 2 name not recovered");
			Y.Assert.areEqual(task2_localID, task2.localID, "Task 2 local ID not recovered");
			Y.assert(recovered_task2 instanceof TaskModel, "Recovered task 2 is not a TaskModel");
		},
		
		testLoadTaskWithBadLocalID: function() {
			Y.Assert.isUndefined(Store.loadTask('blah'), "Rubbish local ID should have returned undefined");
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
		}

	});

} );