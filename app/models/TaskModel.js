function TaskModel(properties) {
	if (properties) {
		this.list_id = properties.list_id;
		this.taskseries_id = properties.taskseries_id;
		this.task_id = properties.task_id;
		this.name = properties.name;
		this.due = properties.due;
	}
}

TaskModel.prototype.update = function() {
	this.is_due = this.isDue();
	this.is_overdue = this.isOverdue();
}

TaskModel.prototype.today = function() {
	return Date.today();
}

TaskModel.prototype.isDue = function() {
	var due_date = Date.parse(this.due);
	if (due_date == null) {
		return true;
	}
	if (due_date.isAfter(this.today())) {
		return false;
	}
	return true;
}

TaskModel.prototype.isOverdue = function() {
	var due_date = Date.parse(this.due);
	if (due_date == null) {
		return false;
	}
	return due_date.isBefore(this.today());
}

TaskModel.sortDue = function(a, b) {
	if (a.due == b.due) { return 0; }
	if (a.due < b.due) { return -1; }
	return 1;
};