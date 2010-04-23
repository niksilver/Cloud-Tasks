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
 * 
 * The rrule is either undefined (meaning no recurrence defined) or
 * a hash with the following properties:
 *   - every: 0 or 1, defined by the remote server
 *   - $t: recurrence description code, defined by the remote server
 *   - userText: String description of the recurrence rule as entered by the user
 *       and due to be sent to the remote server. So the empty string means no recurrence.
 *   - problem: Boolean true if the user text was set but the remote server interpreted
 *       it as a blank, indicating couldn't parse it. Otherwise is false or undefined.
 */

function TaskModel(properties) {
	if (properties) {
		this.localID = properties.localID;
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
	if (typeof this.localID === 'undefined') {
		this.localID = Utils.getNextID();
	}
	this.localChanges = (properties && properties.localChanges) || [];
	this.update();
}

TaskModel.prototype.toString = function() {
	return "TaskModel{localID: " + this.localID + ", "
		+ "listID: " + this.listID + ", "
		+ "taskseriesID: " + this.taskseriesID + ", "
		+ "taskID: " + this.taskID + ", "
		+ "name: '" + this.name + "', "
		+ "due: '" + this.due + "', "
		+ "deleted: " + this.deleted + ", "
		+ "rrule: " + this.rrule + ", "
		+ "completed: " + this.completed + "}";
}

TaskModel.prototype.toSummaryString = function() {
	return "TaskModel{" + this.localID + "/" + this.listID + "/" + this.taskseriesID + "/"
		+ this.taskID + "/" + this.name + "}";
}

TaskModel.createFromObject = function(obj) {
	var task = new TaskModel(obj);
	return task;
}

TaskModel.prototype.toObject = function() {
	return {
		localID: this.localID,
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
	this.hasRRuleProblemFlag = !!Utils.get(this, 'rrule', 'problem');
}

/**
 * See if the task has been synced with the remote server
 * (i.e. if it has a task ID).
 */
TaskModel.prototype.isSynced = function() {
	return !!this.taskID;
}

/**
 * Return the due date as a Date object relative to the current locale
 * but you should ignore the timezone.
 * For example, a due date of 2010-03-31T16:00:00Z will return
 * a Date object of 1 April 2010 in Perth (because Perth is timezone +0800).
 * Will return null if there is no due date.
 */
TaskModel.prototype.dueAsLocalDate = function() {
	return this.utcStringAsLocalDate(this.due);
}

/**
 * Return some UTC date string as a Date object relative to the current locale
 * but you should ignore the timezone.
 * For example, a due date of 2010-03-31T16:00:00Z will return
 * a Date object of 1 April 2010 in Perth (because Perth is timezone +0800).
 * Will return null if there is no due date.
 */
TaskModel.prototype.utcStringAsLocalDate = function(utc_string) {
	var date = Date.parse(utc_string);
	if (!date) {
		return null;
	}
	var timezone_offset = this.getTimezoneOffset(date);
	return date.add({ minutes: -1 * timezone_offset });
}

/**
 * Set the due date according to local time.
 * @param {Date} date  The due date in local time.
 */
TaskModel.prototype.setDueAsLocalDate = function(date) {
	var timezone_offset = this.getTimezoneOffset(date);
	var utc_date = date.clone().add({ minutes: timezone_offset });
	this.due = utc_date.toString("yyyy-MM-ddTHH:mm:ssZ");
}

TaskModel.prototype.utcStringDateFormatter = function(utc_string) {
	var utc_date = this.utcStringAsLocalDate(utc_string);
	if (utc_date == null) {
		return '';
	}
	
	// For safety around daylight savings, add 1 hour
	// For conformance and equality tests reset time to midnight
	//utc_date.add({ hours: 1 });
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

TaskModel.prototype.dueDateFormatter = function(){
	return this.utcStringDateFormatter(this.due);
}

/**
 * Get the timezone offset for a given date.
 * For London during summertime this is -60 (60 minutes west of the meridian),
 * for London during winter this is 0 (GMT),
 * for Perth on 1 April this is -480 (8 hours = 480 minutes west of the meridian),
 * etc.
 * Locations east of the meridian have +ve values.
 * Ordinarily this is just Javascript's own Date.getTimezoneOffset() function,
 * but by putting it here it can be overridden when testing the software
 * as if in different timezones.
 * @param {Date} date  The date whose timezone offset we want.
 */
TaskModel.prototype.getTimezoneOffset = function(date) {
	return date.getTimezoneOffset();
}

TaskModel.prototype.today = function() {
	return Date.today();
}

TaskModel.prototype.isDue = function() {
	var due_date = this.dueAsLocalDate();
	if (due_date == null) {
		return true;
	}
	if (due_date.isAfter(this.today())) {
		return false;
	}
	return true;
}

TaskModel.prototype.isOverdue = function() {
	var due_date = this.dueAsLocalDate();
	if (due_date == null) {
		return false;
	}
	return due_date.isBefore(this.today());
}

TaskModel.prototype.isRecurring = function() {
	if (!this.rrule) {
		return false;
	}
	
	if (typeof this.rrule.userText != 'undefined') {
		return (this.rrule.userText != '');
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
	if ((a.due || '') < (b.due || '')) { return -1; }
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
 * Additionally, the rrule userText and problem fields will only ever be
 * updated locally, so they will be copied across if they exist
 * (otherwise they would get overwritten, and we don't want that).
 * @param {TaskModel} other_task  The task which may have some local changes.
 */
TaskModel.prototype.takeLocalChanges = function(other_task) {
	for (var i = 0; i < other_task.localChanges.length; i++) {
		var property = other_task.localChanges[i];
		var value = other_task[property];
		this.setForPush(property, value);
	}
	
	// Copy over the rrule user text and problem fields.
	
	var other_user_text = Utils.get(other_task, 'rrule', 'userText');
	var other_problem = Utils.get(other_task, 'rrule', 'problem');
	if (other_user_text) {
		this.rrule = this.rrule || {};
		this.rrule.userText = other_user_text;
	}
	if (other_problem) {
		this.rrule = this.rrule || {};
		this.rrule.problem = other_problem;
	}
	
	this.update();
}

TaskModel.prototype.needsPurging = function() {
	return this.shouldNotBeVisible() && !this.hasLocalChanges();
}

TaskModel.prototype.hasNoIDs = function() {
	return !this.listID && !this.taskseriesID && !this.taskID;
}

TaskModel.prototype.shouldNotBeVisible = function() {
	// We can filter Nik's "Test 1" tasks listID 11122940 here
	return this.deleted || this.completed;
}

TaskModel.prototype.restoreFromObject = function(obj) {
	for (var property in obj) {
		this[property] = obj[property];
	}
	this.update();
}

/**
 * Get the text for the user to edit a recurrence rule.
 */
TaskModel.prototype.getRecurrenceEditText = function() {
	if (Utils.get(this.rrule, 'problem')) {
		return this.rrule.userText;
	}
	else if (!this.recurrenceUserTextIsSynced()) {
		return Utils.get(this.rrule , 'userText') || '';
	}
	else if (this.isRecurring()) {
		return RecurrenceTranslator.toText(this.rrule);
	}
	else {
		return '';
	}
}

/**
 * See if the recurrence user text has synced with the remote server.
 */
TaskModel.prototype.recurrenceUserTextIsSynced = function() {
	return !!Utils.get(this.rrule, '$t');
}

/**
 * Set the user-defined text to describe a recurrence rule.
 * E.g. "Every weekday". Empty string means no recurrence.
 * @param {String} user_text  The text describing the recurrence
 */
TaskModel.prototype.setRecurrenceUserTextForPush = function(user_text) {
	if (typeof this.rrule !== 'object') {
		this.rrule = {};
	}
	if (this.rrule.userText == user_text) {
		// User text not changed
		return;
	}
	this.rrule.userText = user_text;
	this.rrule.every = undefined;
	this.rrule['$t'] = undefined;
	this.rrule.problem = false;
	this.setForPush('rrule', this.rrule);
}

/**
 * Take a response from pushing an rrule and set this tasks rrule
 * properties accordingly.
 * @param {Object} response  The rrule object from the server's JSON response.
 */
TaskModel.prototype.handleRRuleResponse = function(rrule_response) {
	if (!rrule_response && Utils.get(this, 'rrule', 'userText')) {
		// The user has set up an rrule but the server says no
		Mojo.Log.info("TaskModel.handleRRuleResponse: Server does not recognise user text");
		this.rrule.problem = true;
		return;
	}
	
	// Server's response, if any, is in line with user text
	
	if (!rrule_response) {
		Mojo.Log.info("TaskModel.handleRRuleResponse: Got no recurrence object, which is fine");
		return;
	}
	if (!this.rrule) {
		this.rrule = {};
	}
	Mojo.Log.info("TaskModel.handleRRuleResponse: Server has returned recurrence object");
	this.rrule['every'] = rrule_response['every'];
	this.rrule['$t'] = rrule_response['$t'];
	this.rrule['problem'] = false;
}
