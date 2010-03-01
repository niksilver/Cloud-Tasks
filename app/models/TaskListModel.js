// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Construct an empty task list or (if argument supplied) with a list of tasks set up.
 * If the optional task list is supplied then it will persist these tasks and overwrite
 * any previously stored tasks. If the optional task list is not supplied then this
 * won't happen.
 * @param {Object} optional_task_list  Optional array of TaskModel objects which is to be task list
 * @param {Function} onSuccess  Optional function called when the tasks have been stored, if
 *     the optional_task_list has been given.
 */
function TaskListModel(optional_task_list, onSuccess) {
	if (optional_task_list) {
		this.setTaskList(optional_task_list || [], onSuccess);
	}
	else {
		this._task_list = [];
	}
}

/**
 * Set the task list. This will be persisted, wiping out any previously-stored tasks.
 * @param {Array} task_list  Should be an array of TaskModel objects.
 * @param {Function} onSuccess  Optional function called when the tasks have been persisted.
 */
TaskListModel.prototype.setTaskList = function(task_list, onSuccess) {
	task_list.each(function(task) {
		if (!(task instanceof TaskModel)) {
			throw new Error("TaskListModel.setTaskList needs an array of TaskModel objects");
		}
	});
	Store.replaceAllTasks(task_list, onSuccess);
	this._task_list = task_list;
}

TaskListModel.prototype.getTaskList = function() {
	return this._task_list;
}

/**
 * Take a Remember The Milk API response with a task list, and convert it
 * into an array of TaskModel objects.
 * @param {Object} data_obj  A JSON data structure of the kind that is returned from
 *     Remember The Milk, with "rsp" at the top level.
 * @returns {Array} An array of TaskModel objects.
 */
TaskListModel.objectToTaskList = function(data_obj) {
	var task_list = [];
	var tasks_obj = data_obj.rsp.tasks;
	var list_array = Object.isArray(tasks_obj.list) ? tasks_obj.list : [tasks_obj.list];
	list_array.each(function(list_obj) {
		var list_id = list_obj.id;
		
		var taskseries_array = TaskListModel.makeArray(list_obj.taskseries);
		taskseries_array.each(function(taskseries_obj) {
			var task_array = TaskListModel.taskseriesObjectToTasks(taskseries_obj, list_id);
			task_array.each(function(task) {
				task_list.push(task);
			});
		});

		var deleted_obj = list_obj.deleted;
		var taskseries_elt = deleted_obj ? deleted_obj.taskseries : undefined;
		taskseries_array = TaskListModel.makeArray(taskseries_elt);
		taskseries_array.each(function(taskseries_obj) {
			var taskseries_id = taskseries_obj.id;
			var task_obj = taskseries_obj.task;
			var task_id = task_obj.id;
			var modified = task_obj.deleted;
			var task = new TaskModel({
				listID: list_id,
				taskseriesID: taskseries_id,
				taskID: task_id,
				modified: modified,
				deleted: true
			});
			task_list.push(task);
		});

	});
	
	return task_list;
}

/**
 * Take the value of the "taskseries" property from the RTM response and convert it
 * into an array TaskModel objects.
 * @param {Object} taskseries_obj  The taskseries object from RTM. Its "id" property will
 *     hold the value of the taskseries ID, etc.
 * @param {String} list_id  ID of the list that the taskseries lives in.
 */
TaskListModel.taskseriesObjectToTasks = function(taskseries_obj, list_id) {
	var taskseries_id = taskseries_obj.id;
	var name = taskseries_obj.name;
	var task_array = TaskListModel.makeArray(taskseries_obj.task);
	var task_model_array = [];
	task_array.each(function(task_obj) {
		var task_id = task_obj.id;
		var due = task_obj.due;
		var modified = taskseries_obj.modified;
		var deleted = (task_obj.deleted ? true : false);
		var rrule = Utils.clone(taskseries_obj.rrule);
		var completed = (task_obj.completed ? true : false);
		var task = new TaskModel({
			listID: list_id,
			taskseriesID: taskseries_id,
			taskID: task_id,
			name: name,
			due: due,
			modified: modified,
			deleted: deleted,
			rrule: rrule,
			completed: completed
		});
		task_model_array.push(task);
	});
	return task_model_array;
}

/**
 * Make an array for an object.
 * If object is an array then just returns it.
 * If it's undefined returns an empty array.
 * Otherwise returns an array with just the object in it.
 * @param {Object} obj  The object for the array.
 */
TaskListModel.makeArray = function(obj) {
	if (Object.isArray(obj)) {
		return obj;
	}
	else if (Object.isUndefined(obj)) {
		return [];
	}
	else {
		return [obj];
	}
}

TaskListModel.prototype.sort = function() {
	this._task_list.sort(TaskModel.sortByDueThenName);
}

TaskListModel.prototype.today = function() {
	return Date.today();
}

TaskListModel.prototype.dueDateFormatter = function(utc_string) {
	var utc_date = Date.parse(utc_string);
	if (utc_date == null) {
		return '';
	}
	utc_date.set({ hour: 0, minute: 0, second: 0});

	var today = this.today();
	if (Date.equals(today, utc_date)) {
		return 'Today';
	}
	
	var tomorrow = today.clone().add({ days: 1 });
	if (Date.equals(tomorrow, utc_date)) {
		return 'Tomorrow';
	}
	
	var end_of_week = today.clone().add({ days: 6 });
	if (utc_date.between(today, end_of_week)) {
		return utc_date.toString('ddd');
	}
	
	var end_of_12_months = today.clone().add({ years: 1, days: -1 });
	if (utc_date.between(today, end_of_12_months)) {
		return utc_date.toString('ddd d MMM');
	}
	
	// Overdue dates
	if (utc_date.isBefore(today)) {
		return utc_date.toString('ddd d MMM');
	}

	return utc_date.toString('ddd d MMM yyyy');
}

/**
 * Load the persisted task list.
 * The tasks will also get sorted.
 * @param {Function} onSuccess  Callback for when the tasks are loaded.
 *     Will be called with an array of TaskModel objects.
 */
TaskListModel.prototype.loadTaskList = function(onSuccess) {
	Mojo.Log.info("TaskListModel.loadTaskList: Entering");
	
	Store.loadAllTasks(function(tasks) {
		Mojo.Log.info("TaskListModel.loadTaskList: In success callback");
		this._task_list = tasks;
		this.sort();
		onSuccess(this._task_list);
	}.bind(this));
}

TaskListModel.prototype.eraseTaskList = function() {
	this.setTaskList([]);
}

/**
 * Get the latest modified property of all the tasks. May return undefined
 * if no tasks have a modified time.
 */
TaskListModel.prototype.getLatestModified = function() {
	var latest_value = undefined;
	var latest_date = undefined;
	this._task_list.each(function(task) {
		if (task.modified && !latest_value) {
			latest_value = task.modified;
			latest_date = Date.parse(task.modified);
		}
		else if (task.modified && latest_value) {
			var present_date = Date.parse(task.modified);
			if (present_date.isAfter(latest_date)) {
				latest_value = task.modified;
				latest_date = present_date;
			}
		}
	});
	return latest_value;
}

/**
 * Get a task with the given specification. spec must be an object with
 * properties listID, taskseriesID and taskID defined. Will return the
 * matching TaskModel or undefined.
 * @param {Object} spec  The match criteria.
 */
TaskListModel.prototype.getTask = function(spec) {
	for (var i = 0; i < this._task_list.length; i++) {
		var task = this._task_list[i];
		if (spec.taskID == task.taskID
			&& spec.taskseriesID == task.taskseriesID
			&& spec.listID == task.listID) {
			return task;
		}
	}
	return undefined;
}

/**
 * Get the index of a task with the given specification. spec must be an object with
 * properties listID, taskseriesID and taskID defined. Will return the
 * index in the task list of the matching TaskModel or -1.
 * @param {Object} spec  The match criteria.
 */
TaskListModel.prototype.getTaskIndex = function(spec) {
	for (var i = 0; i < this._task_list.length; i++) {
		var task = this._task_list[i];
		if (spec.taskID == task.taskID
			&& spec.taskseriesID == task.taskseriesID
			&& spec.listID == task.listID) {
			return i;
		}
	}
	return -1;
}

/**
 * Add a task into the task list (and persist it)
 * @param {TaskModel} task  The task to add
 * @param {Function} onSuccess  Optional callback when the task has been stored.
 *     A function called with the task as its argument.
 */
TaskListModel.prototype.addTask = function(task, onSuccess) {
	if (!(task instanceof TaskModel)) {
		throw Error("TaskListModel.addTask: Tried to add task not of type TaskModel");
	}
	Store.saveTask(task, onSuccess);
	this._task_list.push(task);
}

/**
 * Merge a given task into the list.
 * If it is entirely new it will be added.
 * If it is another version of an existing one then it will overwrite the existing one,
 * except for any local changes.
 * @param {TaskModel} task  The task to be merged.
 */
TaskListModel.prototype.mergeTask = function(task) {
	Mojo.Log.info("TaskListModel.mergeTask: Merging task " + task.toSummaryString());
	var task_index = this.getTaskIndex(task);
	if (task_index == -1 && task.needsPurging()) {
		Mojo.Log.info("TaskListModel.mergeTask: Task is new but won't add task as it needs purging");
	}
	else if (task_index == -1) {
		Mojo.Log.info("TaskListModel.mergeTask: Task is new and live so will add");
		this.addTask(task);
	}
	else {
		var existing_task = this._task_list[task_index];
		Mojo.Log.info("TaskListModel.mergeTask: Merging with " + existing_task.toSummaryString());
		task.takeLocalChanges(existing_task);
		task.localID = existing_task.localID;
		this._task_list[task_index] = task;
		Store.saveTask(task);
	}
}

/**
 * Merge several tasks into the list
 * @param {Array} task_list  An array of TaskModel objects, each of which is to be merged
 *     into this list.
 */
TaskListModel.prototype.mergeTaskList = function(task_list) {
	Mojo.Log.info("TaskListModel.mergeTaskList: Entering");
	for (var i = 0; i < task_list.length; i++) {
		this.mergeTask(task_list[i]);
	}
}

/**
 * Remove all those tasks that don't need to be shown.
 */
TaskListModel.prototype.purgeTaskList = function() {
	Mojo.Log.info("TaskListModel.purgeTaskList: Entering");
	var made_changes = false;
	for (var i = this._task_list.length-1; i >= 0; i--) {
		var task = this._task_list[i];
		Mojo.Log.info("TaskListModel.purgeTaskList: Considering purging task[" + i + "]: " + task.toSummaryString());
		if (task.needsPurging()) {
			// Need to purge this task
			this._task_list.splice(i, 1);
			Store.removeTask(task);
			Mojo.Log.info("TaskListModel.purgeTaskList: Purged task[" + i + "]: " + task.toSummaryString());
		}
	}
}

/**
 * Get a list of only those tasks that don't need to be shown.
 * @return  An array of TaskModel objects.
 */
TaskListModel.prototype.getListOfVisibleTasks = function() {
	var list = [];
	for (var i = 0; i < this._task_list.length; i++) {
		var task = this._task_list[i];
		if (!task.shouldNotBeVisible()) {
			list.push(task);
		}
	}
	return list;
}

TaskListModel.prototype.logTaskList = function() {
	Mojo.Log.info("TaskListModel.logTaskList: Entering");
	this._task_list.each(function(task_model) {
		Mojo.Log.info(task_model.toString());
	});
}

/**
 * Get an array of TaskModel objects which are all in the given taskseries.
 * @param {Object} spec  A hash specifying ths taskseries. Needs to have properties
 *     'listID' and 'taskseriesID'. 
 */
TaskListModel.prototype.getAllTasksInSeries = function(spec) {
	var list = [];
	for (var i = 0; i < this._task_list.length; i++) {
		var task = this._task_list[i];
		if (task.listID == spec.listID && task.taskseriesID == spec.taskseriesID) {
			list.push(task);
		}
	}
	return list;
}

/**
 * Mark for deletion all the tasks in the series specified.
 * @param {Object} spec  The specification of the taskseries to delete.
 *     A hash with properties listID and taskseriesID.
 */
TaskListModel.prototype.markAsDeletedAllTasksInSeries = function(spec) {
	Mojo.Log.info("TaskListModel.markAsDeletedAllTasksInSeries: Entering with listID=" + spec.listID + ", taskseriesID=" + spec.taskseriesID);
	for (var i = 0; i < this._task_list.length; i++) {
		var task = this._task_list[i];
		if (task.listID == spec.listID && task.taskseriesID == spec.taskseriesID) {
			task.setRecurrenceUserTextForPush('');
			task.setForPush('deleted', true);
			Mojo.Log.info("TaskListModel.markAsDeletedAllTasksInSeries: Marked " + task.toSummaryString());
		}
	}
}
