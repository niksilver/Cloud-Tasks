// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * Model of a task.
 * To introduce a new property, do the following:
 *   - Add it to the TaskModel properties in the constructor and toString().
 *   - In TaskListModel, ensure the property can be interpreted from a server response.
 *   - Ensure the property is saved in a cookie by updating TaskModel.toObject().
 *   - A change in the property is pushed out to the remote server.
 *   - The method to push out the property change is given a purpose for network monitoring.
 *   - Rendering of the task is updated, if applicable.
 *   - The Task UI is updated to show/edit the property.
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
		this.completed = properties.completed || false;
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
		+ "rrule: " + this.rrule + ", "
		+ "completed: " + this.completed + "}";
}

TaskModel.createFromObject = function(obj) {
	var task = new TaskModel(obj);
	return task;
}

TaskModel.prototype.toObject = function() {
	return {
		listID: this.listID,
		taskseriesID: this.taskseriesID,
		taskID: this.taskID,
		name: this.name,
		due: this.due,
		modified: this.modified,
		deleted: this.deleted,
		rrule: Utils.clone(this.rrule),
		localChanges: this.localChanges.clone(),
		completed: this.completed
	}
}

TaskModel.prototype.update = function() {
	this.isDueFlag = this.isDue();
	this.isOverdueFlag = this.isOverdue();
	this.hasRRuleFlag = this.isRecurring();
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

TaskModel.prototype.isRecurring = function() {
	if (!this.rrule) {
		return false;
	}
	
	if ((typeof this.rrule.every == 'undefined' || this.rrule.every === '')
			&& (typeof this.rrule['$t'] == 'undefined' || this.rrule['$t'] === '')) {
		return false;
	}
	else {
		return true;
	}
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

TaskModel.prototype.hasNoIDs = function() {
	return !this.listID && !this.taskseriesID && !this.taskID;
}

TaskModel.prototype.shouldNotBeVisible = function() {
	return this.deleted || this.completed;
}

TaskModel.prototype.restoreFromObject = function(obj) {
	for (var property in obj) {
		this[property] = obj[property];
	}
	this.update();
}
