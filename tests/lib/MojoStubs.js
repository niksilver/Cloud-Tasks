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

Mojo.Depot = function(options) {
	if (!Mojo.Depot._databases) {
		Mojo.Depot._databases = {};
	}
	if (!Mojo.Depot._databases[options.name]) {
		Mojo.Depot._databases[options.name] = {};
		this._database = Mojo.Depot._databases[options.name];
	}
};

Mojo.Depot.prototype = {
	add: function(key, value, onSuccess, onFailure) {
		this._database[key] = value;
		onSuccess();
	},
	
	get: function(key, onSuccess, onFailure) {
		var value = this._database[key];
		if (value == undefined) {
			onSuccess(null);
		} else {
			onSuccess(value);
		}
	}
};

var MojoTest = {
	stubAssistant: function(assistant) {
		assistant.controller = function() {};
	}
}

