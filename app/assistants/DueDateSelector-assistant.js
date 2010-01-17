// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

/**
 * @param {Object} config  Has the following parameters:
 *   - task
 *   - controller
 *   - updateTaskDueDisplayFromTask  Function to change the task due display, given the task
 *   - closeDueDateSelectorDialog  Function to close the dialog.
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
	
	var selected_date = this.task.due ? Date.parse(this.task.due) : '';
	this.grid = new CalendarGrid({
		month: selected_date || Date.today(),
		firstDay: 1,
		selected: selected_date
	});
}

DueDateSelectorAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	/* setup widgets here */
	/* add event handlers to listen to events from widgets */
	
	Mojo.Log.info("DueDateSelectorAssistant.setup: Entering");

	this.fillCalendarGrid();
	this.setUpCalendarGridListeners();
	
	var no_due_date_model = {
		label: "No date"
	};
	this.controller.setupWidget('NoDueDate', {}, no_due_date_model);
	this.controller.listen('NoDueDate', Mojo.Event.tap, this.handleNoDueDateEvent.bind(this));
}

DueDateSelectorAssistant.prototype.fillCalendarGrid = function() {
	this.controller.get('month-name').update(this.grid.getMonthAndYear());

	for (var day = 0; day <= 6; day++) {
		this.controller.get('day' + day).update(this.grid.getDayOfWeekLetter(day));
	}
	
	for (var row = 0; row <= 5; row++) {
		for (var col = 0; col <= 6; col++) {
			var cell = 	this.controller.get('c' + row + col);
			var grid_data = this.grid.get(row, col);
			cell.update(grid_data.dayOfMonth);
			this.addOrRemoveClassName(cell, !grid_data.isInMonth, 'date-not-in-month');
			this.addOrRemoveClassName(cell, grid_data.isSelected, 'date-is-selected');
			this.addOrRemoveClassName(cell, grid_data.isWeekend, 'date-is-weekend');
			this.addOrRemoveClassName(cell, grid_data.isToday, 'date-is-today');
			if (grid_data.isSelected) {
				this.selectedCell = cell;
			}
		}
	}
}

DueDateSelectorAssistant.prototype.addOrRemoveClassName = function(element, condition, className) {
	if (condition) {
		element.addClassName(className);
	}
	else {
		element.removeClassName(className);
	}
}

DueDateSelectorAssistant.prototype.setUpCalendarGridListeners = function() {
	this.controller.listen('month-back', Mojo.Event.tap, this.handleMonthBackEvent.bind(this));
	this.controller.listen('month-forward', Mojo.Event.tap, this.handleMonthForwardEvent.bind(this));

	for (var row = 0; row <= 5; row++) {
		for (var col = 0; col <= 6; col++) {
			this.controller.listen('c' + row + col, Mojo.Event.tap, this.handleCellTapEvent.bind(this));
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

DueDateSelectorAssistant.prototype.handleCellTapEvent = function(event) {
	Mojo.Log.info("DueDateSelectorAssistant.handleCellTapEvent: Entering");

	this.removeHighlightFromPreviouslySelectedCell();
	
	// Now work out what date the user has selected

	var src = event.srcElement;
	src.addClassName('date-is-selected');
	var row = parseInt(src.id.substr(1, 1));
	var col = parseInt(src.id.substr(2, 1));
	Mojo.Log.info("DueDateSelectorAssistant.handleCellTapEvent: Got tap event on cell " + row + ", " + col);
	var date = this.grid.get(row, col).date;
	var date_str = date.toISOString();
	Mojo.Log.info("DueDateSelectorAssistant.handleCellTapEvent: Setting date " + date_str);
	this.task.setForPush('due', date_str);
	this.config.updateTaskDueDisplayFromTask(this.task);
	this.config.closeDueDateSelectorDialog();
}

DueDateSelectorAssistant.prototype.removeHighlightFromPreviouslySelectedCell = function() {
	if (this.selectedCell) {
		this.selectedCell.removeClassName('date-is-selected');
	}
}

DueDateSelectorAssistant.prototype.handleNoDueDateEvent = function(event) {
	this.removeHighlightFromPreviouslySelectedCell();
	this.task.setForPush('due', '');
	this.config.updateTaskDueDisplayFromTask(this.task);
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
