function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	var config = {
		rtm: new RTM(),
		taskListModel: new TaskListModel()
	};
	this.controller.pushScene("TaskList", config);
}
