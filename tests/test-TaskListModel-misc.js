// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Test the task list model
 */

testCases.push( function(Y) {

	var INITIALISE_STORE = function() {
		Store.initialise();
	};
	
	var REMOVE_ALL_TASKS = function() {
		Store.removeAllTasks();
	};

	return new Y.Test.Case({
		
		setUp: function() {
			TestUtils.captureMojoLog();
		},
		
		tearDown: function() {
			TestUtils.restoreMojoLog();
		},

		testConstructor: function() {
			var model = new TaskListModel();
			Y.Assert.isNotUndefined(model, "Model can't be constructed");
		},
		
		testConstructorWithArgument: function() {
			var task_list;
			var model;
			var found_task;
			var task0_name;
			
			TestUtils.runInSeries(this, 200,
				[
					INITIALISE_STORE,
					REMOVE_ALL_TASKS,
					function() {
						task_list = TaskListModel.objectToTaskList(SampleTestData.big_remote_json);
						model = new TaskListModel(task_list);
					},
					function() {
						Y.Assert.areEqual(task_list, model.getTaskList(), "Task list didn't get set by constructor");
						
						// Check at least one task is saved.
						task0_name = task_list[0].name;
						Y.Assert.isNotUndefined(task0_name, "Task 0 needs a name if we're to test sensibly");
						Store.loadTask(task_list[0].localID, function(task) { found_task = task })
					},
					function() {
						Y.Assert.areEqual(task0_name, found_task.name, "Doesn't store tasks when set in constructor");
					}
				]
			);
			
		},
		
		testConstructorWithNoArgumentDoesntRemovePreviousTasks: function() {
			var task, model, model2, found_task;

			TestUtils.runInSeries(this, 200,
				[
					INITIALISE_STORE,
					REMOVE_ALL_TASKS,
					function() {
						task = new TaskModel({ name: 'hello' });
						model = new TaskListModel([task]);
					},
					function() {
						Store.loadTask(task.localID, function(task) { found_task = task });
					},
					function() {
						Y.Assert.areEqual('hello', found_task.name, "Should have saved task");
						model2 = new TaskListModel();
						Store.loadTask(task.localID, function(task) { found_task = task });
					},
					function() {
						Y.Assert.isNotUndefined(found_task, "Should have kept task");
						Y.Assert.areEqual('hello', found_task.name, "Should have stored task name");
					}
				]
			);
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

			var task_hash = TestUtils.getTaskIDToTaskHash(tasks);
			
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
		
		testObjectToTaskListWithRecurrenceRule: function() {
			var tasks = TaskListModel.objectToTaskList(SampleTestData.big_remote_json);
			var task_hash = TestUtils.getTaskIDToTaskHash(tasks);
			var task_with_rrule = task_hash['78909702'];
			
			Y.Assert.isNotUndefined(task_with_rrule, "Could not find intended task");
			Y.Assert.areEqual("Legal - Check updatedoc", task_with_rrule.name, "Didn't pick up right task");
			Y.Assert.isNotUndefined(task_with_rrule.rrule, "Task didn't get rrule");
			Y.Assert.areEqual("1", task_with_rrule.rrule.every, "Rrule didn't have right 'every' property");
			Y.Assert.areEqual("FREQ=WEEKLY;INTERVAL=1;BYDAY=MO", task_with_rrule.rrule['$t'], "Rrule didn't have right '$t' property");
		},
		
		testObjectToTaskListWithNoRecurrenceRule: function() {
			var tasks = TaskListModel.objectToTaskList(SampleTestData.big_remote_json);
			var task_hash = TestUtils.getTaskIDToTaskHash(tasks);
			var task_with_no_rrule = task_hash['75724449'];
			
			Y.Assert.isNotUndefined(task_with_no_rrule, "Could not find intended task");
			Y.Assert.areEqual("O2 - Expect deposit credited", task_with_no_rrule.name, "Didn't pick up right task");
			Y.Assert.isUndefined(task_with_no_rrule.rrule, "Task didn't get rrule correctly");
		},
		
		testObjectToTaskListWithDeletedItems: function() {
			var model = new TaskListModel();
			var tasks = TaskListModel.objectToTaskList(SampleTestData.last_sync_response);
			
			Y.Assert.areEqual(4, tasks.length, "Wrong number of tasks");

			var task_id_to_task = TestUtils.getTaskIDToTaskHash(tasks);
			
			Y.Assert.areEqual('Sixth task', task_id_to_task['83601522'].name, "Bad name for task ID 83601522");
			Y.Assert.areEqual('Fifth task', task_id_to_task['83601519'].name, "Bad name for task ID 83601519");
			Y.Assert.areEqual(true, task_id_to_task['83601413'].deleted, "Wrong deleted flag for task ID 83601413");
			Y.Assert.areEqual(true, task_id_to_task['83601399'].deleted, "Wrong deleted flag for task ID 83601399");
		},
		
		testObjectToTaskListWithSingleDeletedItem: function() {
			var tasks = TaskListModel.objectToTaskList(SampleTestData.last_sync_response_with_just_one_deletion);
			
			Y.Assert.areEqual(1, tasks.length, "Wrong number of tasks");

			var task = tasks[0];
			
			Y.Assert.areEqual('11122940', task.listID, "Bad list ID");
			Y.Assert.areEqual('58274350', task.taskseriesID, "Bad taskseries ID");
			Y.Assert.areEqual('83601519', task.taskID, "Bad task ID");
			Y.Assert.areEqual(true, task.deleted, "Deleted flag set wrong");
		},
		
		testObjectToTaskListWithDeletedItemsMarkedByTime: function() {
			var tasks = TaskListModel.objectToTaskList(SampleTestData.taskseries_obj_with_multiple_and_recurring_deletions);
			
			Y.Assert.areEqual(22, tasks.length, "Wrong number of tasks");
			
			var task_id_to_task = TestUtils.getTaskIDToTaskHash(tasks);

			Y.Assert.areEqual(false, task_id_to_task['84757747'].deleted, "Task ID 84757747 should not be marked deleted");
			Y.Assert.areEqual(false, task_id_to_task['84630592'].deleted, "Task ID 84630592 should not be marked deleted");
			Y.Assert.areEqual(true, task_id_to_task['62349079'].deleted, "Task ID 62349079 should be marked deleted");
			Y.Assert.areEqual(true, task_id_to_task['59484931'].deleted, "Task ID 59484931 should be marked deleted");
		},
		
		testObjectToTaskListWithSomeCompletions: function() {
			var tasks = TaskListModel.objectToTaskList(SampleTestData.response_with_basic_and_recurring_completion);
			
			Y.Assert.areEqual(4, tasks.length, "Wrong number of tasks");
			
			var task_hash = TestUtils.getTaskIDToTaskHash(tasks);
			
			Y.Assert.areEqual("Some test task", task_hash['85269951'].name, "Didn't get new task correctly");
			Y.Assert.areEqual('11122940', task_hash['85269951'].listID, "Didn't get new task's list ID correctly");
			Y.Assert.areEqual('59269714', task_hash['85269951'].taskseriesID, "Didn't get new task's taskseries ID correctly");
			Y.Assert.areEqual(false, task_hash['85269951'].completed, "Didn't get new task's completed status correctly");
			
			Y.Assert.areEqual("Simple task to be completed", task_hash['85269908'].name, "Didn't get simple completed task");
			Y.Assert.areEqual("11122940", task_hash['85269908'].listID, "Didn't get simple completed task's list ID correctly");
			Y.Assert.areEqual("59269674", task_hash['85269908'].taskseriesID, "Didn't get simple completed task's taskseries ID correctly");
			Y.Assert.areEqual(true, task_hash['85269908'].completed, "Did get simple completed task's completed property");
			
			Y.Assert.areEqual("Recurring task to be completed", task_hash['85269921'].name, "Didn't get recurring completed task");
			Y.Assert.areEqual('11122940', task_hash['85269921'].listID, "Didn't get recurring completed task's list ID property");
			Y.Assert.areEqual('59269686', task_hash['85269921'].taskseriesID, "Didn't get recurring completed task's taskseries ID property");
			Y.Assert.areEqual(true, task_hash['85269921'].completed, "Didn't get recurring completed task's completed property");
			
			Y.Assert.areEqual("Recurring task to be completed", task_hash['85270009'].name, "Didn't get recurring created task");
			Y.Assert.areEqual("11122940", task_hash['85270009'].listID, "Didn't get recurring created task's list ID correctly");
			Y.Assert.areEqual("59269686", task_hash['85270009'].taskseriesID, "Didn't get recurring created task's taskseries ID correctly");
			Y.Assert.areEqual(false, task_hash['85270009'].completed, "Didn't get recurring created task's completed property");
		},
		
		testObjectToTaskListWithReallyBigData: function() {
			var tasks = TaskListModel.objectToTaskList(EverythingTestData.everything_response);
			Y.Assert.isNotUndefined(tasks, "Should have got some tasks");
		},
		
		testObjectToTaskListWithNoTasks: function() {
			var no_tasks_response = {"rsp":{"stat":"ok","tasks":{"rev":"fhinkuq6wlws00c8w0wk48ggs44kssc"}}};
			var tasks = TaskListModel.objectToTaskList(no_tasks_response);
			Y.Assert.areEqual(0, tasks.length, "Task list should be empty");
		},
		
		testTaskseriesObjectToTasks: function() {
			var taskseries_obj = SampleTestData.taskseries_obj_with_multiple_tasks;
			var task_array = TaskListModel.taskseriesObjectToTasks(taskseries_obj, '11223');
			
			Y.Assert.areEqual('58500785', task_array[0].taskseriesID, "Taskseries ID not picked up for first task");
			Y.Assert.areEqual('83992704', task_array[0].taskID, "Task ID not picked up for first task");
			Y.Assert.areEqual('2010-01-04T00:00:00Z', task_array[0].due, "Due date not picked up for first task");

			Y.Assert.areEqual('58500785', task_array[0].taskseriesID, "Taskseries ID not picked up for second task");
			Y.Assert.areEqual('83954367', task_array[1].taskID, "Task ID not picked up for second task");
			Y.Assert.areEqual('2009-12-24T00:00:00Z', task_array[1].due, "Due date not picked up for second task");

		},
		
		testSetTaskListShouldErrorWithoutTaskModelObjects: function() {
			var tasklist = new TaskListModel();
			try {
				tasklist.setTaskList(['hello', 'world']);
			}
			catch (e) {
				Y.Assert.areEqual("TaskListModel.setTaskList needs an array of TaskModel objects", e.message);
				return;
			}
			Y.fail("Should have thrown error");
		},
		
		testSetTaskListShouldSaveTasksAndRemoveOldOnes: function() {
			var tasklist, task1, task2, task3, found_task;
			
			TestUtils.runInSeries(this, 200,
				[
					INITIALISE_STORE,
					REMOVE_ALL_TASKS,
					function() {
						tasklist = new TaskListModel();
						task1 = new TaskModel({	name: 'sometask' });
					},
					function() {
						task2 = new TaskModel({	name: 'some other task' });
					},
					function() {
						tasklist.setTaskList([ task1, task2 ]);
					},
					function() {
						Store.loadTask(task1.localID, function(task) { found_task = task });
					},
					function() {
						Y.Assert.areEqual('sometask', found_task.name, "Didn't save task1");
						Store.loadTask(task2.localID, function(task) { found_task = task });
					},
					function() {
						Y.Assert.areEqual('some other task', found_task.name, "Didn't save task2");
			
						task3 = new TaskModel({	name: 'a third task' });
						tasklist.setTaskList([ task3 ]);
					},
					function() {
						Store.loadTask(task1.localID, function(task) { found_task = task });
					},
					function() {
						Y.Assert.isUndefined(found_task, "Didn't erase task1");
						Store.loadTask(task2.localID, function(task) { found_task = task });
					},
					function() {
						Y.Assert.isUndefined(found_task, "Didn't erase task2");
					}
				]
			);
			
		},
				
		testTaskListStorage: function() {
			var tasklist, tasklist2;
			TestUtils.runInSeries(this, 200,
				[
					INITIALISE_STORE,
					REMOVE_ALL_TASKS,
					function() {
						tasklist = new TaskListModel();
						tasklist.setTaskList([
							new TaskModel({	name: 'A sometask' }),
							new TaskModel({	name: 'B some other task' }),
						]);
					},
					function() {
						Y.Assert.areEqual('A sometask', tasklist.getTaskList()[0].name, 'Task list does not hold task #1 after being set');
						Y.Assert.areEqual('B some other task', tasklist.getTaskList()[1].name, 'Task list does not hold task #2 after being set');

						tasklist2 = new TaskListModel();
						Y.Assert.isArray(tasklist2.getTaskList(), "Task list is not initially an array");
						Y.Assert.areEqual(0, tasklist2.getTaskList().length, "Task list array is not initially empty");
					},
					function() {
						tasklist2.loadTaskList();
					},
					function() {
						Y.Assert.isInstanceOf(TaskModel, tasklist2.getTaskList()[0], 'Loaded task is not a TaskModel');
						Y.Assert.areEqual('A sometask', tasklist2.getTaskList()[0].name, 'Task list does not hold task #1 after being loaded');
						Y.Assert.areEqual('B some other task', tasklist2.getTaskList()[1].name, 'Task list does not hold task #2 after being loaded');
					}
				]
			);
		},
		
		testLoadTaskListAlsoSorts: function() {
			var tasks = TaskListModel.objectToTaskList(SampleTestData.big_remote_json);
			var model, load_completed = false;
			
			var series = [
				INITIALISE_STORE,
				REMOVE_ALL_TASKS
			];
			tasks.each(function(task) {
				series.push(function() { Store.saveTask(task) });
			});
			series.push(
				function() {
					model = new TaskListModel();
					model.loadTaskList(function(tasks) { load_completed = true });
				},
				function() {
					Y.Assert.areEqual(true, load_completed, "Didn't load tasks");
					Y.Assert.areEqual(tasks.length, model.getTaskList().length, "Saved task list and loaded task list are different lengths");
					Y.assert(tasks.length > 0, "Should have saved some tasks");

					tasks.sort(TaskModel.sortByDueThenName);
					for (var i = 0; i < tasks.length; i++) {
						var orig_task = tasks[i];
						var stored_task = model.getTaskList()[i];
						Y.Assert.areEqual(orig_task.name, stored_task.name, "Task "
							+ i + " names differ. Original is " + orig_task.toSummaryString()
							+ ", stored is " + stored_task.toSummaryString());
						Y.Assert.areEqual(orig_task.due, stored_task.due, "Task "
							+ i + " due dates differ. Original is " + orig_task.toSummaryString()
							+ ", stored is " + stored_task.toSummaryString());
					}
				}
			);
			TestUtils.runInSeries(this, 250, series);
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
			var model, TaskModelExtended, new_task, num_tasks, extra_task, found_task;
			TestUtils.runInSeries(this, 300,
				[
					INITIALISE_STORE,
					REMOVE_ALL_TASKS,
					function() {
						model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
					},
					function() {
						TaskModelExtended = TestUtils.extend(TaskModel, {
							today: function() { return Date.parse('2010-01-01T00:00:00Z') },
							getTimezoneOffset: function(date) { return 0 }
						});
						new_task = new TaskModelExtended({
							listID: '11234',
							taskseriesID: '556677',
							taskID: '889900',
							name: 'Do something new',
							due: '2010-01-01T00:00:00Z'
						});
						num_tasks = model.getTaskList().length;
						model.mergeTask(new_task);
					},
					function() {
						Y.Assert.areEqual(num_tasks+1, model.getTaskList().length, "Task list isn't any bigger");
						Store.loadTask(new_task.localID, function(task) { found_task = task });
					},
					function() {
						Y.Assert.areEqual('Do something new', found_task.name, "New task wasn't stored");
					},
					function() {
						var extra_task = model.getTask({
							listID: "11234",
							taskseriesID: "556677",
							taskID: "889900"});
						Y.Assert.isNotUndefined(extra_task, "New task not found in list");
						Y.Assert.areEqual(true, extra_task.isDueFlag, "New task's due flag not updated");
						Y.Assert.areEqual(false, extra_task.isOverdueFlag, "New task's overdue flag not updated");
					}
				]
			);
			
		},
		
		testMergeTaskUsingNewTaskWillStoreTaskWhichDoesntNeedPurging: function() {
			var model = new TaskListModel();
			var new_task_not_needing_purging = new TaskModel({
				listID: '54321',
				taskseriesID: '665544',
				taskID: '776655',
				name: 'Do something new',
				due: '2010-01-03T00:00:00Z',
				completed: false
			});
			var called_add_task;
			model.addTask = function(task) { called_add_task = true };

			called_add_task = false;
			model.mergeTask(new_task_not_needing_purging);
			Y.Assert.areEqual(true, called_add_task, "Should have added task which doesn't need purging");			
		},
		
		testMergeTaskUsingNewTaskWontStoreTaskNeedingPurging: function() {
			var model = new TaskListModel();
			var new_task_needing_purging = new TaskModel({
				listID: '11234',
				taskseriesID: '556677',
				taskID: '889900',
				name: 'Do something done',
				due: '2010-01-02T00:00:00Z',
				completed: true
			});
			var called_add_task;
			model.addTask = function(task) { called_add_task = true };

			called_add_task = false;
			model.mergeTask(new_task_needing_purging);
			Y.Assert.areEqual(false, called_add_task, "Should not have added task which needs purging");			
		},
		
		testMergeTaskWithExistingTask: function() {
			var model;
			var existing_task, existing_task_local_id, updated_name;
			var TaskModelExtended;
			var existing_task_updated, existing_task_updated_local_id;
			var num_tasks, found_task;
			
			TestUtils.runInSeries(this, 200,
				[
					INITIALISE_STORE,
					REMOVE_ALL_TASKS,
					function() {
						model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
					},
					function() {
						existing_task = model.getTaskList()[5];
						existing_task_local_id = existing_task.localID;
			
						// Make make a task model that thinks it is the due date
						TaskModelExtended = TestUtils.extend(TaskModel, {
							today: function() { return Date.parse(existing_task.due) }
						});
						updated_name = existing_task.name + " again";
						existing_task_updated = new TaskModelExtended({
							listID: existing_task.listID,
							taskseriesID: existing_task.taskseriesID,
							taskID: existing_task.taskID,
							name: updated_name,
							due: existing_task.due
						});
						existing_task_updated_local_id = existing_task_updated.localID;			
						Y.Assert.areNotEqual(existing_task_local_id, existing_task_updated.localID, "Newly-generated updated task should not have same local ID");
			
						num_tasks = model.getTaskList().length;
						model.mergeTask(existing_task_updated);
					},
					function() {
						Y.Assert.areEqual(num_tasks, model.getTaskList().length, "Task list should be same size");
			
						Y.Assert.areEqual(existing_task_local_id, existing_task_updated.localID, "Newly-generated updated task should have original's local ID after merge");
						Y.Assert.areEqual(existing_task_local_id, existing_task.localID, "Original task should have kept local ID");
						
						Store.loadTask(existing_task_local_id, function(task) { found_task = task });
					},
					function() {
						Y.Assert.areEqual(updated_name, found_task.name, "Did not store updated name in existing task");
						
						found_task = model.getTask({
							listID: existing_task.listID,
							taskseriesID: existing_task.taskseriesID,
							taskID: existing_task.taskID});
						Y.Assert.areEqual(updated_name, found_task.name, "Task not updated");
						Y.Assert.areEqual(true, found_task.isDueFlag, "Task's due flag not updated");
						Y.Assert.areEqual(false, found_task.isOverdueFlag, "Task's overdue flag not updated");
						Y.Assert.areEqual(existing_task_local_id, found_task.localID, "Task's local ID should have been retrieved");
					}
				]
			);
		},
		
		testMergeTaskWithLocalChangesWithExistingTask: function() {
			var model;
			var original_task, original_task_local_id;
			var TaskModelExtended;
			var remotely_updated_name, original_task_updated_remotely, original_task_updated_local_id;
			var locally_updated_due, num_tasks;
			var found_task_with_updated_local_id;
			var found_task;
			
			TestUtils.runInSeries(this, 200,
				[
					INITIALISE_STORE,
					REMOVE_ALL_TASKS,
					function() {
						model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
					},
					function() {
						original_task = model.getTaskList()[5];
						original_task_local_id = original_task.localID;
						
						// Make make a task model that thinks it is not yet the due date
						var day_before_original_task_due = original_task.dueAsLocalDate().add({ days: -1 });
						TaskModelExtended = TestUtils.extend(TaskModel, {
							today: function() {	return day_before_original_task_due; }
						});
						remotely_updated_name = original_task.name + " again";
						original_task_updated_remotely = new TaskModelExtended({
							listID: original_task.listID,
							taskseriesID: original_task.taskseriesID,
							taskID: original_task.taskID,
							name: remotely_updated_name,
							due: original_task.due
						});
						original_task_updated_local_id = original_task_updated_remotely.localID;
						Y.Assert.areNotEqual(original_task_local_id, original_task_updated_local_id, "Newly-generated updated task should not have same local ID");
						
						// Also make sure the original task thinks it's not yet the due date
						original_task.today = TaskModelExtended.today;
						
						// Now update the original task locally
						locally_updated_due = original_task.dueAsLocalDate().add({ days: 1 }).toISOString();
						original_task.setForPush('due', locally_updated_due);
			
						num_tasks = model.getTaskList().length;
						model.mergeTask(original_task_updated_remotely);
					},
					function() {
						Y.Assert.areEqual(num_tasks, model.getTaskList().length, "Task list should be same size");
			
						Y.Assert.areEqual(original_task_local_id, original_task_updated_remotely.localID, "Newly-generated updated task should have original's local ID after merge");
						Y.Assert.areEqual(original_task_local_id, original_task.localID, "Original task should have kept local ID");
						Store.loadTask(original_task_updated_local_id, function(task) { found_task_with_updated_local_id = task });
					},
					function() {
						Y.Assert.isUndefined(found_task_with_updated_local_id, "Should not have stored task with ID from newly-generated updated task");
						Store.loadTask(original_task_local_id, function(task) { found_task = task });
					},
					function() {
						Y.Assert.areEqual(remotely_updated_name, found_task.name, "Did not store updated name in existing task");
						Y.Assert.areEqual(locally_updated_due, found_task.due, "Did not store locally-updated due date in existing task");
			
						found_task = model.getTask({
							listID: original_task.listID,
							taskseriesID: original_task.taskseriesID,
							taskID: original_task.taskID});
						Y.Assert.areEqual(remotely_updated_name, found_task.name, "Task not updated from merged task");
						Y.Assert.areEqual(locally_updated_due, found_task.due, "Task does not carry locally updated due date");
						Y.Assert.areEqual('due', found_task.localChanges[0], "Local change flags are lost");
						Y.Assert.areEqual(false, found_task.isDueFlag, "Task's due flag not updated");
						Y.Assert.areEqual(false, found_task.isOverdueFlag, "Task's overdue flag not updated");
					}
				]
			);
		},
		
		testPurgeTaskList: function() {
			var model, num_tasks;
			var task_2, task_3, task_4, task_5, task_6, task_7, task_8;
			var found_task_2, found_task_3, found_task_4, found_task_5, found_task_6,
				found_task_7, found_task_8;
			
			TestUtils.runInSeries(this, 200,
				[
					INITIALISE_STORE,
					REMOVE_ALL_TASKS,
					function() {
						model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
					},
					function() {
						num_tasks = model.getTaskList().length;
			
						// Save some tasks for checking later
						task_2 = model.getTaskList()[2];
						task_3 = model.getTaskList()[3];
						task_4 = model.getTaskList()[4];
						task_5 = model.getTaskList()[5];
						task_6 = model.getTaskList()[6];
						task_7 = model.getTaskList()[7];
						task_8 = model.getTaskList()[8];
						
						// Set three tasks to be deleted
						task_3.deleted = true;
						task_5.deleted = true;
						task_7.deleted = true;
						
						// Set two tasks to be deleted locally, but changes need to be pushed
						task_4.setForPush('deleted', true);
					},
					function() {
						task_8.setForPush('deleted', true);
					},
					function() {
						
						// Set one task which has local changes which need to be pushed, but is not to be deleted
						task_2.setForPush('name', "Do it again");
					},
					function() {
						
						model.purgeTaskList();
					},
					function() {
						Y.Assert.areEqual(num_tasks-3, model.getTaskList().length, "Wrong tasks purged");
						Y.Assert.isUndefined(model.getTask(task_3), "Task 3 not purged");
						Y.Assert.isUndefined(model.getTask(task_5), "Task 5 not purged");
						Y.Assert.isUndefined(model.getTask(task_7), "Task 7 not purged");
						Y.Assert.isNotUndefined(model.getTask(task_4), "Task 4 was mistakenly purged");
						Y.Assert.isNotUndefined(model.getTask(task_8), "Task 8 was mistakenly purged");
						Y.Assert.isNotUndefined(model.getTask(task_2), "Task 2 was mistakenly purged");
						
						// Ensure the right tasks are (and are not) in the Store
						Store.loadTask(task_3.localID, function(task) { found_task_3 = task });
					},
					function() {
						Y.Assert.isUndefined(found_task_3, "Didn't remove task 3 from store");
						Store.loadTask(task_5.localID, function(task) { found_task_5 = task });
					},
					function() {
						Y.Assert.isUndefined(found_task_5, "Didn't remove task 5 from store");
						Store.loadTask(task_7.localID, function(task) { found_task_7 = task });
					},
					function() {
						Y.Assert.isUndefined(found_task_7, "Didn't remove task 7 from store");
						Store.loadTask(task_4.localID, function(task) { found_task_4 = task });
					},
					function() {
						Y.Assert.isNotUndefined(found_task_4, "Mistakenly removed task 4 from store");
						Store.loadTask(task_8.localID, function(task) { found_task_8 = task });
					},
					function() {
						Y.Assert.isNotUndefined(found_task_8, "Mistakenly removed task 8 from store");
						Store.loadTask(task_2.localID, function(task) { found_task_2 = task });
					},
					function() {
						Y.Assert.isNotUndefined(found_task_2, "Mistakenly removed task 2 from store");
					}
				]
			);
		},
		
		testGetListOfVisibleTasks: function() {
			var model = new TaskListModel(TaskListModel.objectToTaskList(SampleTestData.big_remote_json));
			var num_tasks = model.getTaskList().length;

			// Save some tasks for checking later
			var task_2 = model.getTaskList()[2];
			var task_3 = model.getTaskList()[3];
			var task_4 = model.getTaskList()[4];
			var task_5 = model.getTaskList()[5];
			var task_6 = model.getTaskList()[6];
			var task_7 = model.getTaskList()[7];
			var task_8 = model.getTaskList()[8];
			
			// Set three tasks to be deleted or completed.
			// These should not be visible
			task_3.deleted = true;
			task_5.deleted = true;
			task_7.completed = true;
			
			// Set two tasks to be deleted or completed locally, but changes need to be pushed
			// These should not be visible, either
			task_4.setForPush('deleted', true);
			task_8.setForPush('completed', true);
			
			// Set one task which has local changes which need to be pushed, but is not to be deleted.
			// This should still be visible
			task_2.setForPush('name', "Do it again");
			
			var visible_tasks = model.getListOfVisibleTasks();
			var visible_model = new TaskListModel(visible_tasks);
			Y.Assert.areEqual(num_tasks-5, visible_tasks.length, "Wrong tasks omitted");
			Y.Assert.isUndefined(visible_model.getTask(task_3), "Task 3 not omitted");
			Y.Assert.isUndefined(visible_model.getTask(task_5), "Task 5 not omitted");
			Y.Assert.isUndefined(visible_model.getTask(task_7), "Task 7 not omitted");
			Y.Assert.isUndefined(visible_model.getTask(task_4), "Task 4 not omitted");
			Y.Assert.isUndefined(visible_model.getTask(task_8), "Task 8 not omitted");
			Y.Assert.isNotUndefined(visible_model.getTask(task_2), "Task 2 was mistakenly omitted");
		},
		
		testGetAllTasksInSeries: function() {
			var task_list = TaskListModel.objectToTaskList(SampleTestData.response_with_basic_and_recurring_completion);
			
			Y.Assert.areEqual(4, task_list.length, "Got wrong number of tasks");
			
			var model = new TaskListModel(task_list);
			
			var taskseries = model.getAllTasksInSeries({ listID: '11122940', taskseriesID: '59269686'});
			Y.Assert.areEqual(2, taskseries.length, "Didn't right tasks in series");
			var task_hash = TestUtils.getTaskIDToTaskHash(taskseries);
			Y.Assert.isNotUndefined(task_hash['85269921'], "Didn't get task 85269921");
			Y.Assert.isNotUndefined(task_hash['85270009'], "Didn't get task 85270009");
		},
		
		testMarkAsDeletedAllTasksInSeries: function() {
			var task_list = TaskListModel.objectToTaskList(SampleTestData.response_with_basic_and_recurring_completion);
			
			Y.Assert.areEqual(4, task_list.length, "Got wrong number of tasks");
			
			var model = new TaskListModel(task_list);
			var task_hash = TestUtils.getTaskIDToTaskHash(model.getTaskList());
			Y.Assert.areEqual(false, task_hash['85269951'].deleted, "Task 85269951 mistakenly deleted");
			Y.Assert.areEqual(false, task_hash['85269908'].deleted, "Task 85269908 mistakenly deleted");
			Y.Assert.areEqual(false, task_hash['85269921'].deleted, "Task 85269921 mistakenly deleted");
			Y.Assert.areEqual(true, task_hash['85269921'].isRecurring(), "Task 85269921 not recurring");
			Y.Assert.areEqual(false, task_hash['85270009'].deleted, "Task 85270009 mistakenly deleted");
			Y.Assert.areEqual(true, task_hash['85270009'].isRecurring(), "Task 85270009 not recurring");

			model.markAsDeletedAllTasksInSeries({ listID: '11122940', taskseriesID: '59269686' });			
			Y.Assert.areEqual(false, task_hash['85269951'].deleted, "Task 85269951 mistakenly deleted");
			Y.Assert.areEqual(false, task_hash['85269908'].deleted, "Task 85269908 mistakenly deleted");
			Y.Assert.areEqual(true, task_hash['85269921'].deleted, "Task 85269921 not deleted");
			Y.Assert.areEqual(false, task_hash['85269921'].isRecurring(), "Task 85269921 shouldn't be recurring");
			Y.Assert.areEqual(true, task_hash['85270009'].deleted, "Task 85270009 not deleted");
			Y.Assert.areEqual(false, task_hash['85270009'].isRecurring(), "Task 85270009 shouldn't be recurring");
			
			// Check the rrule's userText is updated
			Y.Assert.areEqual('', task_hash['85269921'].rrule.userText, "Task 85269921 rrule.userText set appropriately");
			Y.Assert.areEqual('', task_hash['85270009'].rrule.userText, "Task 85270009 rrule.userText set appropriately");
		},
		
		testAddTask: function() {
			var task, model, found_task;
			
			TestUtils.runInSeries(this, 250,
				[
					INITIALISE_STORE,
					REMOVE_ALL_TASKS,
					function() {
						task = new TaskModel({
							listID: '112233',
							taskseriesID: '445566',
							taskID: '778899',
							name: 'My new task for testAddTask'
						});
						model = new TaskListModel();

						Store.loadTask(task.localID, function(task) { found_task = task });
					},
					function() {
						Y.Assert.isUndefined(found_task, "New task has already been stored");
						Y.Assert.isUndefined(model.getTask({ listID: '112233', taskseriesID: '445566', taskID: '778899' }), "Task is already in list");
						model.addTask(task);
					},
					function() {
						Store.loadTask(task.localID, function(task) { found_task = task });
					},
					function() {
						Y.Assert.isNotUndefined(found_task, "New task has not been stored");
						Y.Assert.isNotUndefined(model.getTask({ listID: '112233', taskseriesID: '445566', taskID: '778899' }), "Task is not in list");
					}
				]
			);
		}

	});

} );