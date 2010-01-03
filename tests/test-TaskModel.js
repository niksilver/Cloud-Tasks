/**
 * Test the task model
 */

testCases.push( function(Y) {

	return new Y.Test.Case({
		
		// Adapted from http://www.lshift.net/blog/2006/08/03/subclassing-in-javascript-part-2
		extend: function(superclass, prototype) {
		    var res = function () {
		        superclass.apply(this, arguments);
		    };
		    var withoutcon = function () {};
		    withoutcon.prototype = superclass.prototype;
		    res.prototype = new withoutcon();
		    for (var k in prototype) {
		        res.prototype[k] = prototype[k];
		    }
		    return res;
		},

		testConstructorPickedUp: function() {
			var task = new TaskModel();
			Y.Assert.isNotUndefined(task, 'TaskModel constructor failed');
		},
		
		testConstructorProperties: function() {
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
			Y.Assert.areEqual('My test task', task.name, "Task name doesn't get set");
			Y.Assert.areEqual('2008-07-13T00:00:00Z', task.due, "Task due date doesn't get set");
			Y.Assert.areEqual('2008-06-20T21:11:26Z', task.modified, "Modified time doesn't get set");
			Y.Assert.areEqual(false, task.deleted, "Task deleted flag not set");
			Y.Assert.areEqual('Something', task.rrule, "Task rrule not set");
			Y.Assert.areEqual(false, task.completed, "Task completed flag not set");
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
		
		testUpdateSetsHasRRuleFlag: function() {
			var task;
			
			task = new TaskModel({ name: 'Do something once' });
			task.update();
			Y.Assert.areEqual(false, task.hasRRuleFlag, "hasRRule property not set correctly to false");
			
			task = new TaskModel({ rrule: 'Some rrule object' });
			task.update();
			Y.Assert.areEqual(true, task.hasRRuleFlag, "hasRRule property not set correctly to true");
			
			task = new TaskModel({ rrule: undefined });
			task.update();
			Y.Assert.areEqual(false, task.hasRRuleFlag, "hasRRule property not set correctly when undefined");
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
			Y.Assert.areEqual('2008-07-13T00:00:00Z', task.due, "Due date not created");
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
		
		testToObject: function() {
			var task, task_obj;
			
			task = new TaskModel({
				listID: '123456',
				taskseriesID:'223344',
				taskID: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z',
				modified: '2008-06-20T21:11:26Z',
				deleted: true,
				rrule: {'every': '0', '$t': 'Some $t here'}
			});
			task_obj = task.toObject();
			
			Y.Assert.areEqual('My test task', task_obj.name, "Name not recorded in object");
			Y.Assert.areEqual(true, task_obj.deleted, "Deleted property not recorded in object");
			Y.Assert.areEqual('2008-06-20T21:11:26Z', task_obj.modified, "Modified property not recorded in object");
			Y.Assert.isNotUndefined(task_obj.rrule, "RRule not recorded in object");
			Y.Assert.areEqual('0', task_obj.rrule.every, "Every property of rrule not recorded in object");
			Y.Assert.areEqual('Some $t here', task_obj.rrule['$t'], "$t property of rrule not recorded in object");

			task = new TaskModel({
				name: 'My test task 2',
				due: '2008-07-13T00:00:00Z',
				modified: '2008-06-20T21:11:26Z',
				deleted: true
				// RRule is undefined
			});
			task_obj = task.toObject();
			
			Y.Assert.areEqual('My test task 2', task_obj.name, "Name not recorded in object with undefined rrule");
			Y.Assert.isUndefined(task_obj.rrule, "Undefined rrule not recorded correctly in object");
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
		}

	});

} );