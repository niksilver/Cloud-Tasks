/**
 * Class which allows the various dependent events to be retried.
 * The events are run in the following independent sequences...
 * 
 * - Connection manager
 *   - Only do this if connection manager not yet defined
 *   - Set up connection manager
 *   
 * - Push changes
 *   - Have an internet connection
 *   - Make sure no on-going network requests for pushing changes
 *   - Be authorised to access the user's Remember The Milk data.
 *   - Have a timeline
 *   - Push local changes
 * 
 * - Pull tasks
 *   - Have an internet connection
 *   - Make sure no on-going network requests for pulling tasks
 *   - Be authorised to access the user's Remember The Milk data.
 *   - Pull tasks and record the latest modified time
 */

/**
 * Create a new retrier.
 * @param {RTM} rtm  The RTM client.
 */
function Retrier(rtm) {
	this.rtm = rtm;
}

/**
 * The constructor function used to create a service request.
 * By default Mojo.Service.Request, but override for testing if needed.
 */
Retrier.prototype.serviceRequestConstructor = Mojo.Service.Request;

/**
 * Set this so that the Retrier has tasks to push
 * and knows what to merge with pulled tasks.
 */
Retrier.prototype.taskListModel = undefined;

/**
 * Override this to respond whenever taskListModel changes.
 */
Retrier.prototype.onTaskListModelChange = function() {};

/**
 * Fire the next event where possible.
 * Won't do anything if there is ongoing network activity.
 */
Retrier.prototype.fire = function() {
	Mojo.Log.info("Retrier.fire: Entering");
	
	this.fireSetUpConnectionManagerSequence();
	this.firePushChangesSequence();
	this.firePullTasksSequence();
}

/**
 * Do necessary work to set up connection manager.
 * Won't do anything if connection manager already set up.
 */
Retrier.prototype.fireSetUpConnectionManagerSequence = function() {
	if (this.rtm.connectionManager) {
		return;
	}
	Mojo.Log.info("Retrier.fire: Setting up connection manager");
	this.rtm.setUpConnectionManager(this.serviceRequestConstructor);
}

Retrier.prototype.firePushChangesSequence = function() {
	if (!this.rtm.haveNetworkConnectivity) {
		// Can't do anything about this, just have to wait for a connection
		Mojo.Log.info("Retrier.fire: Need an internet connection, but can't take action");
	}
	else if (this.rtm.networkRequestsForPushingChanges() > 0) {
		Mojo.Log.info("Retrier.fire: Network requests for pushing changes ongoing, so won't take action");
		return;
	}
	else if (!this.rtm.getToken()) {
		Mojo.Log.info("Retrier.fire: No auth token, can't go further");
	}
	else if (!this.rtm.timeline) {
		Mojo.Log.info("Retrier.fire: Getting timeline");
		this.rtm.createTimeline();
	}
	else if (this.taskListModel) {
		Mojo.Log.info("Retrier.fire: Can push local changes");
		this.rtm.pushLocalChanges(this.taskListModel);
	}
	else {
		Mojo.Log.info("Retrier.fire: No actions to take");
	}
}

Retrier.prototype.firePullTasksSequence = function() {
	if (!this.rtm.haveNetworkConnectivity) {
		// Can't do anything about this, just have to wait for a connection
		Mojo.Log.info("Retrier.firePullTasksSequence: Need an internet connection, but can't take action");
	}
	else if (this.rtm.networkRequestsForPullingTasks() > 0) {
		Mojo.Log.info("Retrier.firePullTasksSequence: Network requests for pulling tasks ongoing, so won't take action");
		return;
	}
	else if (!this.rtm.getToken()) {
		Mojo.Log.info("Retrier.firePullTasksSequence: No auth token, can't go further");
	}
	else {
		Mojo.Log.info("Retrier.firePullTasksSequence: Pulling tasks");
		var inst = this;
		this.rtm.callMethod('rtm.tasks.getList',
			this.getListParameters(),
			function(response) {
				Mojo.Log.info("Retrier.firePullTasksSequence: Response is good");
				var json = response.responseJSON;
				var task_list = TaskListModel.objectToTaskList(json);
				inst.taskListModel.setTaskList(task_list);
				inst.taskListModel.saveTaskList();
				inst.rtm.setLatestModified(inst.taskListModel.getLatestModified());
				inst.onTaskListModelChange();
			},
			function(err_msg) {
				Mojo.Log.info("Retrier.firePullTasksSequence: Error: " + err_msg);
				ErrorHandler.notify(err_msg);
			}
		);

	}
}

Retrier.prototype.getListParameters = function() {
	var params = { filter: 'status:incomplete' };
	if (this.rtm.getLatestModified()) {
		params.last_sync = this.rtm.getLatestModified();
	}
	return params;
}
