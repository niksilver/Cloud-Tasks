/**
 * Class which allows the various dependent events to be retried.
 * The events are, in order:
 *   - Set up connection manager
 *   - Have an internet connection
 *   - Be authorised to access the user's Remember The Milk data.
 *   - Have a timeline
 *   - Push local changes
 */

/**
 * Create a new retrier.
 * @param {RTM} rtm  The RTM client.
 */
Retrier = function(rtm) {
	this.rtm = rtm;
}

/**
 * Fire the next event where possible.
 * Won't do anything if there is ongoing network activity.
 * @param {Object} data  Optional data if necessary. Fields may be:
 *   - taskListModel: A TaskListModel object needed for pushing local changes.
 */
Retrier.prototype.fire = function(data) {
	Mojo.Log.info("Retrier.fire: Entering");
	
	if (this.rtm.networkRequests() > 0) {
		Mojo.Log.info("Retrier.fire: Network requests ongoing, so won't take action");
		return;
	}
	
	if (!this.rtm.connectionManager) {
		Mojo.Log.info("Retrier.fire: Setting up connection manager");
		this.rtm.setUpConnectionManager(Mojo.Service.Request);
	}
	else if (!this.rtm.hasInternetConnectivity) {
		// Can't do anything about this, just have to wait for a connection
		Mojo.Log.info("Retrier.fire: Need an internet connection, but can't take action");
	}
	else if (!this.rtm.getToken()) {
		Mojo.Log.info("Retrier.fire: No auth token, can't go further");
	}
	else if (!data.taskListModel) {
		Mojo.Log.info("Retrier.fire: Could push local changes but no task list model specified");
	}
	else if (data.taskListModel) {
		Mojo.Log.info("Retrier.fire: Push local changes");
		rtm.pushLocalChanges(data.taskListModel);
	}
}
