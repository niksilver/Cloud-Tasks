/**
 * Client library for access to RTM.
 */

function RTM() {
	this._SERVICE_URL = "http://api.rememberthemilk.com/services/rest/";
}

/** Call an RTM method.
 * @param {Object} method_name  Method name to call
 * @param {Object} param_object  Parameters as an object
 * @param {Object} callback   The Ajax.Response object
 */
RTM.prototype.callMethod = function(method_name, param_object, callback) {

	new Ajax.Request(this._SERVICE_URL
		+ "?method=" + method_name
		+ "&" + Object.toQueryString(param_object)
		+ "&api_key=" + API_KEY
		+ "&format=json",
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
