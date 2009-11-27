/**
 * Client library for access to RTM.
 */

function RTM() {
	this._REST_URL = "http://api.rememberthemilk.com/services/rest/";
	this._AUTH_URL = "http://www.rememberthemilk.com/services/auth/";
	this.sharedSecret = Secrets.SHARED_SECRET;
}

RTM.prototype.ajaxRequest = function(url, options) {
	Mojo.Log.info("RTM.ajaxRequest using URL " + url);
	new Ajax.Request(url, options);
}

/** Call an RTM method.
 * @param {Object} method_name  Method name to call
 * @param {Object} param_object  Parameters as an object
 * @param {Object} successCallback   Success callback with the Ajax.Response object
 * @param {Object} failureCallback   Failure callback with an error string
 */
RTM.prototype.callMethod = function(method_name, param_object, successCallback, failureCallback){
	param_object.method = method_name
	var rtm = this;
	var request_params = this.addStandardParams(param_object);
	
	this.ajaxRequest(this._REST_URL + "?" + Object.toQueryString(request_params),
		{
			evalJSON: 'force',
			onSuccess: function(response) {
				var err_msg = rtm.getMethodErrorMessage(response);
				if (err_msg) {
					failureCallback(err_msg);
				}
				else {
					successCallback(response);
				}
			},
			onFailure: function(response) {
				var msg = "HTTP error " + response.status + ": " + response.statusText;
				Mojo.Log.warn(msg);
				failureCallback(msg);
			},
			onException: function(response, ex) {
				var msg = "Exception " + ex.name + ": " + ex.message;
				Mojo.Log.warn(msg);
				failureCallback(msg);
			}
		});
}

/**
 * Take a parameter object and add key/value pairs for
 *     format (JSON),
 *     API key,
 *     API sig, and
 *     auth token (if set).
 * @param {Object} param_object
 */
RTM.prototype.addStandardParams = function(param_object) {
	param_object.format = 'json';
	param_object.api_key = Secrets.API_KEY;
	var token = this.getToken();
	if (token) {
		param_object.auth_token = token;
	}
	param_object.api_sig = this.getAPISig(param_object);
	return param_object;
}

/** Get the URL for authentication with a frob
 * @param {String} frob  The frob to use
 */
RTM.prototype.getAuthURL = function(frob) {
	var params = this.addStandardParams({
		frob: frob,
		perms: 'delete'
	});
	return this._AUTH_URL + '?' + Object.toQueryString(params);
}

/**
 * Form a string error message from a Prototype Response object,
 * if there is an error. Otherwise returns null. 
 * @param {Object} response
 * @return  An error message string, or null.
 */
RTM.prototype.getMethodErrorMessage = function(response) {
	if (response
		&& response.responseJSON
		&& response.responseJSON.rsp
		&& response.responseJSON.rsp.stat
		&& response.responseJSON.rsp.stat == "fail") {
			var err = response.responseJSON.rsp.err;
			if (!err) {
				return "Unknown";
			}
			else {
				return "RTM error " + err.code + ": " + err.msg;
			}
	}
	else {
		return null;
	}
}

RTM.prototype.orderAndConcatenate = function(param_object) {
	var ordered_key_value_pairs = "";
	var keys = Object.keys(param_object);
	var sorted_keys = keys.sort();
	for (var i = 0; i < sorted_keys.length; i++) {
		var key = sorted_keys[i];
		ordered_key_value_pairs += key + param_object[key];
	}
	return ordered_key_value_pairs;
}

RTM.prototype.getAPISig = function(param_object) {
	var ordered_key_value_pairs = this.orderAndConcatenate(param_object);
	ordered_key_value_pairs = this.sharedSecret + ordered_key_value_pairs;
	return MD5(ordered_key_value_pairs);
}

/**
 * Get a frob
 * @param {Object} successCallback  With frob as parameter
 * @param {Object} failureCallBack  With error message as parameter
 */
RTM.prototype.fetchFrob = function(successCallback, failureCallback) {
	this.callMethod(
		'rtm.auth.getFrob',
		{},
		function(response) {
			successCallback(response.responseJSON.rsp.frob);
		},
		function(err_msg) {
			failureCallback(err_msg);
		}
	);
}

/**
 * Get the auth token using a frob, and handle the response in callbacks. 
 * @param {String} frob
 * @param {Function} successCallback  With token as parameter
 * @param {Function} failureCallback  With error message as parameter
 */
RTM.prototype.fetchToken = function(frob, successCallback, failureCallback) {
	this.callMethod(
		'rtm.auth.getToken',
		{ frob: frob },
		function(response) {
			successCallback(response.responseJSON.rsp.auth.token);
		},
		function(err_msg) {
			failureCallback(err_msg);
		}
	);
}

RTM.prototype.setToken = function(token) {
	var token_cookie = new Mojo.Model.Cookie('token');
	token_cookie.put(token);
}

RTM.prototype.getToken = function(token) {
	var token_cookie = new Mojo.Model.Cookie('token');
	return token_cookie.get();
}

RTM.prototype.deleteToken = function(token) {
	var token_cookie = new Mojo.Model.Cookie('token');
	return token_cookie.remove();
}
