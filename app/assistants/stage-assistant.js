function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	var config = {
		rtm: new RTM(),
		taskListModel: new TaskListModel()
	};
	//config.rtm.createTimeline();
	//config.taskListModel.eraseTaskList();
	this.controller.pushScene("TaskList", config);
}
