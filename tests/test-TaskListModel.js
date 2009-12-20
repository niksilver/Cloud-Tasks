/**
 * Test the task list model
 */

testCases.push( function(Y) {

	return new Y.Test.Case({

		constructDepotSynchronously: function(name, assert_failure_msg) {
			var depot_constructor_returned = false;
			var depot = new Depot({ name: name },
				function() {
					depot_constructor_returned = true;
				},
				null
			);
			this.wait(
				function() {
					Y.assert(depot_constructor_returned, assert_failure_msg);
				},
				WAIT_TIMEOUT
			);
			return depot;
		},
		
		_should: {
			error: {
				testSetTaskListShouldErrorWithoutTaskModelObjects: true
			}
		},

		testConstructor: function() {
			var model = new TaskListModel();
			Y.Assert.isNotUndefined(model, "Model can't be constructed");
		},
		
		testConstructorWithArgument: function() {
			var task_list = TaskListModel.objectToTaskList(SampleTestData.big_remote_json);
			var model = new TaskListModel(task_list);
			Y.Assert.areEqual(task_list, model.getTaskList(), "Task list didn't get set by constructor");
		},
		
		testObjectToTaskList: function() {
			var model = new TaskListModel();
			var tasks = TaskListModel.objectToTaskList(SampleTestData.big_remote_json);
			
			Y.Assert.isArray(tasks, "Tasks is not an array");
			Y.assert(tasks.length > 10, "Tasks is not very long, only got " + tasks.length + " items");
			
			var sample_task;
			for (var i = 0; i < tasks.length; i++) {
				var task = tasks[i];
				Y.Assert.isNotUndefined(task.listID, "Task " + i + " does not have a listID");
				Y.Assert.isNotUndefined(task.taskID, "Task " + i + " does not have a taskID");
				Y.Assert.isNotUndefined(task.taskseriesID, "Task " + i + " does not have a taskseriesID");
				Y.Assert.isNotUndefined(task.name, "Task " + i + " does not have a name");
				Y.Assert.isNotUndefined(task.due, "Task " + i + " does not have a due property");
				Y.Assert.isNotUndefined(task.modified, "Task " + i + " does not have a modified time");
				if (task.taskID == '79139889') {
					sample_task = task;
				}
			}
			
			Y.Assert.areEqual('2637966', sample_task.listID, "List id not correct");
			Y.Assert.areEqual('55274651', sample_task.taskseriesID, "Taskseries id not correct");
			Y.Assert.areEqual('MB, AB - Update on testing companies', sample_task.name, "Task name not correct");
			Y.Assert.areEqual('2009-12-01T00:00:00Z', sample_task.due, "Task due property not correct");
			Y.Assert.areEqual('2009-11-17T10:34:49Z', sample_task.modified, "Modified time not correct");			
		},
		
		testObjectToTaskListWhenUsingArrays: function() {

			var tasks = TaskListModel.objectToTaskList(SampleTestData.remote_json_with_two_lists);

			var task_hash = {};
			tasks.each(function(task) {
				task_hash[task.taskID] = task;
			});
			
			Y.Assert.areEqual('11122940', task_hash['79648346'].listID, "Test 1.1");
			Y.Assert.areEqual('55630580', task_hash['79648346'].taskseriesID, "Test 1.2");
			Y.Assert.areEqual('79648346', task_hash['79648346'].taskID, "Test 1.3");
			
			Y.Assert.areEqual('2637966', task_hash['75724449'].listID, "Test 2.1");
			Y.Assert.areEqual('52954009', task_hash['75724449'].taskseriesID, "Test 2.2");
			Y.Assert.areEqual('75724449', task_hash['75724449'].taskID, "Test 2.3");
			
			Y.Assert.areEqual('2637966', task_hash['66459582'].listID, "Test 3.1");
			Y.Assert.areEqual('46489199', task_hash['66459582'].taskseriesID, "Test 3.2");
			Y.Assert.areEqual('66459582', task_hash['66459582'].taskID, "Test 3.3");
		},
		
		testTaskListFromObjectIsSorted: function() {
			var tasks = TaskListModel.objectToTaskList(SampleTestData.big_remote_json);
			var last_date = tasks[0].due;
			
			for (var i = 0; i < tasks.length; i++) {
				var this_date = tasks[i].due;
				Y.assert(last_date <= this_date, "Date for task[" + i + "] is " + this_date + " but comes after " + last_date);
				last_date = this_date;
			}
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
			
			// Non-times should give 'None'
			Y.Assert.areEqual('None', model.dueDateFormatter(''), 'Test none-time 1');
			Y.Assert.areEqual('None', model.dueDateFormatter('xxx'), 'Test none-time 2');
			Y.Assert.areEqual('None', model.dueDateFormatter({}), 'Test none-time 3');
			Y.Assert.areEqual('None', model.dueDateFormatter(), 'Test none-time 4');
			
			// Overdue dates
			Y.Assert.areEqual('Sun 22 Nov', model.dueDateFormatter('2009-11-22T14:54:22Z'), 'Test overdue 1');
			Y.Assert.areEqual('Mon 2 Jun', model.dueDateFormatter('2008-06-02T14:54:22Z'), 'Test overdue 2');
		},
		
		testSetTaskListShouldErrorWithoutTaskModelObjects: function() {
			var tasklist = new TaskListModel();
			tasklist.setTaskList(['hello', 'world']);
		},
				
		testTaskListStorage: function() {
			var tasklist = new TaskListModel();

			tasklist.setTaskList([
				new TaskModel({	name: 'sometask' }),
				new TaskModel({	name: 'some other task' }),
			]);
			Y.Assert.areEqual('sometask', tasklist.getTaskList()[0].name, 'Task list does not hold task #1 after being set');
			Y.Assert.areEqual('some other task', tasklist.getTaskList()[1].name, 'Task list does not hold task #2 after being set');

			tasklist.saveTaskList();
			var tasklist2 = new TaskListModel();
			Y.Assert.isArray(tasklist2.getTaskList(), "Task list is not initially an array");
			Y.Assert.areEqual(0, tasklist2.getTaskList().length, "Task list array is not initially empty");
			
			tasklist = undefined;
			tasklist2.loadTaskList();
			Y.Assert.isInstanceOf(TaskModel, tasklist2.getTaskList()[0], 'Loaded task is not a TaskModel');
			Y.Assert.areEqual('sometask', tasklist2.getTaskList()[0].name, 'Task list does not hold task #1 after being loaded');
			Y.Assert.areEqual('some other task', tasklist2.getTaskList()[1].name, 'Task list does not hold task #2 after being loaded');
		},
		
		testTaskListStorageHasEndOfListMarker: function() {
			var tasklist = new TaskListModel();

			tasklist.setTaskList([
				new TaskModel({	name: 'task1' }),
				new TaskModel({	name: 'task2' }),
				new TaskModel({	name: 'task3' })
			]);
			tasklist.saveTaskList();
			tasklist.setTaskList([
				new TaskModel({	name: 'taskA' }),
				new TaskModel({	name: 'taskB' })
			]);
			tasklist.saveTaskList();
			tasklist.loadTaskList();
			Y.Assert.areEqual(2, tasklist.getTaskList().length, 'Task list does not hold right number of tasks');
		},
		
		testGetLatestModified: function() {
			var model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			Y.Assert.areEqual('2009-11-18T16:58:19Z', model.getLatestModified(), "Latest modified time not found");
		},
		
		testGetLatestModifiedIfAllUndefined: function() {
			var model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			model.getTaskList().each(function(task_model) {
				delete task_model.modified;
			});
			Y.Assert.isUndefined(model.getLatestModified(), "Lastest modified should be undefined if no modified times");
		},
		
		testGetLatestModifiedIfNoTasks: function() {
			var model = new TaskListModel();
			Y.Assert.isUndefined(model.getLatestModified(), "Lastest modified should be undefined if no tasks");
		},
		
		testGetLatestModifiedWithSomeUndefinedValues: function() {
			var model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			model.getTaskList()[2].modified = undefined;
			model.getTaskList()[5].modified = undefined;
			Y.Assert.areEqual('2009-11-18T16:58:19Z', model.getLatestModified(), "Latest modified time not found");
		},
		
		testGetLatestModifiedWithTimezones: function() {
			var model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			model.getTaskList()[2].modified = '2009-11-19T16:58:19+06:00'; // = 10:58Z
			model.getTaskList()[5].modified = '2009-11-19T16:58:19-04:00'; // = 20:58Z
			model.getTaskList()[8].modified = '2009-11-19T16:58:19Z';      // = 16:58Z
			Y.Assert.areEqual('2009-11-19T16:58:19-04:00', model.getLatestModified(), "Timezoned modification not calculated correctly");
		},

		testGetTask: function() {
			var model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			
			var task1 = model.getTask({
				listID: "2637966",
				taskseriesID: "32135089",
				taskID: "79230749"
			});
			Y.Assert.areEqual("Misc notes - Update", task1.name, "Didn't get task correctly");
			
			var task2 = model.getTask({
				listID: "madeuplist",
				taskseriesID: "32135089",
				taskID: "79230749"
			});
			Y.Assert.isUndefined(task2, "Mistakenly found task");
		},
		
		testMergeTaskUsingNewTask: function() {
			var model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			
			var new_task = new TaskModel({
				listID: '11234',
				taskseriesID: '556677',
				taskID: '889900',
				name: 'Do something new',
				due: '2010-01-01T00:00:00Z'
			});
			new_task.today = function() { return Date.parse('2010-01-01T00:00:00Z'); };
			
			var num_tasks = model.getTaskList().length;
			model.mergeTask(new_task);
			Y.Assert.areEqual(num_tasks+1, model.getTaskList().length, "Task list isn't any bigger");
			
			var extra_task = model.getTask({
				listID: "11234",
				taskseriesID: "556677",
				taskID: "889900"});
			Y.Assert.isNotUndefined(extra_task, "New task not found in list");
			Y.Assert.areEqual(true, extra_task.isDueFlag, "New task's due flag not updated");
			Y.Assert.areEqual(false, extra_task.isOverdueFlag, "New task's overdue flag not updated");
		},
		
		testMergeTaskWithExistingTask: function() {
			var model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			var existing_task = model.getTaskList()[5];
			var existing_task_updated = new TaskModel({
				listID: existing_task.listID,
				taskseriesID: existing_task.taskseriesID,
				taskID: existing_task.taskID,
				name: existing_task.name + " again",
				due: existing_task.due
			});
			// Make it one day past the due date
			existing_task_updated.today = function() { return Date.parse(existing_task_updated.due).add({ seconds: 1 }); };

			var num_tasks = model.getTaskList().length;
			model.mergeTask(existing_task_updated);
			Y.Assert.areEqual(num_tasks, model.getTaskList().length, "Task list should be same size");
			
			var found_task = model.getTask({
				listID: existing_task.listID,
				taskseriesID: existing_task.taskseriesID,
				taskID: existing_task.taskID});
			Y.Assert.areEqual(existing_task_updated.name, found_task.name, "Task not updated");
			Y.Assert.areEqual(true, found_task.isDueFlag, "Task's due flag not updated");
			Y.Assert.areEqual(true, found_task.isOverdueFlag, "Task's overdue flag not updated");
		}

	});

} );