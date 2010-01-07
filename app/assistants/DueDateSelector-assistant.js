/**
 * @param {Object} config  Has the following parameters:
 *   - task
 *   - controller
 *   - updateTaskDueDisplayFromTask
 *   - closeDueDateSelectorDialog
 */
function DueDateSelectorAssistant(config) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	Mojo.Log.info("DueDateSelectorAssistant: Entering");
	
	this.config = config;
	this.task = config.task;
	this.controller = config.controller;
	this.dueDateModel = { date: Date.parse(this.config.task.due) };
	this.grid = new CalendarGrid({
		month: this.dueDateModel.date,
		firstDay: 1
	});
}

DueDateSelectorAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	/* setup widgets here */
	/* add event handlers to listen to events from widgets */
	
	Mojo.Log.info("DueDateSelectorAssistant.setup: Entering");

	var task_due_attributes = {
		modelProperty: 'date'
	};
	this.controller.setupWidget('TaskDue', task_due_attributes, this.dueDateModel);
	this.controller.listen('TaskDue', Mojo.Event.propertyChange, this.handleTaskDueEvent.bind(this));
	
	this.fillCalendarGrid();
	this.setUpCalendarGridListeners();
}

DueDateSelectorAssistant.prototype.handleTaskDueEvent = function(event) {
	Mojo.Log.info("DueDateSelectorAssistant.handleTaskDueEvent: Entering");
	
	var date_str = this.dueDateModel.date.toISOString();
	Mojo.Log.info("DueDateSelectorAssistant.handleTaskDueEvent: Task due date is '" + this.dueDateModel.date
		+ "', parsed as '" + date_str + "'");
	this.task.setForPush('due', date_str);
	this.config.updateTaskDueDisplayFromTask(this.config.task);
}

DueDateSelectorAssistant.prototype.fillCalendarGrid = function() {
	this.controller.get('month-name').update(this.grid.getMonthAndYear());

	for (var day = 0; day <= 6; day++) {
		this.controller.get('day' + day).update(this.grid.getDayOfWeekLetter(day));
	}
	
	for (var row = 0; row <= 5; row++) {
		for (var col = 0; col <= 6; col++) {
			this.controller.get('c' + row + col).update(this.grid.get(row, col));
		}
	}
}

DueDateSelectorAssistant.prototype.setUpCalendarGridListeners = function() {
	this.controller.listen('month-back', Mojo.Event.tap, this.handleMonthBackEvent.bind(this));
	this.controller.listen('month-forward', Mojo.Event.tap, this.handleMonthForwardEvent.bind(this));

	for (var row = 0; row <= 5; row++) {
		for (var col = 0; col <= 6; col++) {
			this.controller.listen('c' + row + col, Mojo.Event.tap, this.handleCellEvent.bind(this));
		}
	}
	
}

DueDateSelectorAssistant.prototype.handleMonthBackEvent = function(event) {
	this.grid = this.grid.getPrevious();
	this.fillCalendarGrid();
}

DueDateSelectorAssistant.prototype.handleMonthForwardEvent = function(event) {
	this.grid = this.grid.getNext();
	this.fillCalendarGrid();
}

DueDateSelectorAssistant.prototype.handleCellEvent = function(event) {
	Mojo.Log.info("DueDateSelectorAssistant.handleCellEvent: Entering");

	var src = event.srcElement;
	var row = parseInt(src.id.substr(1, 1));
	var col = parseInt(src.id.substr(2, 1));
	Mojo.Log.info("DueDateSelectorAssistant.handleCellEvent: Got tap event on cell " + row + ", " + col);
	var date = this.grid.getDate(row, col);
	var date_str = date.toISOString();
	Mojo.Log.info("DueDateSelectorAssistant.handleCellEvent: Setting date " + date_str);
	this.task.setForPush('due', date_str);
	this.config.updateTaskDueDisplayFromTask(this.config.task);
	this.config.closeDueDateSelectorDialog();
}

DueDateSelectorAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


DueDateSelectorAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

DueDateSelectorAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
