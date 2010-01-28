// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the task model's saving, loading and removing capabilities.
 */

testCases.push( function(Y) {

	return new Y.Test.Case({
		
		testLocalID: function() {
			var task1 = new TaskModel();
			var task2 = new TaskModel();
			var task3 = new TaskModel();
			
			Y.Assert.areNotEqual(task1.localID, task2.localID, "Tasks 1 and 2 should have different local IDs");
			Y.Assert.areNotEqual(task2.localID, task3.localID, "Tasks 2 and 3 should have different local IDs");
			Y.Assert.areNotEqual(task1.localID, task3.localID, "Tasks 1 and 3 should have different local IDs");
		},
		
		testSaveAndLoad: function() {
			var task1 = new TaskModel({ name: 'My first task' });
			var task1_localID = task1.localID;
			task1.save();
			
			var task2 = new TaskModel({ name: 'My second task' });
			var task2_localID = task2.localID;
			task2.save();
			
			var recovered_task1 = TaskModel.load("task" + task1_localID);
			Y.Assert.areEqual('My first task', recovered_task1.name, "Task 1 name not recovered");
			Y.Assert.areEqual(task1_localID, task1.localID, "Task 1 local ID not recovered");
			Y.assert(recovered_task1 instanceof TaskModel, "Recovered task 1 is not a TaskModel");

			var recovered_task2 = TaskModel.load("task" + task2_localID);
			Y.Assert.areEqual('My second task', recovered_task2.name, "Task 2 name not recovered");
			Y.Assert.areEqual(task2_localID, task2.localID, "Task 2 local ID not recovered");
			Y.assert(recovered_task2 instanceof TaskModel, "Recovered task 2 is not a TaskModel");
		},
		
		testLoadWithBadIdentifier: function() {
			Y.Assert.isUndefined(TaskModel.load('blah'), "Rubbish identifier should have returned undefined");
		},
		
		testRemove: function() {
			var task = new TaskModel({ name: 'My task' });
			var identifier = "task" + task.localID;
			task.save();
			Y.Assert.areEqual('My task', TaskModel.load(identifier).name, "Step 1: Not saved and loaded");
			task.remove();
			Y.Assert.isUndefined(TaskModel.load(identifier), "Step 2: Not deleted");
			task.save();
			Y.Assert.areEqual('My task', TaskModel.load(identifier).name, "Step 3: Not saved and loaded");
		}

	});

} );