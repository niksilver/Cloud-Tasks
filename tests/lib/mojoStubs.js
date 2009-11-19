var Mojo = {
	Log: {
		info: function() {},
		warn: function() {},
		error: function() {}
	},
	
	_cookie_store: {},
	
	Model: {}
};

Mojo.Model.Cookie = function(id) {
	this._id = id;
};
Mojo.Model.Cookie.prototype = {
	put: function(obj) { Mojo._cookie_store[this._id] = obj; },
	get: function() { return Mojo._cookie_store[this._id]; },
	remove: function() { delete Mojo._cookie_store[this._id]; }
};

var MojoTest = {
	stubAssistant: function(assistant) {
		assistant.controller = function() {};
	}
}

