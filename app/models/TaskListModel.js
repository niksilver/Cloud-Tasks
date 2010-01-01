/**
 * Construct an empty task list or (if argument supplied) with a list of tasks set up.
 * @param {Object} optional_task_list  Optional array of TaskModel objects which is to be task list
 */
function TaskListModel(optional_task_list) {
	this._task_list = optional_task_list || [];
}

/**
 * Set the task list.
 * @param {Array} task_list  Should be an array of TaskModel objects.
 */
TaskListModel.prototype.setTaskList = function(task_list) {
	task_list.each(function(task) {
		if (!(task instanceof TaskModel)) {
			throw new Error("TaskListModel.setTaskList needs an array of TaskModel objects");
		}
	});
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
		var rrule = Object.clone(taskseries_obj.rrule);
		var task = new TaskModel({
			listID: list_id,
			taskseriesID: taskseries_id,
			taskID: task_id,
			name: name,
			due: due,
			modified: modified,
			deleted: deleted,
			rrule: rrule
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
		return 'None';
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
 * Save the task list into the database.
 * @param {Array} task_list  Array of tasks to be saved.
 */
TaskListModel.prototype.saveTaskList = function() {
	var i;
	var num_tasks = this._task_list.length;
	
	// Save the list
	for (i = 0; i < num_tasks; i++) {
		var task_cookie = new Mojo.Model.Cookie('task' + i);
		var task = this._task_list[i];
		task_cookie.put(task.toObject());
	}
	
	// Put an end-of-list marker, and clean up any extra cookies
	var min_cleanup_index = i;
	var max_cleanup_index = i;
	if (this._previous_saved_length - 1 > max_cleanup_index) {
		max_cleanup_index = this._previous_saved_length - 1;
	}
	for (var i = min_cleanup_index; i <= max_cleanup_index; i++) {
		var task_cookie = new Mojo.Model.Cookie('task' + i);
		task_cookie.remove();
	}
	
	this._previous_saved_length = num_tasks;
}

TaskListModel.prototype.loadTaskList = function() {
	this._task_list = [];
	var i = -1;
	var task_cookie_value;
	do {
		i++;
		var task_cookie = new Mojo.Model.Cookie('task' + i);
		task_cookie_value = task_cookie.get();
		if (task_cookie_value) {
			var task = TaskModel.createFromObject(task_cookie_value);
			this._task_list.push(task);
		}
	} while (task_cookie_value);
}

TaskListModel.prototype.eraseTaskList = function() {
	this.setTaskList([]);
	this.saveTaskList();
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
 * Merge a given task into the list.
 * If it is entirely new it will be added.
 * If it is another version of an existing one then it will overwrite the existing one,
 * except for any local changes.
 * @param {TaskModel} task  The task to be merged.
 */
TaskListModel.prototype.mergeTask = function(task) {
	Mojo.Log.info("TaskListModel.mergeTask: Merging task " + task);
	var task_index = this.getTaskIndex(task);
	if (task_index == -1) {
		Mojo.Log.info("TaskListModel.mergeTask: Task is new");
		this._task_list.push(task);
	}
	else {
		Mojo.Log.info("TaskListModel.mergeTask: Merging with " + this._task_list[task_index]);
		task.takeLocalChanges(this._task_list[task_index]);
		this._task_list[task_index] = task;
	}
}

/**
 * Merge several tasks into the list
 * @param {Array} task_list  An array of TaskModel objects, each of which is to be merged
 *     into this list.
 */
TaskListModel.prototype.mergeTaskList = function(task_list) {
	for (var i = 0; i < task_list.length; i++) {
		this.mergeTask(task_list[i]);
	}
}

/**
 * Remove all those tasks that don't need to be shown
 */
TaskListModel.prototype.purgeTaskList = function() {
	Mojo.Log.info("TaskListModel.purgeTaskList: Entering");
	for (var i = this._task_list.length-1; i >= 0; i--) {
		var task = this._task_list[i];
		if (task.deleted && !task.hasLocalChanges()) {
			// Need to purge this task
			var task_str = task.toString();
			Mojo.Log.info("TaskListModel.purgeTaskList: Purging " + task_str);
			this._task_list.splice(i, 1);
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
		if (!task.deleted) {
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
