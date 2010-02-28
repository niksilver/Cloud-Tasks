// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	var config = {
		rtm: new RTM(),
		taskListModel: new TaskListModel()
	};
	config.rtm.retrier.taskListModel = config.taskListModel;
	//config.taskListModel.eraseTaskList();
	this.controller.pushScene("TaskList", config);
}
