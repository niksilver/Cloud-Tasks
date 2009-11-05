function SimpleMojoTest() {
};

SimpleMojoTest.prototype.before = function() {
	return Mojo.Test.beforeFinished;
};

SimpleMojoTest.prototype.testFeedListAssistant = function() {
	var fla = new FeedListAssistant();
	Mojo.Log.info("fla is '" + fla + "'");
	// Mojo.requireDefined(fla, "new FeedListAssistant not defined, it's %s", fla);
	fla.setup();
	return Mojo.test.passed;
}

SimpleMojoTest.prototype.xxx_testString = function() {
	Mojo.requireEqual("a", 'a', "The letter is a");
	return Mojo.Test.passed;
}

SimpleMojoTest.prototype.after = function(callback) {
	callback();
}
