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
		var taskseries_array = Object.isArray(list_obj.taskseries) ? list_obj.taskseries : [list_obj.taskseries];
		taskseries_array.each(function(taskseries_obj) {
			var taskseries_id = taskseries_obj.id;
			var name = taskseries_obj.name;
			var task_obj = taskseries_obj.task;
			var task_id = task_obj.id;
			var due = task_obj.due;
			var modified = taskseries_obj.modified;
			var task = new TaskModel({
				listID: list_id,
				taskseriesID: taskseries_id,
				taskID: task_id,
				name: name,
				due: due,
				modified: modified
			});
			task.update();
			task_list.push(task);
		});

	});
	
	task_list.sort(TaskModel.sortByDueThenName);
	return task_list;
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
	
	for (i = 0; i < num_tasks; i++) {
		var task_cookie = new Mojo.Model.Cookie('task' + i);
		var task = this._task_list[i];
		task_cookie.put(task.toObject());
	}
	var task_cookie = new Mojo.Model.Cookie('task' + i);
	task_cookie.remove();
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
