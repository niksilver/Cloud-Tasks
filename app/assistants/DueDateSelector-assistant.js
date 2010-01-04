/**
 * @param {Object} config  Has the following parameters:
 *   - task
 *   - controller
 *   - updateTaskDueDisplayFromTask
 */
function DueDateSelectorAssistant(config) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	
	Mojo.Log.info("DueDateSelectorAssistant: Entering");
	
	this.config = config;
	this.dueDateModel = { date: Date.parse(this.config.task.due) };
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
	this.config.controller.setupWidget('TaskDue', task_due_attributes, this.dueDateModel);
	this.config.controller.listen('TaskDue', Mojo.Event.propertyChange, this.handleTaskDueEvent.bind(this));
}

DueDateSelectorAssistant.prototype.handleTaskDueEvent = function(event) {
	Mojo.Log.info("DueDateSelectorAssistant.handleTaskDueEvent: Entering");
	
	var date_str = this.dueDateModel.date.toISOString();
	Mojo.Log.info("DueDateSelectorAssistant.handleTaskDueEvent: Task due date is '" + this.dueDateModel.date
		+ "', parsed as '" + date_str + "'");
	this.config.task.setForPush('due', date_str);
	this.config.updateTaskDueDisplayFromTask(this.config.task);
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
