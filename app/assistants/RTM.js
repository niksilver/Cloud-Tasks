/**
 * Client library for access to RTM.
 */

function RTM() {
	this._SERVICE_URL = "http://api.rememberthemilk.com/services/rest/";
	this.sharedSecret = SHARED_SECRET;
}

RTM.prototype.AjaxRequest = function(url, options) {
	new Ajax.Request(url, options);
}

/** Call an RTM method.
 * @param {Object} method_name  Method name to call
 * @param {Object} param_object  Parameters as an object
 * @param {Object} successCallback   Success callback with the Ajax.Response object
 * @param {Object} failureCallback   Failure callback with an error string
 */
RTM.prototype.callMethod = function(method_name, param_object, successCallback, failureCallback) {

	var request_params = param_object;
	request_params.method = method_name;
	request_params.format = 'json';
	request_params.api_key = API_KEY;
	request_params.api_sig = this.getAPISig(request_params);
	this.AjaxRequest(this._SERVICE_URL
		+ "?" + Object.toQueryString(request_params),
		{
			evalJSON: 'force',
			onSuccess: function(response) {
				successCallback(response);
			},
			onFailure: function(response) {
				var msg = "HTTP error " + response.status + ": " + response.statusText;
				Mojo.log.warn(msg);
				failureCallback(msg);
			},
			onException: function(response, ex) {
				var msg = "RTM.callMethod exception " + ex.name + ": " + ex.message;
				Mojo.Log.warn(msg);
				failureCallback(msg);
			}
		});
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

