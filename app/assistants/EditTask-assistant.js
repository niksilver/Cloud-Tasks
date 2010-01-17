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

EditTaskAssistant.prototype.handleDeleteTaskEvent = function(event) {
	Mojo.Log.info("EditTaskAssistant.handleDeleteTaskEvent: Entering");
	var choices;
	if (this.config.task.isRecurring()) {
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
		this.popScene(false);
	}
	else if (choice == 'all'){
		Mojo.Log.info("EditTaskAssistant.handleDeleteTaskConfirmation: Confirmed deletion of all in series");
		this.config.taskListModel.markAsDeletedAllTasksInSeries({
			listID: task.listID,
			taskseriesID: task.taskSeriesID
		});
		this.popScene(false);
	}
}

EditTaskAssistant.prototype.handleCompleteTaskEvent = function(event){
	Mojo.Log.info("EditTaskAssistant.handleCompleteTaskEvent: Entering");
	this.config.task.setForPush('completed', true);
	this.popScene(false);
}

EditTaskAssistant.prototype.handleCancelTaskEvent = function(event){
	Mojo.Log.info("EditTaskAssistant.handleCancelTaskEvent: Entering");
	this.config.task.restoreFromObject(this.savedTaskProperties);
	this.popScene(true);
}

EditTaskAssistant.prototype.handleCommand = function(event){
	Mojo.Log.info("EditTaskAssistant.handleCommand: Entering");
	if (event.type == Mojo.Event.back) {
		Mojo.Log.info("TaskListAssistant.handleCommand: Got back event");
		this.popScene(false);
	}
}

EditTaskAssistant.prototype.popScene = function(wasCancelled) {
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
		wasCancelled: wasCancelled
	});
}

EditTaskAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

	this.updateTaskDueDisplayFromTask(this.config.task);
}

EditTaskAssistant.prototype.updateTaskDueDisplayFromTask = function(task) {
	Mojo.Log.info("EditTaskAssistant.updateTaskDueDisplayFromTask: Entering");
	var due_text;
	if (task.due) {
		due_text = Date.parse(task.due).toString('ddd d MMMM yyyy');
	}
	else {
		due_text = 'No due date';
	}
	Mojo.Log.info("EditTaskAssistant.updateTaskDueDisplayFromTask: Due text is " + due_text);
	this.controller.get('TaskDueDisplay').update(due_text);
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
