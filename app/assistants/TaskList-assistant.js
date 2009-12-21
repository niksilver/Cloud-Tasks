function TaskListAssistant(config) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  
	Mojo.Log.info("TaskListAssistant: Entering constructor");
	this.config = config;
	this.rtm = config.rtm;
	this.taskListModel = config.taskListModel;
	this.taskListModel.loadTaskList();
	this.taskListWidgetModel = { items: this.taskListModel.getListOfVisibleTasks() };
	this.rtm.retrier.onTaskListModelChange = this.onTaskListModelChange.bind(this);
	
	this.appMenuModel = {
		visible: true,
		items: [
			{ label: "Sync now", command: 'do-sync', disabled: !this.rtm.getToken() },
			{ label: "Authorise...", command: 'do-authorise' },
			{ label: "Deauthorise", command: 'do-deauthorise', disabled: !this.rtm.getToken() }
		]
	};
	this.setUpAppMenuItemListeners();
}

TaskListAssistant.prototype.setUpAppMenuItemListeners = function() {
	var inst = this;
	Mojo.Event.listen(document, 'token-changed', function(event) {
		Mojo.Log.info("TaskListAssistant.setUpAppMenuItemListeners handler: Entering");
		inst.appMenuModel.items[0].disabled = !event.tokenSet;
		inst.appMenuModel.items[2].disabled = !event.tokenSet;
	})
}

TaskListAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	
	Mojo.Log.info("TaskListAssistant.setup: Entering");

	// Set up the app menu
	
	this.controller.setupWidget(Mojo.Menu.appMenu, {}, this.appMenuModel);	
	
	// Set up the task list

	var listInfo = this.getListInfo();
	this.controller.setupWidget(listInfo.elementId, listInfo.attributes, listInfo.model);
	Mojo.Event.listen(this.controller.get(listInfo.elementId), Mojo.Event.listTap, this.handleListTap.bind(this));
}

TaskListAssistant.prototype.getListInfo = function() {
	return {
		attributes: {
			itemTemplate: "TaskList/TaskList-item",
			listTemplate: "TaskList/TaskList-container",
			formatters: { due: this.taskListModel.dueDateFormatter.bind(this.taskListModel) }
		},
		model: this.taskListWidgetModel,
		elementId: "TaskList",
		event: Mojo.Event.listTap,
		handler: this.handleListTap
	};
};

TaskListAssistant.prototype.handleListTap = function(event) {
	Mojo.Log.info("TaskListAssistant.handleListTap: Entering");
	Mojo.Log.info("TaskListAssistant.handleListTap: event name is '" + event.item.name + "'");
	var task_config = {
		rtm: this.rtm,
		taskListModel: this.taskListModel,
		task: event.item
	};
	Mojo.Controller.stageController.pushScene('EditTask', task_config);
}

TaskListAssistant.prototype.handleCommand = function(event) {
	Mojo.Log.info("TaskListAssistant.handleCommand: Entering");
	if (event.type == Mojo.Event.command) {
		Mojo.Log.info("TaskListAssistant.handleCommand: Event command is '" + event.command + "'");
		switch (event.command) {
			case 'do-authorise':
				Mojo.Log.info("TaskListAssistant.handleCommand: Case do-authorise");
				Mojo.Controller.stageController.pushScene('Auth', this.config);
				break;
			case 'do-deauthorise':
				Mojo.Log.info("TaskListAssistant.handleCommand: Case do-deauthorise");
				this.rtm.deleteToken();
				break;
			case 'do-sync':
				Mojo.Log.info("TaskListAssistant.handleCommand: Case do-sync");
				this.rtm.fireNextEvent();
				break;
			default:
				Mojo.Log.info("TaskListAssistant.handleCommand: Unrecognised event command");
				break;
		}
	}
}

TaskListAssistant.prototype.onTaskListModelChange = function() {
	Mojo.Log.info("TaskListAssistant.onTaskListModelChange: Entering");
	this.taskListWidgetModel.items = this.taskListModel.getListOfVisibleTasks();
	this.controller.modelChanged(this.taskListWidgetModel);
}

TaskListAssistant.prototype.activate = function(returnValue) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	
	Mojo.Log.info("TaskListAssistant.activate: Entering");

	Mojo.Log.info("TaskListAssistant.activate: Firing next event...");
	// This may push local changes, or do what's needed before that.
	this.rtm.fireNextEvent();
	
	if (!this.networkIndicator) {
		this.setUpNetworkIndicator();
	}
	this.updateNetworkIndicator();

	if (!returnValue) {
		Mojo.Log.info("TaskListAssistant.activate: Exiting (no scene return value)");
		return;
	}
	
	if (returnValue.lastScene == 'EditTask'
		&& returnValue.task.localChanges.length > 0) {
		var task = returnValue.task;
		Mojo.Log.info("TaskListAssistant.activate: Task changed");
		if (task.localChanges.indexOf('name') >= 0 || task.localChanges.indexOf('due') >= 0) {
			this.taskListModel.sort();
		}
		this.controller.modelChanged(this.taskListWidgetModel);
		this.taskListModel.saveTaskList();
	}
	else if (returnValue.lastScene == 'Auth') {
		Mojo.Log.info("TaskListAssistant.activate: Returning from Auth");
		this.rtm.fireNextEvent();
	}
	Mojo.Log.info("TaskListAssistant.activate: Exiting");
}

TaskListAssistant.prototype.setUpNetworkIndicator = function(){
	Mojo.Log.info("TaskListAssistant.setUpNetworkIndicator: Entering");
	this.networkIndicator = new NetworkIndicator(this.rtm, this.controller);
	this.rtm.onNetworkRequestsChange = this.networkIndicator.onNetworkRequestsChange.bind(this.networkIndicator);
}

TaskListAssistant.prototype.updateNetworkIndicator = function() {
	Mojo.Log.info("TaskListAssistant.updateNetworkIndicator: Entering");
	this.networkIndicator.onNetworkRequestsChange(this.rtm.networkRequests());
}

TaskListAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

TaskListAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
