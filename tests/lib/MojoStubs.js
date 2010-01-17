// Copyright (C) Nik Silver 2010.
// See licence.txt for terms and conditions not explicitly stated elsewhere.

var Mojo = {
	Log: {
		info: function() {},
		warn: function() {},
		error: function() {}
	},
	
	_cookie_store: {},
	
	Model: {},
	
	Event: {
		send: function() {}
	},
	
	Service: {
		Request: undefined
	}
};

Mojo.Model.Cookie = function(id) {
	this._id = id;
};
Mojo.Model.Cookie.prototype = {
	put: function(obj) {
		if (obj instanceof Object) {
			for (prop in obj) {
				if (obj[prop] instanceof Function) {
					throw new Error("Stub Cookie will not save objects with functions");
				}
			}
		}
		Mojo._cookie_store[this._id] = obj;
	},
	get: function() { return Mojo._cookie_store[this._id]; },
	remove: function() { delete Mojo._cookie_store[this._id]; }
};

Mojo.Model.Cookie.deleteCookieStore = function() {
	Mojo._cookie_store = {};
}

Mojo.Depot = function(options) {
	if (!Mojo.Depot._databases) {
		Mojo.Depot._databases = {};
	}
	if (!Mojo.Depot._databases[options.name]) {
		Mojo.Depot._databases[options.name] = {};
		this._database = Mojo.Depot._databases[options.name];
	}
};

Mojo.Depot.eraseAllDepots = function() {
	Mojo.Depot._databases = {};
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

