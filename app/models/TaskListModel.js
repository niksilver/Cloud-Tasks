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
			_remote_tasks.push({
				list_id: list_id,
				taskseries_id: taskseries_id,
				task_id: task_id,
				name: name,
				due: due
			});
		});

	});
}

TaskListModel.prototype.getRemoteTasks = function() {
	return this._remote_tasks;
}
