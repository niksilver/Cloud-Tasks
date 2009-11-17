/**
 * Client library for access to RTM.
 */

function RTM() {
	this._REST_URL = "http://api.rememberthemilk.com/services/rest/";
	this._AUTH_URL = "http://api.rememberthemilk.com/services/auth/";
	this.sharedSecret = SHARED_SECRET;
}

RTM.prototype.ajaxRequest = function(url, options) {
	new Ajax.Request(url, options);
}

/** Call an RTM URL. Automatically added parameters are: format (json), API key and API sig.
 * @param {String} base_url  Base URL to call
 * @param {Object} param_object  Parameters as an object
 * @param {Function} successCallback   Success callback with the Ajax.Response object
 * @param {Function} failureCallback   Failure callback with an error string
 */
RTM.prototype.callURL = function(base_url, param_object, successCallback, failureCallback) {

	var request_params = param_object;
	request_params.format = 'json';
	request_params.api_key = API_KEY;
	request_params.api_sig = this.getAPISig(request_params);
	var rtm = this;
	this.ajaxRequest(base_url + "?" + Object.toQueryString(request_params),
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

/** Call an RTM method.
 * @param {Object} method_name  Method name to call
 * @param {Object} param_object  Parameters as an object
 * @param {Object} successCallback   Success callback with the Ajax.Response object
 * @param {Object} failureCallback   Failure callback with an error string
 */
RTM.prototype.callMethod = function(method_name, param_object, successCallback, failureCallback){
	param_object.method = method_name
	this.callURL(this._REST_URL, param_object, successCallback, failureCallback);
}

/** Call the auth service
 * @param {Object} successCallback   Success callback with the Ajax.Response object
 * @param {Object} failureCallback   Failure callback with an error string
 */
RTM.prototype.callAuth = function(successCallback, failureCallback){
	this.callURL(this._AUTH_URL, {}, successCallback, failureCallback);
}


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
RTM.prototype.getFrob = function(successCallback, failureCallBack) {
	this.callAuth(
		function(response) {
			successCallback(response.responseJSON.rsp.frob);
		},
		function(err_msg) {
			failureCallBack(err_msg);
		}
	);
}
