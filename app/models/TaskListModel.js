function TaskListModel() {
	this._remote_tasks;
}

TaskListModel.prototype.setRemoteJSON = function(remote_json) {
	this._remote_tasks = [];
	var _remote_tasks = this._remote_tasks;
	var tasks_obj = remote_json.rsp.tasks;
	var list_array = Object.isArray(tasks_obj.list) ? tasks_obj.list : [tasks_obj.list];
	var inst = this;
	list_array.each(function(list_obj) {
		var list_id = list_obj.id;
		var taskseries_array = Object.isArray(list_obj.taskseries) ? list_obj.taskseries : [list_obj.taskseries];
		taskseries_array.each(function(taskseries_obj) {
			var taskseries_id = taskseries_obj.id;
			var name = taskseries_obj.name;
			var task_obj = taskseries_obj.task;
			var task_id = task_obj.id;
			var due = task_obj.due;
			_remote_tasks.push({
				list_id: list_id,
				taskseries_id: taskseries_id,
				task_id: task_id,
				name: name,
				due: due
			});
		});

	});
	
	_remote_tasks.sort(function(a, b) {
		if (a == b) { return 0; }
		if (a < b) { return -1; }
		return 1;
	});
}

TaskListModel.prototype.getRemoteTasks = function() {
	return this._remote_tasks;
}

TaskListModel.prototype.today = function(){
	return Date.today(); // Midnight today
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

	return utc_date.toString('ddd d MMM yyyy');
}
