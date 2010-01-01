/**
 * Model of a task.
 * To introduce a new property, do the following:
 *   - Add it to the TaskModel properties in the constructor and toString().
 *   - In TaskListModel, ensure the property can be interpreted from a server response.
 *   - Rendering of the task is updated, if applicable.
 *   - The Task UI is updated to show/edit the property.
 *   - A change in the property is pushed out to the remote server.
 *   - The method to push out the property change is given a purpose for network monitoring.
 */

function TaskModel(properties) {
	if (properties) {
		this.listID = properties.listID;
		this.taskseriesID = properties.taskseriesID;
		this.taskID = properties.taskID;
		this.name = properties.name;
		this.due = properties.due;
		this.modified = properties.modified;
		this.deleted = properties.deleted || false;
		this.rrule = properties.rrule;
	}
	this.localChanges = (properties && properties.localChanges) || [];
	this.update();
}

TaskModel.prototype.toString = function() {
	return "TaskModel{listID: " + this.listID + ", "
		+ "taskseriesID: " + this.taskseriesID + ", "
		+ "taskID: " + this.taskID + ", "
		+ "name: '" + this.name + "', "
		+ "due: '" + this.due + "', "
		+ "deleted: " + this.deleted + ", "
		+ "rrule: " + this.rrule + "}";
}

TaskModel.createFromObject = function(obj) {
	var task = new TaskModel(obj);
	if (obj.localChanges) {
		obj.localChanges.each(function(property_name) {
			task.setForPush(property_name, obj[property_name]);
		})
	}
	return task;
}

TaskModel.prototype.toObject = function() {
	return {
		listID: this.listID,
		taskseriesID: this.taskseriesID,
		taskID: this.taskID,
		name: this.name,
		due: this.due,
		localChanges: this.localChanges.clone()
	}
}

TaskModel.prototype.update = function() {
	this.isDueFlag = this.isDue();
	this.isOverdueFlag = this.isOverdue();
	this.hasRRule = (typeof this.rrule !== 'undefined')
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

TaskModel.sortByDueThenName = function(a, b) {
	if (a.due == b.due) { return TaskModel.sortByName(a, b); }
	if (a.due < b.due) { return -1; }
	return 1;
};

TaskModel.sortByName = function(a, b) {
	if (a.name == b.name) { return 0; }
	if (a.name < b.name) { return -1; }
	return 1;
};

/**
 * Set a property in the task which we want to be pushed to
 * the remote server.
 * @param {Object} property  The property name (e.g. 'due' or 'name').
 * @param {Object} value  The value the property should be.
 */
TaskModel.prototype.setForPush = function(property, value) {
	this[property] = value;
	if (this.localChanges.indexOf(property) == -1) {
		this.localChanges.push(property);
	}
}

TaskModel.prototype.markNotForPush = function(property) {
	var i = this.localChanges.indexOf(property);
	if (i >= 0) {
		this.localChanges.splice(i, 1);
	}
}

TaskModel.prototype.hasLocalChanges = function() {
	return (this.localChanges.length > 0);
}

TaskModel.prototype.hasLocalChangeOf = function(property) {
	return (this.localChanges.indexOf(property) >= 0);
}

/**
 * Take any local changes made in another task.
 * They will also then be flagged as local changes in this.
 * @param {TaskModel} other_task  The task which may have some local changes.
 */
TaskModel.prototype.takeLocalChanges = function(other_task) {
	for (var i = 0; i < other_task.localChanges.length; i++) {
		var property = other_task.localChanges[i];
		this.setForPush(property, other_task[property]);
	}
}
