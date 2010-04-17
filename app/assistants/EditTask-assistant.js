// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

function EditTaskAssistant(config) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */

	Mojo.Log.info("EditTaskAssistant: Entering constructor");
	
	// this.config has properties
	//   - rtm
	//   - taskListModel
	//   - task
	//   - isNew (boolean)
	this.config = config;
	this.savedTaskProperties = this.config.task.toObject();
	this.recurrenceModel = { text: this.config.task.getRecurrenceEditText() };
}

EditTaskAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	
	var task_name_attributes = {
		modelProperty: 'name',
		hintText: 'Enter task name',
		multiline: true,
		autoFocus: true,
		enterSubmits: true,
		requiresEnterKey: true
	};
	this.controller.setupWidget('TaskName', task_name_attributes, this.config.task);
	this.controller.listen('TaskName', Mojo.Event.propertyChange, this.handleTaskNameEvent.bind(this));
	
	this.setUpDueWidget();
	
	this.setUpRecurrenceWidget();
	this.showRecurrenceNoteAsNeeded();
	
	var delete_task_model = {
		buttonClass : 'negative',
		label: "Delete"
	};
	this.controller.setupWidget('DeleteTask', {}, delete_task_model);
	this.controller.listen('DeleteTask', Mojo.Event.tap, this.handleDeleteTaskEvent.bind(this));
	
	var complete_task_model = {
		buttonClass : 'affirmative',
		label: "Complete"
	};
	this.controller.setupWidget('CompleteTask', {}, complete_task_model);
	this.controller.listen('CompleteTask', Mojo.Event.tap, this.handleCompleteTaskEvent.bind(this));
	
	var cancel_task_model = {
		buttonClass : 'dismissal',
		label: "Cancel"
	};
	this.controller.setupWidget('CancelTask', {}, cancel_task_model);
	this.controller.listen('CancelTask', Mojo.Event.tap, this.handleCancelTaskEvent.bind(this));

	this.setVisibilityOfButtons();
}

EditTaskAssistant.prototype.setUpDueWidget = function() {
	this.controller.listen('TaskDueDisplay', Mojo.Event.tap, this.handleDueDateSelectorEvent.bind(this));
}

EditTaskAssistant.prototype.setUpRecurrenceWidget = function() {
	var recurrence_attributes = {
		modelProperty: 'text',
		multiline: true,
		enterSubmits: true,
		autoFocus: false
	};
	this.controller.setupWidget('TaskRecurrenceField', recurrence_attributes, this.recurrenceModel);
	this.controller.listen('TaskRecurrenceField', Mojo.Event.propertyChange, this.handleRecurrenceFieldEvent.bind(this));
	Mojo.Event.listenForFocusChanges(this.controller.get('TaskRecurrenceField'), this.handleRecurrenceFieldFocusChange.bind(this));
}

EditTaskAssistant.prototype.showRecurrenceNoteAsNeeded = function() {
	Mojo.Log.info("EditTaskAssistant.showRecurrenceNoteAsNeeded: Entering");
	if (this.recurrenceModel.text == '') {
		this.setVisibleById('TaskRecurrenceNote', true);
		this.setVisibleById('TaskRecurrenceNote-instructions', true);
		this.setVisibleById('TaskRecurrenceNote-warning', false);
	}
	else if (Utils.get(this.config.task, 'rrule', 'problem')) {
		this.setVisibleById('TaskRecurrenceNote', true);
		this.setVisibleById('TaskRecurrenceNote-instructions', false);
		this.setVisibleById('TaskRecurrenceNote-warning', true);
	}
	else {
		this.setVisibleById('TaskRecurrenceNote', false);
	}
}

EditTaskAssistant.prototype.setVisibleById = function(element_id, is_visible) {
	this.controller.get(element_id).setStyle({
		display: (is_visible ? 'inline' : 'none')
	});
}

EditTaskAssistant.prototype.handleTaskNameEvent = function(event) {
	Mojo.Log.info("EditTaskAssistant.handleTaskNameEvent: Entering");
	Mojo.Log.info("EditTaskAssistant.handleTaskNameEvent: Task name is '" + this.config.task.name + "'");
	this.config.task.setForPush('name', this.config.task.name);
}

EditTaskAssistant.prototype.handleDueDateSelectorEvent = function(event) {
	Mojo.Log.info("EditTaskAssistant.handleDueDateSelectorEvent: Entering");
	this.dueDateSelectorDialog = this.controller.showDialog({
		template: 'EditTask/DueDateSelector-dialog',
		assistant: new DueDateSelectorAssistant({
				task: this.config.task,
				controller: this.controller,
				updateTaskDueDisplayFromTask: this.updateTaskDueDisplayFromTask.bind(this),
				closeDueDateSelectorDialog: this.closeDueDateSelectorDialog.bind(this)
			}),
		myTestParam: 'This is my parameter'
	});
}

EditTaskAssistant.prototype.closeDueDateSelectorDialog = function() {
	this.dueDateSelectorDialog.mojo.close();
}

EditTaskAssistant.prototype.handleRecurrenceFieldEvent = function(event) {
	Mojo.Log.info("EditTaskAssistant.handleRecurrenceFieldEvent: Entering");
	this.config.task.setRecurrenceUserTextForPush(this.recurrenceModel.text);
	this.showRecurrenceNoteAsNeeded();
}

EditTaskAssistant.prototype.handleRecurrenceFieldFocusChange = function(node) {
	Mojo.Log.info("EditTaskAssistant.prototype.handleRecurrenceFieldFocusChange: Entering");
	if (node) {
		this.setVisibleById('TaskRecurrenceNote', false);
	}
	else {
		this.showRecurrenceNoteAsNeeded();
	}
}

EditTaskAssistant.prototype.handleDeleteTaskEvent = function(event) {
	Mojo.Log.info("EditTaskAssistant.handleDeleteTaskEvent: Entering");
	var choices;
	// Deleting all tasks in a series is only useful if the task is
	// recurring and it's been synced with the remote server and hence
	// is part of an identifiable series.
	if (this.config.task.isRecurring() && this.config.task.isSynced()) {
		choices = [
			{ label: "Delete just this",     value: 'one',  type: 'negative' },
			{ label: "Delete entire series", value: 'all',  type: 'negative' },
			{ label: "Cancel",               value: 'none', type: 'dismiss' }
		];
	}
	else {
		choices = [
			{ label: "Delete", value: 'one', type: 'negative' },
			{ label: "Cancel", value: 'none', type: 'dismiss' }
		]
	}
	this.controller.showAlertDialog({
		onChoose: this.handleDeleteTaskConfirmation.bind(this),
		title: "Are you sure?",
		choices: choices
	});
}

/**
 * Handle confirmation (or not) of deleting a task.
 * @param {String} choice  Values 'one' (for just this task), 'all' (for all
 *     tasks in a series) or 'none' (for not deleting anything).
 */
EditTaskAssistant.prototype.handleDeleteTaskConfirmation = function(choice) {
	Mojo.Log.info("EditTaskAssistant.handleDeleteTaskConfirmation: Entering");
	var task = this.config.task;
	if (choice == 'one') {
		Mojo.Log.info("EditTaskAssistant.handleDeleteTaskConfirmation: Confirmed deletion of one");
		task.setForPush('deleted', true);
		this.popScene(false); // Wasn't cancelled (i.e. false)
	}
	else if (choice == 'all'){
		Mojo.Log.info("EditTaskAssistant.handleDeleteTaskConfirmation: Confirmed deletion of all in series");
		var marked_tasks = this.config.taskListModel.markAsDeletedAllTasksInSeries({
			listID: task.listID,
			taskseriesID: task.taskseriesID
		});
		this.popScene(false, marked_tasks); // Wasn't cancelled (i.e. false)
	}
}

EditTaskAssistant.prototype.handleCompleteTaskEvent = function(event){
	Mojo.Log.info("EditTaskAssistant.handleCompleteTaskEvent: Entering");
	this.config.task.setForPush('completed', true);
	this.popScene(false); // Wasn't cancelled (i.e. false)
}

EditTaskAssistant.prototype.handleCancelTaskEvent = function(event){
	Mojo.Log.info("EditTaskAssistant.handleCancelTaskEvent: Entering");
	this.config.task.restoreFromObject(this.savedTaskProperties);
	this.popScene(true); // Was cancelled (i.e. true)
}

EditTaskAssistant.prototype.handleCommand = function(event){
	Mojo.Log.info("EditTaskAssistant.handleCommand: Entering");
	if (event.type == Mojo.Event.back) {
		Mojo.Log.info("TaskListAssistant.handleCommand: Got back event");
		this.popScene(false); // Wasn't cancelled (i.e. false)
	}
}

EditTaskAssistant.prototype.popScene = function(wasCancelled, tasks_marked_for_deletion) {
	Mojo.Log.info("EditTaskAssistant.popScene: Entering");
	if (this.config.task.name == '') {
		// Don't allow a blank name to be entered
		this.config.task.name = this.savedTaskProperties.name;
	}
	this.config.task.update();
	Mojo.Controller.stageController.popScene({
		lastScene: 'EditTask',
		task: this.config.task,
		isNew: this.config.isNew,
		wasCancelled: wasCancelled,
		tasksMarkedForDeletion: tasks_marked_for_deletion
	});
}

EditTaskAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

	this.updateTaskDueDisplayFromTask(this.config.task);
	// this.updateTaskRecurrenceDisplay();
	//this.controller.get('TaskName').mojo.focus(); // TEST ONLY
}

EditTaskAssistant.prototype.updateTaskDueDisplayFromTask = function(task) {
	Mojo.Log.info("EditTaskAssistant.updateTaskDueDisplayFromTask: Entering");
	var due_text;
	var due_date = task.dueAsLocalDate();
	if (due_date) {
		due_text = due_date.toString('ddd d MMMM yyyy');
	}
	else {
		due_text = 'No due date';
	}
	Mojo.Log.info("EditTaskAssistant.updateTaskDueDisplayFromTask: Due text is " + due_text);
	var element = this.controller.get('TaskDueDisplay');
	element.update(due_text);
	this.addOrRemoveClassName(element, !due_date, 'has-no-due-date');
}

EditTaskAssistant.prototype.addOrRemoveClassName = function(element, condition, className) {
	if (condition) {
		element.addClassName(className);
	}
	else {
		element.removeClassName(className);
	}
}

EditTaskAssistant.prototype.setVisibilityOfButtons = function() {
	if (this.config.isNew) {
		this.controller.get('DeleteTask').setStyle({ display: 'none' });
		this.controller.get('CancelTask').setStyle({ display: 'inline' });
		this.controller.get('CompleteTask').setStyle({ display: 'none' });
	}
	else {
		this.controller.get('CompleteTask').setStyle({ display: 'inline' });
		this.controller.get('CancelTask').setStyle({ display: 'inline' });
		this.controller.get('DeleteTask').setStyle({ display: 'inline' });
	}
}

EditTaskAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

EditTaskAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
