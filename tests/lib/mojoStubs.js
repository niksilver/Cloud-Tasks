var Mojo = {
	Log: {
		info: function() {},
		warn: function() {},
		error: function() {}
	}
	
};

var MojoTest = {
	stubAssistant: function(assistant) {
		assistant.controller = function() {};
	}
}

