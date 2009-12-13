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
 * Set this so that the Retrier has tasks to push.
 */
Retrier.prototype.taskListModel = undefined;

/**
 * Fire the next event where possible.
 * Won't do anything if there is ongoing network activity.
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
	else if (!this.rtm.haveNetworkConnectivity) {
		// Can't do anything about this, just have to wait for a connection
		Mojo.Log.info("Retrier.fire: Need an internet connection, but can't take action");
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
