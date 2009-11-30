function TaskListModel() {
	this._remote_tasks;
	this._task_list = [];
}

TaskListModel.prototype.setTaskList = function(task_list) {
	this._task_list = task_list;
}

TaskListModel.prototype.getTaskList = function(task_list) {
	return this._task_list;
}

TaskListModel.prototype.setRemoteJSON = function(remote_json) {
	this._remote_tasks = [];
	var _remote_tasks = this._remote_tasks;
	var tasks_obj = remote_json.rsp.tasks;
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
			var task = new TaskModel({
				listID: list_id,
				taskseriesID: taskseries_id,
				taskID: task_id,
				name: name,
				due: due
			});
			task.update();
			_remote_tasks.push(task);
		});

	});
	
	_remote_tasks.sort(TaskModel.sortByDueThenName);
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

TaskListModel.prototype.getRemoteTasks = function() {
	return this._remote_tasks;
}

/**
 * Save the task list into the database.
 * @param {Array} task_list  Array of tasks to be saved.
 */
TaskListModel.prototype.saveTaskList = function() {
	var i;
	for (i = 0; i < this._task_list.length; i++) {
		var task_cookie = new Mojo.Model.Cookie('task_' + i);
		task_cookie.put(this._task_list[i]);
	}
	var task_cookie = new Mojo.Model.Cookie('task_' + i);
	task_cookie.remove();
}

TaskListModel.prototype.loadTaskList = function() {
	this._task_list = [];
	var i = -1;
	var task_cookie_value;
	do {
		i++;
		var task_cookie = new Mojo.Model.Cookie('task_' + i);
		task_cookie_value = task_cookie.get();
		if (task_cookie_value) {
			this._task_list.push(task_cookie_value);
		}
	} while (task_cookie_value);
}
