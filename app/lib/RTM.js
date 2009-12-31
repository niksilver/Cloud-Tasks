/**
 * Client library for access to RTM.
 */

function RTM() {
	this._REST_URL = "http://api.rememberthemilk.com/services/rest/";
	this._AUTH_URL = "http://www.rememberthemilk.com/services/auth/";
	this.sharedSecret = Secrets.SHARED_SECRET;
	this.timeline = null;
	this.haveNetworkConnectivity = false;
	this.connectionManager = undefined;
	this.retrier = new Retrier(this);

	this.numNetworkRequests = {
		total: 0,
		forPushingChanges: 0,
		forPullingTasks: 0,
		forOther: 0
	};
	
	this.methodPurpose = {
		"rtm.auth.getFrob": "forPushingChanges",
		"rtm.auth.getToken": "forPushingChanges",
		"rtm.timelines.create": "forPushingChanges",
		"rtm.tasks.setName": "forPushingChanges",
		"rtm.tasks.setDueDate": "forPushingChanges",
		"rtm.tasks.delete": "forPushingChanges",
		"rtm.tasks.getList": "forPullingTasks"
	};
}

/**
 * The low level ajax call, without any monitoring
 * @param {Object} url  URL to call
 * @param {Object} options  Ajax.Request options
 */
RTM.prototype.rawAjaxRequest = function(url, options) {
	Mojo.Log.info("RTM.rawAjaxRequest using URL " + url);
	new Ajax.Request(url, options);
}

/**
 * An ajax request, which will also ensure network activity is monitored.
 * This wraps rawAjaxRequest().
 * @param {Object} url  URL to call
 * @param {Object} options  Ajax.Request options. May also include a field "rtmMethodPurpose"
 *     which is "forPushingChanges" or "forPullingTasks".
 */
RTM.prototype.ajaxRequest = function(url, options) {
	var orig_on_success = options.onSuccess;
	var orig_on_failure = options.onFailure;
	var wrapped_options = Object.clone(options);
	var inst = this;
	options.onSuccess = function(response) {
		--inst.numNetworkRequests[options.rtmMethodPurpose];
		inst.onNetworkRequestsChange(--inst.numNetworkRequests.total);
		orig_on_success(response);
	};
	options.onFailure = function(response) {
		--inst.numNetworkRequests[options.rtmMethodPurpose];
		inst.onNetworkRequestsChange(--inst.numNetworkRequests.total);
		orig_on_failure(response);
	};
	++inst.numNetworkRequests[options.rtmMethodPurpose];
	this.onNetworkRequestsChange(++this.numNetworkRequests.total);
	this.rawAjaxRequest(url, options);
}

/**
 * This gets called with the current number of live network requests
 * whenever that number changes.
 * This function is meant to be overridden; the default implementation does nothing.
 * @param {Object} count  The current number of network requests.
 */
RTM.prototype.onNetworkRequestsChange = function(count) {};

/**
 * Return the number of network requests currently running.
 */
RTM.prototype.networkRequests = function() {
	return this.numNetworkRequests.total;
}

/**
 * Return the number of network requests for pushing changes currently running.
 */
RTM.prototype.networkRequestsForPushingChanges = function() {
	return this.numNetworkRequests.forPushingChanges;
}

/**
 * Return the number of network requests for pulling tasks currently running.
 */
RTM.prototype.networkRequestsForPullingTasks = function() {
	return this.numNetworkRequests.forPullingTasks;
}

/** Call an RTM method.
 * @param {Object} method_name  Method name to call
 * @param {Object} param_object  Parameters as an object
 * @param {Object} successCallback   Success callback with the Ajax.Response object
 * @param {Object} failureCallback   Failure callback with an error string
 */
RTM.prototype.callMethod = function(method_name, param_object, successCallback, failureCallback){
	param_object.method = method_name
	var request_params = this.addStandardParams(param_object);
	
	this.ajaxRequest(this._REST_URL + "?" + Object.toQueryString(request_params),
		{
			evalJSON: 'force',
			onSuccess: function(response) {
				var err_msg = RTM.getMethodErrorMessage(response);
				if (err_msg) {
					failureCallback(err_msg);
				}
				else {
					//RTM.logGetListResponse(response);
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
			},
			rtmMethodPurpose: this.methodPurpose[method_name] || 'forOther'
		});
}

RTM.logGetListResponse = function() {
	if (method_name == 'rtm.tasks.getList') {
		RTM.logResponse(reponse);
	}
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
RTM.getMethodErrorMessage = function(response) {
	if (!response) {
		return "HTTP error: No response";
	} else if (!response.responseJSON) {
		return "HTTP error: No data";
	} else if (!response.responseJSON.rsp) {
		return "RTM error: No data";
	} else if (!response.responseJSON.rsp.stat) {
		return "RTM error: Missing data";
	}
	if (response.responseJSON.rsp.stat == "fail") {
		var err = response.responseJSON.rsp.err;
		if (!err) {
			return "Unknown RTM error";
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
	Mojo.Event.send(document, 'token-changed', {tokenSet: true});
	this.fireNextEvent();
}

RTM.prototype.getToken = function() {
	var token_cookie = new Mojo.Model.Cookie('token');
	return token_cookie.get();
}

RTM.prototype.deleteToken = function() {
	var token_cookie = new Mojo.Model.Cookie('token');
	token_cookie.remove();
	Mojo.Event.send(document, 'token-changed', {tokenSet: false});
}

RTM.prototype.setLatestModified = function(modified) {
	var modified_cookie = new Mojo.Model.Cookie('latestModified');
	modified_cookie.put(modified);
}

RTM.prototype.getLatestModified = function() {
	var modified_cookie = new Mojo.Model.Cookie('latestModified');
	return modified_cookie.get();
}

RTM.prototype.deleteLatestModified = function() {
	var modified_cookie = new Mojo.Model.Cookie('latestModified');
	modified_cookie.remove();
}

RTM.prototype.createTimeline = function() {
	Mojo.Log.info("RTM.createTimeline: Entering");
	var inst = this;
	this.callMethod("rtm.timelines.create", {},
		function(response) {
			inst.timeline = response.responseJSON.rsp.timeline;
			Mojo.Log.info("RTM.createTimeline: Got timeline '" + inst.timeline + "'");
			inst.fireNextEvent();
		},
		function(err_msg) {
			ErrorHandler.notify(err_msg);
		}
	);
}

/**
 * Push a task's local change to the remote server.
 * If there is is no auth token then nothing will happen.
 * If there is no timeline it won't push the change but will try to get a timeline.
 * If successfully pushed will also mark the task's property as no longer needed for push.
 * @param {Object} task  The TaskModel to be pushed.
 * @param {String} property  Name of property whose change needs to be pushed.
 * @param {Function} successCallback  Takes parameter of Ajax.Response
 * @param {Function} failureCallback  Takes parameter of error message
 */
RTM.prototype.pushLocalChange = function(task, property, successCallback, failureCallback) {
	Mojo.Log.info("RTM.pushLocalChange: Entering with property '" + property
		+ "' for task '" + task.name + "' and property '" + task[property] + "'");
	
	if (!this.getToken()) {
		Mojo.Log.info("RTM.pushLocalChange: No auth token so won't push");
		return;
	}
	
	if (!this.timeline) {
		Mojo.Log.info("RTM.pushLocalChange: No timeline so won't push, but will fire next event which might get it");
		this.createTimeline();
		return;
		// createTimeline will return asynchronously, so we'll have to
		// do the push we wanted some other time.
	}
	
	var method;
	var parameters;
	var augmented_success_callback = function(response) {
		//
		// -------------------------------------------------
		// Bug here: Asynchronous pushes mean the wrong
		// properties get marked not for push. Should
		// probably use a hash instead of an array.
		// Also, what does the task list look like after
		// a deletion has been pushed out?
		// -------------------------------------------------
		//
		task.markNotForPush(property);
		successCallback(response);
	}
	if (property == 'name') {
		method = 'rtm.tasks.setName';
		parameters = {
			list_id: task.listID,
			taskseries_id: task.taskseriesID,
			task_id: task.taskID,
			timeline: this.timeline,
			name: task.name
		};
	}
	else if (property == 'due') {
		method = 'rtm.tasks.setDueDate';
		parameters = {
			list_id: task.listID,
			taskseries_id: task.taskseriesID,
			task_id: task.taskID,
			timeline: this.timeline,
			due: task.due
		};
	}
	else if (property == 'deleted') {
		method = 'rtm.tasks.delete';
		parameters = {
			list_id: task.listID,
			taskseries_id: task.taskseriesID,
			task_id: task.taskID,
			timeline: this.timeline,
		};
	}

	if (method) {
		this.callMethod(method, parameters, augmented_success_callback, failureCallback);
	}
	else {
		Mojo.Log.warn("RTM.pushLocalChange: No method defined for property '" + property + "'");
	}
}

/**
 * Push all the local changes that need pushing from the task list.
 * @param {TaskListModel} task_list_model  TaskListModel object, any of whose tasks might
 *     need local changes pushing.
 */
RTM.prototype.pushLocalChanges = function(task_list_model) {
	Mojo.Log.info("RTM.pushLocalChanges: Entering");
	for (var i = 0; i < task_list_model.getTaskList().length; i++) {
		var task = task_list_model.getTaskList()[i];
		for (var j = 0; j < task.localChanges.length; j++) {
			var property = task.localChanges[j];
			var task_to_change = task;
			this.pushLocalChange(task, property,
				function(response) {
					Mojo.Log.info("RTM.pushLocalChanges: Successfully pushed property '" + property + "' for task named '"
						+ task_to_change.name + "', new value '" + task_to_change.property + "'");
				},
				function(err_msg) {
					Mojo.Log.info("RTM.pushLocalChanges: Failed to push property '" + property + "' for task named '" + task_to_change.name + "'. Error message: " + err_msg);
				}
			);
		}
	}
}

/**
 * See if we are set up to use the remote server.
 * It will be if we have a timeline and a token.
 */
RTM.prototype.isRemoteUseSetUp = function() {
	return this.timeline !== undefined && this.getToken() !== undefined;
}

/**
 * Set up the connection manager which will constantly update
 * the status of this.haveNetworkConnectivity.
 * The resulting connection manager is stored in this.connectionManager.
 * @param {Mojo.Service.Request} serviceRequestConstructor  To create the connection manager.
 */
RTM.prototype.setUpConnectionManager = function(serviceRequestConstructor) {
	Mojo.Log.info("RTM.setUpConnectionManager: Entering");
	var inst = this;
	var connection_manager = new serviceRequestConstructor('palm://com.palm.connectionmanager', {
		method: 'getstatus',
		parameters: {
		   subscribe: true
	   	},
		onSuccess: function(request) {
			// Delay setting the connection manager to give the constructor a change to complete
			setTimeout(function(){
					Mojo.Log.info("RTM.setUpConnectionManager: Success");
					inst.connectionManager = connection_manager;
					inst.setHaveNetworkConnectivity(request.isInternetConnectionAvailable);
					inst.fireNextEvent();
				},
				500);
		},
		onFailure: function() {
			Mojo.Log.warn("RTM.setUpConnectionManager: Failed to make the service request");
			inst.connectionManager = undefined;
		},
		onError: function() {
			Mojo.Log.warn("RTM.setUpConnectionManager: Error received making the service request");
			inst.connectionManager = undefined;
		}
	});
}

/**
 * Set whether or not we have network connectivity. If this is different from before
 * then the change function will then be called.
 * @param {Boolean} haveNetworkConnectivity
 */
RTM.prototype.setHaveNetworkConnectivity = function(haveNetworkConnectivity) {
	Mojo.Log.info("RTM.setHaveNetworkConnectivity: Entering with connectivity = " + haveNetworkConnectivity);
	if (this.haveNetworkConnectivity != haveNetworkConnectivity) {
		this.haveNetworkConnectivity = haveNetworkConnectivity;
		this.onHaveNetworkConnectivityChange(this.haveNetworkConnectivity);
	}
}

/**
 * React to the fact that the status of network connectivity has changed.
 */
RTM.prototype.onHaveNetworkConnectivityChange = function() {
	Mojo.Log.info("RTM.onConnectionManagerStatusChange: Entering");
	if (this.haveNetworkConnectivity) {
		Mojo.Log.info("RTM.onConnectionManagerStatusChange: Firing next event...");
		this.fireNextEvent();
	}
}

/**
 * Fire the next event that's needed.
 */
RTM.prototype.fireNextEvent = function() {
	Mojo.Log.info("RTM.fireNextEvent: Entering");
	this.retrier.fire();
}

/**
 * Reset the mechanism which prevents pull events happening too often.
 */
RTM.prototype.resetPullEventSpacer = function() {
	this.retrier.resetPullEventSpacer();
}

RTM.logResponse = function(response) {
	Mojo.Log.info("RTM.logResponse: Entering");
	var text = response.responseText;
	if (text) {
		for (var i = 0; i < text.length; i += 80) {
			Mojo.Log.info(text.substr(i, 80));
		}
	}
	else {
		Mojo.Log.info("RTM.logResponse: response.responseText not defined");
	}
}
