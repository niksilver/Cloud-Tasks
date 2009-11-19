function TaskListAssistant(param_object) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
	Mojo.Log.info("TaskListAssistant: Entering constructor");
	this.rtm = param_object.rtm;
}

TaskListAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	
	Mojo.Log.info("TaskListAssistant.setup: Entering");
	
	/* this.total = 0;
	this.controller.get("count").update(this.total); */
	
	var listInfo = this.getListInfo();
	
	this.controller.setupWidget(listInfo.elementId, listInfo.attributes, listInfo.model);
	
	Mojo.Event.listen(this.controller.get("MyList"), Mojo.Event.listTap, this.handleListTap.bind(this));
	
	this.syncList();
	
}

TaskListAssistant.prototype.getListInfo = function() {
	return {
		attributes: {
			itemTemplate: "TaskList/TaskList-item",
			listTemplate: "TaskList/TaskList-container"
		},
		model: {
			items: [
				{
					name: $L("Shopping - do"),
					date: $L("Today")
				},
				{
					name: $L("MB - Set up project and do stuff over several lines"),
					date: $L("Today")
				},
				{
					name: $L("Write up notes"),
					date: $L("Fri")
				},
				{
					name: $L("Model costs"),
					date: $L("27 Nov")
				}
			]
		},
		elementId: "MyList",
		event: Mojo.Event.listTap,
		handler: this.handleListTap
	};
};

TaskListAssistant.prototype.handleListTap = function(event) {
	/* this.total++;
	this.controller.get("count").update(this.total); */
}

/**
 * Sync the local task list with the one from RTM, if we have authorisation. 
 */
TaskListAssistant.prototype.syncList = function() {
	// TO DO
}

TaskListAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
}


TaskListAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

TaskListAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
