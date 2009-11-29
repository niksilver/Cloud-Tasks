function TaskListModel() {
	this._remote_tasks;
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
	
	_remote_tasks.sort(TaskModel.sortDue);
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
 * @param {Array} tasklist  Array of tasks to be saved.
 */
TaskListModel.prototype.saveTaskList = function(tasklist) {
	var token_cookie = new Mojo.Model.Cookie('token');
	token_cookie.put(token);
}

TaskListModel.prototype.getToken = function(token) {
	var token_cookie = new Mojo.Model.Cookie('token');
	return token_cookie.get();
}
