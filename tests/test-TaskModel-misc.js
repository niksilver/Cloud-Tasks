// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the task model
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testTaskModelConstructorPickedUp: function() {
			var task = new TaskModel();
			Y.Assert.isNotUndefined(task, 'TaskModel constructor failed');
		},
		
		testTaskModelConstructorProperties: function() {
			var task = new TaskModel({
				listID: '123456',
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z',
				modified: '2008-06-20T21:11:26Z',
				deleted: false,
				rrule: 'Something',
				completed: false
			});
			
			Y.Assert.areEqual('123456', task.listID, "List ID doesn't get set");
			Y.Assert.areEqual('223344', task.taskseriesID, "Task series ID doesn't get set");
			Y.Assert.areEqual('667788', task.taskID, "Task ID doesn't get set");
			Y.assert(task.localID >= 0, "Local ID should be a number");
			Y.Assert.areEqual('My test task', task.name, "Task name doesn't get set");
			Y.Assert.areEqual('2008-07-13T00:00:00Z', task.dueAsUTCString(), "Task due date doesn't get set");
			Y.Assert.areEqual('2008-06-20T21:11:26Z', task.modified, "Modified time doesn't get set");
			Y.Assert.areEqual(false, task.deleted, "Task deleted flag not set");
			Y.Assert.areEqual('Something', task.rrule, "Task rrule not set");
			Y.Assert.areEqual(false, task.completed, "Task completed flag not set");
		},
		
		testLocalID: function() {
			var task1 = new TaskModel();
			var task2 = new TaskModel();
			var task3 = new TaskModel();
			
			Y.Assert.areNotEqual(task1.localID, task2.localID, "Tasks 1 and 2 should have different local IDs");
			Y.Assert.areNotEqual(task2.localID, task3.localID, "Tasks 2 and 3 should have different local IDs");
			Y.Assert.areNotEqual(task1.localID, task3.localID, "Tasks 1 and 3 should have different local IDs");
		},
		
		testSetForPushShouldFlagLocalChanges: function() {
			var task = new TaskModel({
				listID: '123456',
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z'
			});
			
			Y.Assert.areEqual(0, task.localChanges.length, "There should be no local changes initially");
			
			task.setForPush('name', 'My changed test task');			
			Y.Assert.areEqual(1, task.localChanges.length, "Only name should have changed (1)");
			Y.Assert.areEqual('name', task.localChanges[0], "Only name should have changed (2)");
			
			// Changing the name again should result in the name flagged only once, still

			task.setForPush('name', 'My changed test task 2');
			Y.Assert.areEqual(1, task.localChanges.length, "Only name should have changed again (1)");
			Y.Assert.areEqual('name', task.localChanges[0], "Only name should have changed again (2)");
		},
		
		testMarkNotForPush: function() {
			var task = new TaskModel({
				listID: '123456',
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z'
			});
			task.setForPush('name', 'My changed test task');			
			task.setForPush('due', '2009-12-01T00:00:00Z');
			task.setForPush('name', 'My second changed test task');
			
			Y.assert(task.localChanges.indexOf('name') >= 0, "Name not set for push");
			Y.assert(task.localChanges.indexOf('due') >= 0, "Due date not set for push");			
			
			task.markNotForPush('name');
			Y.Assert.areEqual(-1, task.localChanges.indexOf('name'), "Name is still set for push");
			
			task.markNotForPush('mistakenproperty');
			Y.Assert.areEqual(1, task.localChanges.length, "Problem marking non-existent property");
			
			task.markNotForPush('due');
			Y.Assert.areEqual(-1, task.localChanges.indexOf('due'), "Due date is still set for push");
		},
		
		testCreateFromObject: function() {
			var obj = {
				listID: '123456',
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z',
				modified: '2008-06-20T21:11:26Z',
				deleted: true,
				rrule: 'Something'
			};
			var TaskModelCopy = Object.clone(TaskModel);
			TaskModelCopy.today = function() { return Date.parse('2008-07-13T00:00:00Z') };
			var task = TaskModelCopy.createFromObject(obj);
			Y.Assert.isInstanceOf(TaskModel, task, "Task is not a TaskModel object");
			Y.Assert.areEqual('123456', task.listID, "List ID not created");
			Y.Assert.areEqual('223344', task.taskseriesID, "Task series ID not created");
			Y.Assert.areEqual('667788', task.taskID, "Task ID not created");
			Y.Assert.areEqual('My test task', task.name, "Name not created");
			Y.Assert.areEqual('2008-07-13T00:00:00Z', task.dueAsUTCString(), "Due date not created");
			Y.Assert.areEqual('2008-06-20T21:11:26Z', task.modified, "Modified time not created");
			Y.Assert.areEqual(true, task.deleted, "Deleted flag not created");
			Y.Assert.areEqual('Something', task.rrule, "Recurrence rule not created");
			Y.Assert.isArray(task.localChanges, "Local changes not set up");
			Y.Assert.areEqual(0, task.localChanges.length, "Local changes recorded incorrectly");
			Y.Assert.areEqual(true, task.isDueFlag, "Due flag not set correctly");
			Y.Assert.areEqual(true, task.isOverdueFlag, "Overdue flag not set correctly");
		},
		
		testCreateFromObjectWithLocalChanges: function () {
			var obj = {
				listID: '123456',
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				localChanges: ['name']
			};
			var task = TaskModel.createFromObject(obj);
			Y.Assert.isInstanceOf(TaskModel, task, "Task is not a TaskModel object");
			Y.Assert.isArray(task.localChanges, "Task's local changes not set up");
			Y.Assert.areEqual('name', task.localChanges[0], "Task's local change not recorded");
		},
		
		testCreateFromObjectPreservesLocalID: function() {
			var task = new TaskModel();
			var local_id = task.localID;
			var task_obj = task.toObject();
			var task_again = TaskModel.createFromObject(task_obj);
			Y.Assert.areEqual(local_id, task_again.localID, "Local ID not preserved in to/from object creation");
		},
		
		testToObject: function() {
			var task, task_obj, local_id;
			
			task = new TaskModel({
				listID: '123456',
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z',
				modified: '2008-06-20T21:11:26Z',
				deleted: true,
				rrule: {'every': '0', '$t': 'Some $t here'},
				completed: true
			});
			task_obj = task.toObject();
			local_id = task.localID;
			
			Y.Assert.areEqual('My test task', task_obj.name, "Name not recorded in object");
			Y.assert(local_id >= 0, "Local ID should be a number");
			Y.Assert.areEqual(local_id, task_obj.localID, "Local ID not recorded in object");
			Y.Assert.areEqual('123456', task_obj.listID, "List ID not recorded in object");
			Y.Assert.areEqual('223344', task_obj.taskseriesID, "Taskseries ID not recorded in object");
			Y.Assert.areEqual('667788', task_obj.taskID, "Task ID not recorded in object");
			Y.Assert.areEqual('2008-07-13T00:00:00Z', task_obj.due, "Due date not recorded in object");
			Y.Assert.areEqual('2008-06-20T21:11:26Z', task_obj.modified, "Modified property not recorded in object");
			Y.Assert.areEqual(true, task_obj.deleted, "Deleted property not recorded in object");
			Y.Assert.isNotUndefined(task_obj.rrule, "RRule not recorded in object");
			Y.Assert.areEqual('0', task_obj.rrule.every, "Every property of rrule not recorded in object");
			Y.Assert.areEqual('Some $t here', task_obj.rrule['$t'], "$t property of rrule not recorded in object");
			Y.Assert.areEqual(true, task_obj.completed, "Completed property not recorded");

			task = new TaskModel({
				name: 'My test task 2',
				due: '2008-07-13T00:00:00Z',
				modified: '2008-06-20T21:11:26Z'
				// Deleted is undefined
				// RRule is undefined
				// Completed is undefined
			});
			task_obj = task.toObject();
			
			Y.Assert.areEqual('My test task 2', task_obj.name, "Name not recorded in object with undefined rrule");
			Y.Assert.areEqual(false, task_obj.deleted, "Deleted flag not recorded correctly in object");
			Y.Assert.isUndefined(task_obj.rrule, "Undefined rrule not recorded correctly in object");
			Y.Assert.areEqual(false, task_obj.completed, "Completed flag not recorded correctly in object");
		},
		
		testHasNoIDs: function() {
			var task;
			
			task = new TaskModel({
				listID: '123456',
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z'
			});
			Y.Assert.areEqual(false, task.hasNoIDs(task), "Task with three IDs not correctly identified");

			task = new TaskModel({
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z'
			});
			Y.Assert.areEqual(false, task.hasNoIDs(task), "Task with two IDs not correctly identified");

			task = new TaskModel({
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z'
			});
			Y.Assert.areEqual(false, task.hasNoIDs(task), "Task with one ID not correctly identified");

			task = new TaskModel({
				name: 'My test task',
				due: '2008-07-13T00:00:00Z'
			});
			Y.Assert.areEqual(true, task.hasNoIDs(task), "Task with no IDs not correctly identified");
		},
		
		testRestoreFromObject: function() {
			var task = new TaskModel({
				listID: '123456',
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z',
				deleted: false,
				rrule: {'every': '0', '$t': 'Some $t here'},
				completed: true,
				localChanges: ['name', 'deleted']
			});
			
			var saved_obj = task.toObject();
			
			task.setForPush('deleted', true);
			task.setRecurrenceUserTextForPush('Every 2nd Tuesday');
			
			Y.Assert.areEqual(true, task.deleted, "Didn't set up deleted flag properly");
			Y.Assert.areEqual('Every 2nd Tuesday', task.rrule.userText, "Didn't set up rrule.userText properly");
			
			task.restoreFromObject(saved_obj);
			
			Y.Assert.areEqual('My test task', task.name, "Mistakenly changed name");
			Y.Assert.areEqual(false, task.deleted, "Didn't restore deleted flag");
			Y.Assert.areEqual('0', task.rrule.every, "Didn't restore rrule.every");
			Y.Assert.areEqual('Some $t here', task.rrule['$t'], "Didn't restore rrule.$t");
			Y.Assert.isUndefined(task.rrule.userText, "Didn't restore rrule.userText properly");
			
			Y.Assert.areEqual(2, task.localChanges.length, "Local changes array is wrong length");
			Y.Assert.areEqual('name', task.localChanges[0], "First local change not restored");
			Y.Assert.areEqual('deleted', task.localChanges[1], "Second local change not restored");
		},
		
		testTakeLocalChangesWithChangesInBothTasks: function() {
			var task1 = new TaskModel({
				name: 'Write report',
				due: '2009-12-01T00:00:00Z',
				localChanges: ['due']
			});
			var task2_with_changes = new TaskModel({
				deleted: true,
				rrule: { every: '0', '$t': 'FREQ=WEEKLY;INTERVAL=2', problem: true, userText: "Neep" },
				localChanges: ['deleted']
			});
			
			task1.takeLocalChanges(task2_with_changes);
			Y.assert(task1.localChanges.indexOf('due') >= 0, "Didn't keep local change of due");
			Y.Assert.areEqual(true, task1.deleted, "Didn't take deleted as a change");
			Y.assert(task1.localChanges.indexOf('deleted') >= 0, "Didn't take fact of local change of deleted");
			Y.Assert.areEqual(true, task1.hasRRuleFlag, "Didn't update hasRRuleFlag");
		},
		
		testTakeLocalChangesWithDueChanged: function() {
			var task1 = new TaskModel({
				name: 'Write report',
				due: '2009-12-01T00:00:00Z'
			});
			var task2_with_changes = new TaskModel({
				due: '2010-01-01T00:00:00Z',
				localChanges: ['due']
			});
			
			task1.takeLocalChanges(task2_with_changes);
			Y.Assert.areEqual('2010-01-01T00:00:00Z', task1.dueAsUTCString(), "Didn't take change in due date");
		}

	});

} );