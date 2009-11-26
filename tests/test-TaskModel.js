/**
 * Test the task model
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		testConstructorPickedUp: function() {
			var task = new TaskModel();
			Y.Assert.isNotUndefined(task, 'TaskModel constructor failed');
		},
		
		testConstructorProperties: function() {
			var task = new TaskModel({
				list_id: '123456',
				taskseries_id:'223344',
				task_id: '667788',
				name: 'My test task',
				due: '2008-07-13T00:00:00Z',
				//is_due: inst.isDue(due),
				//is_overdue: inst.isOverdue(due)
			});
			
			Y.Assert.areEqual('123456', task.list_id, "List ID doesn't get set");
			Y.Assert.areEqual('223344', task.taskseries_id, "Task series ID doesn't get set");
			Y.Assert.areEqual('667788', task.task_id, "Task ID doesn't get set");
			Y.Assert.areEqual('My test task', task.name, "Task name doesn't get set");
			Y.Assert.areEqual('2008-07-13T00:00:00Z', task.due, "Task due date doesn't get set");
		},
		
		testIsDue: function() {
			var task;
			var today = Date.parse('2009-12-01T00:00:00Z');
			
			// A task from yesterday is due
			task = new TaskModel({ due: '2009-11-30T00:00:00Z' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.is_due, 'A task from yesterday should be due');
			
			// A task for today is due
			task = new TaskModel({ due: '2009-12-01T00:00:00Z' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.is_due, 'A task for today should be due');
			
			// A task for tomorrow is not due
			task = new TaskModel({ due: '2009-12-02T00:00:00Z' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.is_due, 'A task for tomorrow should not be due');
			
			// A task with no due date set is due
			task = new TaskModel();
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.is_due, 'A task with no due date should be due');
			
			// A task with empty due date set is due
			task = new TaskModel({ due: '' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.is_due, 'A task with empty due date should be due');
			
			// A task with empty object due date set is due
			task = new TaskModel({ due: {} });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.is_due, 'A task with empty object due date should be due');
		},

		testIsOverdue: function() {
			var task;
			var today = Date.parse('2009-12-01T00:00:00Z');
			
			// A task from yesterday is overdue
			task = new TaskModel({ due: '2009-11-30T00:00:00Z' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(true, task.is_overdue, 'A task from yesterday should be overdue');
			
			// A task for today is not overdue
			task = new TaskModel({ due: '2009-12-01T00:00:00Z' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.is_overdue, 'A task for today should not be due');
			
			// A task for tomorrow is not overdue
			task = new TaskModel({ due: '2009-12-02T00:00:00Z' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.is_overdue, 'A task for tomorrow should not be overdue');
			
			// A task with no due date set is not overdue
			task = new TaskModel();
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.is_overdue, 'A task with no due date should not be overdue');

			// A task with empty due date set is not overdue
			task = new TaskModel({ due: '' });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.is_overdue, 'A task with empty due date should not be overdue');
			
			// A task with empty object due date set is not overdue
			task = new TaskModel({ due: {} });
			task.today = function() { return today };
			task.update();
			Y.Assert.areEqual(false, task.is_overdue, 'A task with empty object due date should not be overdue');

		},
		
		testSortDue: function(){
			var nov30 = new TaskModel({ due: '2009-11-30T00:00:00Z' });
			var nov30_2 = new TaskModel({ due: '2009-11-30T00:00:00Z' });
			var dec1 = new TaskModel({ due: '2009-12-01T00:00:00Z' });
			Y.Assert.areEqual(-1, TaskModel.sortDue(nov30, dec1), 'Nov 30 should be before Dec 1');
			Y.Assert.areEqual(1, TaskModel.sortDue(dec1, nov30), 'Dec 1 should be before Nov 30');
			Y.Assert.areEqual(0, TaskModel.sortDue(nov30_2, nov30), 'Nov 30 should be same as Nov 30');
		}
		
	});

} );