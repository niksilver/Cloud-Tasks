function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	var tools = {
		rtm: new RTM(),
		taskListModel: new TaskListModel()
	};
	this.controller.pushScene("TaskList", tools);
}
