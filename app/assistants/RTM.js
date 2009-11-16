/**
 * Client library for access to RTM.
 */

function RTM() {
	this._SERVICE_URL = "http://api.rememberthemilk.com/services/rest/";
	this.sharedSecret = SHARED_SECRET;
}

/** Call an RTM method.
 * @param {Object} method_name  Method name to call
 * @param {Object} param_object  Parameters as an object
 * @param {Object} callback   The Ajax.Response object
 */
RTM.prototype.callMethod = function(method_name, param_object, callback) {

	var request_params = param_object;
	request_params.method = method_name;
	request_params.format = 'json';
	request_params.api_key = API_KEY;
	request_params.api_sig = this.getAPISig(request_params);
	new Ajax.Request(this._SERVICE_URL
		+ "?" + Object.toQueryString(request_params),
		{
			evalJSON: 'force',
			onComplete: function(response) {
				callback(response);
			},
			onException: function(response, ex) {
				Mojo.Log.warn("RTM.callMethod exception " + ex.name + ": " + ex.message);
			}
		});
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

