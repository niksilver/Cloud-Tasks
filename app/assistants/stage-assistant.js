function StageAssistant() {
}

StageAssistant.prototype.setup = function() {
	var rtm = new RTM();
	//this.controller.pushScene("auth");
	this.controller.pushScene("TaskList", {
		rtm: rtm
	});
}
